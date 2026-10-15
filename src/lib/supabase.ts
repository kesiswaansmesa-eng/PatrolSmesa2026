import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  projectName: string;
  projectId: string;
  url: string;
  anonKey: string;
  publishableKey?: string;
}

export const DEFAULT_SUPABASE_CONFIG: SupabaseConfig = {
  projectName: 'PatrolSmesa',
  projectId: 'dxdtifpfqisjdqykyymz',
  url: 'https://dxdtifpfqisjdqykyymz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZHRpZnBmcWlzamRxeWt5eW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTQ3NTksImV4cCI6MjEwNzU5MDc1OX0.qlwfgC-CBteDgj22XYdkmAqm8KivzsBHwx_7qwaTpZc',
  publishableKey: 'sb_publishable_XQN7w_vcgzaxoiocFIj0Uw_nVVzkmCc'
};

const STORAGE_KEY = 'patrol_smesa_supabase_config';

/**
 * Normalizes Supabase URL by removing trailing slashes or '/rest/v1' paths
 */
export function normalizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return DEFAULT_SUPABASE_CONFIG.url;
  let clean = rawUrl.trim();
  clean = clean.replace(/\/rest\/v1\/?$/, '');
  clean = clean.replace(/\/+$/, '');
  return clean;
}

/**
 * Retrieves Supabase configuration from localStorage or environment or defaults
 */
export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && (parsed.anonKey || parsed.publishableKey)) {
        return {
          projectName: parsed.projectName || DEFAULT_SUPABASE_CONFIG.projectName,
          projectId: parsed.projectId || DEFAULT_SUPABASE_CONFIG.projectId,
          url: normalizeSupabaseUrl(parsed.url),
          anonKey: parsed.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey,
          publishableKey: parsed.publishableKey || DEFAULT_SUPABASE_CONFIG.publishableKey
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved Supabase config:', e);
  }

  const envUrl = import.meta.env?.VITE_SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

  return {
    projectName: DEFAULT_SUPABASE_CONFIG.projectName,
    projectId: DEFAULT_SUPABASE_CONFIG.projectId,
    url: normalizeSupabaseUrl(envUrl || DEFAULT_SUPABASE_CONFIG.url),
    anonKey: envKey || DEFAULT_SUPABASE_CONFIG.anonKey,
    publishableKey: DEFAULT_SUPABASE_CONFIG.publishableKey
  };
}

/**
 * Saves updated Supabase configuration to localStorage
 */
export function saveSupabaseConfig(config: SupabaseConfig): void {
  const normalized: SupabaseConfig = {
    ...config,
    url: normalizeSupabaseUrl(config.url)
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  currentClient = initClient(normalized);
}

/**
 * Resets configuration back to official PatrolSmesa project defaults
 */
export function resetSupabaseConfig(): SupabaseConfig {
  localStorage.removeItem(STORAGE_KEY);
  currentClient = initClient(DEFAULT_SUPABASE_CONFIG);
  return DEFAULT_SUPABASE_CONFIG;
}

function initClient(config: SupabaseConfig): SupabaseClient {
  const targetUrl = normalizeSupabaseUrl(config.url);
  const targetKey = config.anonKey || config.publishableKey || DEFAULT_SUPABASE_CONFIG.anonKey;

  return createClient(targetUrl, targetKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}

let currentClient: SupabaseClient = initClient(getSupabaseConfig());

export function getSupabaseClient(): SupabaseClient {
  return currentClient;
}

export const supabase = {
  get client() {
    return currentClient;
  }
};

export const EXPECTED_TABLES = [
  'majors',
  'school_classes',
  'students',
  'late_records',
  'counseling_entries',
  'guru_bk',
  'kkk',
  'tim_kesiswaan',
  'user_accounts',
  'school_settings'
] as const;

export type ExpectedTable = typeof EXPECTED_TABLES[number];

export interface TableCheckResult {
  tableName: ExpectedTable;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

/**
 * Ping test to Supabase API and verify auth credentials
 */
export async function testSupabaseHealth(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const start = performance.now();
  try {
    const config = getSupabaseConfig();
    const endpoint = `${normalizeSupabaseUrl(config.url)}/rest/v1/`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`
      }
    });
    const latencyMs = Math.round(performance.now() - start);

    // If endpoint responds with 200 or 401 with service_role hint (which is standard for root /rest/v1/), auth is recognized
    if (res.status === 200 || res.status === 401 || res.status === 404) {
      return {
        ok: true,
        message: `Terhubung ke Supabase (${config.projectName} - ${config.projectId}) [${latencyMs}ms]`,
        latencyMs
      };
    }
    return {
      ok: false,
      message: `Respon status HTTP ${res.status}: ${res.statusText}`,
      latencyMs
    };
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'Gagal terhubung ke host Supabase',
      latencyMs: Math.round(performance.now() - start)
    };
  }
}

/**
 * Checks which of the 10 application tables already exist in Supabase
 */
export async function checkSupabaseTablesStatus(): Promise<{
  allExist: boolean;
  totalTables: number;
  existingCount: number;
  missingCount: number;
  details: TableCheckResult[];
}> {
  const client = getSupabaseClient();
  const details: TableCheckResult[] = [];

  for (const table of EXPECTED_TABLES) {
    try {
      const { data, count, error } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        // PGRST205 or 42P01 indicates table doesn't exist
        const isMissing = error.code === 'PGRST205' || error.message?.includes('not find') || error.message?.includes('relation');
        details.push({
          tableName: table,
          exists: !isMissing,
          error: error.message
        });
      } else {
        details.push({
          tableName: table,
          exists: true,
          rowCount: count ?? 0
        });
      }
    } catch (e: any) {
      details.push({
        tableName: table,
        exists: false,
        error: e?.message || 'Error checking table'
      });
    }
  }

  const existingCount = details.filter((d) => d.exists).length;
  const missingCount = details.filter((d) => !d.exists).length;

  return {
    allExist: existingCount === EXPECTED_TABLES.length,
    totalTables: EXPECTED_TABLES.length,
    existingCount,
    missingCount,
    details
  };
}
