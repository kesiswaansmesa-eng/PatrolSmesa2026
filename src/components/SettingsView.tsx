import React, { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/patrol';
import { SchoolLogo } from './SchoolLogo';
import { subscribeSyncStatus, CloudSyncStatus, seedInitialDataIfEmpty } from '../utils/firebaseSync';
import { testConnection } from '../lib/firebase';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Building2, 
  Clock, 
  FileText, 
  School, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Phone,
  Mail,
  Globe,
  Sun,
  Moon,
  Palette,
  Database,
  ArrowDownToLine,
  Upload,
  Trash2,
  ShieldAlert,
  Cloud,
  Server,
  Radio,
  RefreshCw,
  HelpCircle,
  Info,
  ExternalLink,
  Layers,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code,
  Download,
  Key,
  ShieldCheck,
  AlertTriangle,
  Play
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSchema';
import { DatabaseProvider, getStoredBackendProvider, saveStoredBackendProvider } from '../utils/storage';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  resetSupabaseConfig, 
  testSupabaseHealth, 
  checkSupabaseTablesStatus, 
  TableCheckResult, 
  DEFAULT_SUPABASE_CONFIG,
  normalizeSupabaseUrl
} from '../lib/supabase';
import { 
  subscribeSupabaseSyncStatus, 
  getSupabaseSyncStatus, 
  forceResetToSampleDataSupabase, 
  SupabaseSyncStatus 
} from '../utils/supabaseSync';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onToast: (msg: string) => void;
  theme?: 'light' | 'dark';
  onSelectTheme?: (theme: 'light' | 'dark') => void;
  onResetViolations?: () => void;
  onWipeAllData?: () => void;
  onResetSampleData?: () => void;
  onBackupData?: () => void;
  onRestoreData?: (file: File) => void;
  onSyncAllToCloud?: () => void;
  backendProvider?: DatabaseProvider;
  onChangeBackendProvider?: (provider: DatabaseProvider) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onToast,
  theme = 'light',
  onSelectTheme,
  onResetViolations,
  onWipeAllData,
  onResetSampleData,
  onBackupData,
  onRestoreData,
  onSyncAllToCloud,
  backendProvider,
  onChangeBackendProvider,
}) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmResetViolations, setConfirmResetViolations] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wipeInput, setWipeInput] = useState('');
  const restoreFileRef = React.useRef<HTMLInputElement>(null);
  
  // Backend database provider state (Default: Supabase)
  const [provider, setProvider] = useState<DatabaseProvider>(backendProvider || getStoredBackendProvider());
  
  // Firebase Sync State
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isConnected: true,
    isSyncing: false,
    lastSync: null,
    error: null,
  });
  const [isPinging, setIsPinging] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  
  // Supabase PostgreSQL State
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseConfig());
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<SupabaseSyncStatus>(getSupabaseSyncStatus());
  const [supabaseHealth, setSupabaseHealth] = useState<{ ok: boolean; message: string; latencyMs?: number } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [tablesCheckDetails, setTablesCheckDetails] = useState<TableCheckResult[]>([]);
  const [isCheckingTables, setIsCheckingTables] = useState(false);
  const [tablesSummary, setTablesSummary] = useState<{ allExist: boolean; totalTables: number; existingCount: number; missingCount: number } | null>(null);
  const [isSeedingSupabase, setIsSeedingSupabase] = useState(false);
  const [showCustomCreds, setShowCustomCreds] = useState(false);
  const [customUrl, setCustomUrl] = useState(supabaseConfig.url);
  const [customAnonKey, setCustomAnonKey] = useState(supabaseConfig.anonKey);
  const [customProjectName, setCustomProjectName] = useState(supabaseConfig.projectName);
  const [customProjectId, setCustomProjectId] = useState(supabaseConfig.projectId);

  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseActiveTab, setSupabaseActiveTab] = useState<'tables' | 'sql' | 'guide'>('tables');
  const [copiedSql, setCopiedSql] = useState(false);
  const [confirmResetSample, setConfirmResetSample] = useState(false);

  React.useEffect(() => {
    const unsubFirebase = subscribeSyncStatus((s) => setSyncStatus(s));
    const unsubSupabase = subscribeSupabaseSyncStatus((s) => setSupabaseSyncStatus(s));
    
    // Auto-check Supabase tables status on load
    checkSupabaseTablesStatus().then((res) => {
      setTablesCheckDetails(res.details);
      setTablesSummary({
        allExist: res.allExist,
        totalTables: res.totalTables,
        existingCount: res.existingCount,
        missingCount: res.missingCount
      });
    }).catch(console.warn);

    return () => {
      unsubFirebase();
      unsubSupabase();
    };
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    onToast('✓ Skema SQL Supabase berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patrol_smkn1_jember_supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast('File patrol_smkn1_jember_supabase_schema.sql berhasil diunduh.');
  };

  const handleSelectProvider = (newProvider: DatabaseProvider) => {
    setProvider(newProvider);
    saveStoredBackendProvider(newProvider);
    onChangeBackendProvider?.(newProvider);
    const label = newProvider === 'supabase' 
      ? 'Supabase (PostgreSQL Cloud)' 
      : newProvider === 'firebase' 
      ? 'Firebase Firestore' 
      : 'Lokal (Offline Browser)';
    onToast(`✓ Database backend aktif dialihkan ke: ${label}`);
  };

  const handleTestSupabaseHealth = async () => {
    setIsTestingSupabase(true);
    onToast(`Menghubungi endpoint Supabase (${supabaseConfig.projectName})...`);
    try {
      const res = await testSupabaseHealth();
      setSupabaseHealth(res);
      if (res.ok) {
        onToast(`✓ Terhubung ke Supabase (${supabaseConfig.projectName}) [${res.latencyMs}ms]`);
      } else {
        onToast(`Peringatan: ${res.message}`);
      }
    } catch (e: any) {
      onToast(`Gagal: ${e?.message || 'Koneksi error'}`);
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCheckTables = async () => {
    setIsCheckingTables(true);
    onToast('Memeriksa keberadaan 10 tabel di database Supabase...');
    try {
      const res = await checkSupabaseTablesStatus();
      setTablesCheckDetails(res.details);
      setTablesSummary({
        allExist: res.allExist,
        totalTables: res.totalTables,
        existingCount: res.existingCount,
        missingCount: res.missingCount
      });
      if (res.allExist) {
        onToast(`✓ Sempurna! Seluruh 10 tabel database Supabase telah siap & aktif.`);
      } else {
        onToast(`Pemberitahuan: ${res.missingCount} tabel belum ditemukan di Supabase. Silakan jalankan script SQL.`);
      }
    } catch (e: any) {
      onToast(`Gagal memeriksa tabel: ${e?.message}`);
    } finally {
      setIsCheckingTables(false);
    }
  };

  const handleSeedToSupabase = async () => {
    setIsSeedingSupabase(true);
    onToast('Mengisi data sampel SMKN 1 Jember ke seluruh tabel Supabase...');
    try {
      const res = await forceResetToSampleDataSupabase();
      if (res.success) {
        onToast(`✓ ${res.message}`);
        // Refresh tables count
        handleCheckTables();
      } else {
        onToast(res.message);
        setShowSupabaseModal(true);
      }
    } catch (e: any) {
      onToast(`Error seeding data: ${e?.message}`);
    } finally {
      setIsSeedingSupabase(false);
    }
  };

  const handleSaveCustomCreds = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      projectName: customProjectName.trim() || DEFAULT_SUPABASE_CONFIG.projectName,
      projectId: customProjectId.trim() || DEFAULT_SUPABASE_CONFIG.projectId,
      url: normalizeSupabaseUrl(customUrl),
      anonKey: customAnonKey.trim(),
    };
    saveSupabaseConfig(updated);
    setSupabaseConfigState(getSupabaseConfig());
    setShowCustomCreds(false);
    onToast('✓ Kredensial Supabase berhasil diperbarui!');
    handleTestSupabaseHealth();
  };

  const handleResetDefaultCreds = () => {
    const def = resetSupabaseConfig();
    setSupabaseConfigState(def);
    setCustomUrl(def.url);
    setCustomAnonKey(def.anonKey);
    setCustomProjectName(def.projectName);
    setCustomProjectId(def.projectId);
    setShowCustomCreds(false);
    onToast('✓ Kredensial Supabase dikembalikan ke default PatrolSmesa!');
    handleTestSupabaseHealth();
  };

  const handlePingDatabase = async () => {
    setIsPinging(true);
    onToast('Menghubungi basis data cloud & memeriksa sinkronisasi realtime...');
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        onToast('✓ Basis data Cloud Firebase terhubung stabil! Sinkronisasi realtime aktif.');
      } else {
        onToast('Sedang menghubungkan ke basis data Firebase...');
      }
    } catch (e: any) {
      onToast('Peringatan: Periksa koneksi internet atau sesi cloud.');
    } finally {
      setIsPinging(false);
    }
  };

  const handleChange = (field: keyof AppSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setHasChanges(false);
    onToast('Konfigurasi aplikasi dan sekolah berhasil disimpan.');
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh pengaturan ke konfigurasi default SMKN 1 Jember?')) {
      setForm(DEFAULT_SETTINGS);
      onSaveSettings(DEFAULT_SETTINGS);
      setHasChanges(false);
      onToast('Pengaturan telah direset ke default.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            <span>Pusat Konfigurasi Sistem</span>
            <span>·</span>
            <span>Kesiswaan &amp; Tata Usaha</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Pengaturan Aplikasi &amp; Profil Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Sesuaikan tema tampilan, nama aplikasi, identitas sekolah, tahun ajaran aktif, batas jam gerbang, dan pejabat pengesahan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
              hasChanges ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Global Theme Selection Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tema Tampilan Aplikasi (Global Light &amp; Dark Mode)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Tersimpan permanen di LocalStorage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Option */}
          <div
            onClick={() => onSelectTheme && onSelectTheme('light')}
            className={`cursor-pointer rounded-xl p-4 border transition-all flex items-start gap-3.5 ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Mode Terang (Light Mode)
                </span>
                {theme === 'light' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tampilan cerah berlatar putih/abu-abu bersih, ideal untuk siang hari dan pencetakan dokumen.
              </p>
            </div>
          </div>

          {/* Dark Mode Option */}
          <div
            onClick={() => onSelectTheme && onSelectTheme('dark')}
            className={`cursor-pointer rounded-xl p-4 border transition-all flex items-start gap-3.5 ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-950/50 ring-2 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xs shrink-0">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Mode Gelap (Dark Mode)
                </span>
                {theme === 'dark' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 border border-blue-500/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tampilan bernuansa gelap nyaman di mata, hemat energi, dan kontras tajam.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Backend Provider & Cloud Integration Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Basis Data Backend Utama (Cloud Storage &amp; Sync)
                </h2>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  provider === 'supabase'
                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : provider === 'firebase'
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}>
                  {provider === 'supabase' ? 'Supabase Aktif' : provider === 'firebase' ? 'Firebase Aktif' : 'Lokal Aktif'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih mesin basis data untuk menyimpan seluruh data pelanggaran, master siswa, kelas, personil BK &amp; akun.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {provider === 'supabase' ? (
              <>
                <button
                  type="button"
                  onClick={handleTestSupabaseHealth}
                  disabled={isTestingSupabase}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isTestingSupabase ? 'Memeriksa...' : 'Test Supabase'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCheckTables}
                  disabled={isCheckingTables}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Layers className={`w-3.5 h-3.5 ${isCheckingTables ? 'animate-spin' : ''}`} />
                  <span>{isCheckingTables ? 'Memeriksa...' : 'Cek 10 Tabel'}</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handlePingDatabase}
                  disabled={isPinging}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                  <span>{isPinging ? 'Memeriksa...' : 'Cek Firebase'}</span>
                </button>
                {onSyncAllToCloud && (
                  <button
                    type="button"
                    onClick={onSyncAllToCloud}
                    disabled={syncStatus.isSyncing}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{syncStatus.isSyncing ? 'Merekam...' : 'Sync ke Firebase'}</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Database Provider Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Option 1: Supabase (Default / Active) */}
          <div
            onClick={() => handleSelectProvider('supabase')}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between gap-3 ${
              provider === 'supabase'
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-500/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-indigo-950 dark:text-indigo-200">
                    Supabase (PostgreSQL)
                  </span>
                  <span className="text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                    Rekomendasi
                  </span>
                </div>
                {provider === 'supabase' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-indigo-900/70 dark:text-indigo-300/70 mt-1 leading-relaxed">
                Basis data relasional SQL berkinerja tinggi. Mendukung 10 tabel terstruktur, foreign key cascade, dan Row Level Security (RLS).
              </p>
            </div>
            <div className="text-[11px] font-mono text-indigo-800 dark:text-indigo-300 bg-white/80 dark:bg-slate-800 p-2 rounded border border-indigo-200/50 dark:border-indigo-800/50">
              Proyek: <strong>PatrolSmesa</strong> (dxdtifpfqisjdqykyymz)
            </div>
          </div>

          {/* Option 2: Firebase Firestore */}
          <div
            onClick={() => handleSelectProvider('firebase')}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between gap-3 ${
              provider === 'firebase'
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 ring-2 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-blue-950 dark:text-blue-200">
                  Firebase (Firestore)
                </span>
                {provider === 'firebase' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-blue-900/70 dark:text-blue-300/70 mt-1 leading-relaxed">
                Penyimpanan cloud dokumen NoSQL Google dengan sinkronisasi listener realtime <code className="text-[11px]">onSnapshot</code>.
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-800 dark:text-blue-300 bg-white/80 dark:bg-slate-800 p-2 rounded border border-blue-200/50 dark:border-blue-800/50">
              Database: <strong>ai-studio-patrolsmkn1jembe</strong>
            </div>
          </div>

          {/* Option 3: Local Storage */}
          <div
            onClick={() => handleSelectProvider('local')}
            className={`cursor-pointer rounded-xl p-4 border transition-all relative flex flex-col justify-between gap-3 ${
              provider === 'local'
                ? 'border-slate-600 dark:border-slate-400 bg-slate-100 dark:bg-slate-800 ring-2 ring-slate-400/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/40'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Lokal (Offline Browser)
                </span>
                {provider === 'local' && (
                  <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Penyimpanan internal pada memori browser komputer saat ini. Bekerja tanpa koneksi internet sama sekali.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
              Penyimpanan: <strong>LocalStorage / IndexedDB</strong>
            </div>
          </div>
        </div>

        {/* Detailed Supabase View (When Supabase is Active) */}
        {provider === 'supabase' && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Supabase Connection Header & Diagnostics */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Konfigurasi Kredensial Supabase Terpasang:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {supabaseHealth && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      supabaseHealth.ok ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {supabaseHealth.ok ? `Ping: ${supabaseHealth.latencyMs}ms` : 'Koneksi Terkendala'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowCustomCreds(!showCustomCreds)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                  >
                    {showCustomCreds ? 'Tutup Edit Kredensial' : 'Ubah / Kustom Kredensial'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Project Name &amp; ID</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {supabaseConfig.projectName} <span className="font-mono font-normal text-slate-500">({supabaseConfig.projectId})</span>
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Project Base URL</div>
                  <div className="font-mono text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {supabaseConfig.url}
                  </div>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Anon Public Key</div>
                  <div className="font-mono text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {supabaseConfig.anonKey.substring(0, 18)}...{supabaseConfig.anonKey.substring(supabaseConfig.anonKey.length - 8)}
                  </div>
                </div>
              </div>

              {/* Inline Form to Edit / Update Supabase Credentials */}
              {showCustomCreds && (
                <form onSubmit={handleSaveCustomCreds} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-3 mt-2">
                  <div className="font-bold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Perbarui Kredensial Proyek Supabase</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={customProjectName}
                        onChange={(e) => setCustomProjectName(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Project ID</label>
                      <input
                        type="text"
                        value={customProjectId}
                        onChange={(e) => setCustomProjectId(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Project URL / REST Endpoint</label>
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Anon / Public API Key (JWT)</label>
                      <input
                        type="text"
                        value={customAnonKey}
                        onChange={(e) => setCustomAnonKey(e.target.value)}
                        className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultCreds}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                    >
                      Kembalikan ke Default PatrolSmesa
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs"
                    >
                      Simpan Kredensial Baru
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Supabase Tables Status Alert & Checklist */}
            <div className={`p-4 rounded-xl border space-y-3 transition-colors ${
              tablesSummary && tablesSummary.allExist
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {tablesSummary && tablesSummary.allExist ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      {tablesSummary && tablesSummary.allExist
                        ? 'Status Tabel Supabase: Seluruh 10 Tabel Telah Aktif & Siap Digunakan'
                        : `Status Tabel Supabase: ${tablesSummary ? tablesSummary.missingCount : 'Beberapa'} Tabel Belum Terdeteksi di Supabase`}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {tablesSummary && tablesSummary.allExist
                        ? 'Data keterlambatan dan master data otomatis disinkronkan langsung ke basis data relasional PostgreSQL Supabase.'
                        : 'Jalankan skema SQL sekali saja di Supabase SQL Editor agar seluruh tabel (majors, students, late_records, dll) terbuat otomatis.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://supabase.com/dashboard/project/${supabaseConfig.projectId}/sql/new`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Supabase SQL Editor</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                  </button>
                </div>
              </div>

              {/* 10 Tables Grid Pills */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="text-[11px] font-semibold text-slate-500 mb-2">
                  Daftar 10 Tabel Relasional PATROL SMKN 1 Jember di Supabase:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { name: 'majors', label: '1. majors (Jurusan)' },
                    { name: 'school_classes', label: '2. school_classes (Kelas)' },
                    { name: 'students', label: '3. students (Siswa)' },
                    { name: 'late_records', label: '4. late_records (Pelanggaran)' },
                    { name: 'counseling_entries', label: '5. counseling (BK)' },
                    { name: 'guru_bk', label: '6. guru_bk (Konselor)' },
                    { name: 'kkk', label: '7. kkk (Kaprodi)' },
                    { name: 'tim_kesiswaan', label: '8. tim_kesiswaan' },
                    { name: 'user_accounts', label: '9. user_accounts (Login)' },
                    { name: 'school_settings', label: '10. school_settings' }
                  ].map((tbl) => {
                    const check = tablesCheckDetails.find((d) => d.tableName === tbl.name);
                    const isReady = check?.exists ?? false;
                    return (
                      <div
                        key={tbl.name}
                        className={`p-2 rounded-lg border text-[11px] flex items-center justify-between ${
                          isReady
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span className="font-mono truncate">{tbl.name}</span>
                        {isReady ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Siap</span>
                        ) : (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">Pending</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Supabase */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSupabaseModal(true)}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Code className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Lihat Struktur DDL &amp; Script SQL</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSql}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unduh File .sql</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSeedToSupabase}
                  disabled={isSeedingSupabase}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Isi seluruh tabel di Supabase dengan data contoh resmi SMKN 1 Jember"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSeedingSupabase ? 'Mengisi Supabase...' : 'Muat / Reset Data Sampel SMKN 1 Jember ke Supabase'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Firebase View (When Firebase is Active) */}
        {provider === 'firebase' && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Penyimpanan Terpusat</div>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Cloud Enterprise Firestore</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Data keterlambatan, akun, dan bimbingan tersimpan aman di server terpusat.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Sinkronisasi Antar Perangkat</div>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Realtime Listener (onSnapshot)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Input dari gerbang piket langsung tampil seketika di dashboard kesiswaan &amp; guru BK.
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Keandalan Offline-First</div>
                <div className="font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Dual Persistence (Cache + Cloud)</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Jika koneksi internet sekolah sempat terputus, aplikasi tetap berjalan lancar tanpa macet.
                </p>
              </div>
            </div>

            {/* Toggleable Firebase Setup & Multi-Device Troubleshooting Guide */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  <span>{showSetupGuide ? 'Sembunyikan Panduan Setup Firebase' : 'Lihat Panduan Setup Firebase & Solusi Sinkronisasi Antar-PC'}</span>
                  {showSetupGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {onSyncAllToCloud && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pindah PC? Klik tombol <span className="font-semibold text-emerald-600 dark:text-emerald-400">"Sinkronkan Semua Data ke Firebase"</span> di atas sebelum berpindah.
                  </span>
                )}
              </div>

              {showSetupGuide && (
                <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-amber-500" />
                      <span>1. Mengapa Data Tersimpan di 1 Browser Tapi Belum Muncul di PC Lain?</span>
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                      <li>
                        <strong>Penyebab Utama:</strong> Browser memiliki ruang penyimpanan lokal (<code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">localStorage</code>) terisolasi. Jika data diinput saat koneksi belum mengirim ke Cloud, data hanya ada di PC pertama.
                      </li>
                      <li>
                        <strong>Solusi:</strong> Klik tombol <strong className="text-emerald-600 dark:text-emerald-400">"Sinkronkan Semua Data ke Firebase"</strong>. Seketika data terunggah ke Cloud Firestore dan PC lain menerima via <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">onSnapshot</code>.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Database Management & Backup Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tata Kelola Basis Data (Backup, Pulihkan &amp; Pembersihan Data)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
            Keamanan Data Sekolah
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Gunakan utilitas di bawah ini untuk mengamankan data dengan mengekspor backup berkala ke komputer / Google Drive, mereset data riwayat keterlambatan di akhir semester, atau memulihkan data dari file cadangan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pt-1">
          {/* Reset Sample Data Button (SMKN 1 Jember) */}
          <button
            type="button"
            onClick={() => setConfirmResetSample(true)}
            className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer ring-1 ring-purple-400/30"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
                <span>Reset Data Sampel</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-200/70 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                SMESA
              </span>
            </div>
            <p className="text-[11px] text-purple-800/80 dark:text-purple-400/80">
              Muat ulang data contoh resmi SMKN 1 Jember (Siswa 7 Jurusan, Kelas, BK &amp; Pelanggaran).
            </p>
          </button>

          {/* Backup Button */}
          <button
            type="button"
            onClick={onBackupData}
            className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-900 dark:text-blue-300">
                Backup Data (JSON)
              </span>
              <ArrowDownToLine className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80">
              Unduh salinan lengkap database sistem ke lokal PC atau Google Drive.
            </p>
          </button>

          {/* Restore Button */}
          <input
            ref={restoreFileRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onRestoreData?.(file);
                if (restoreFileRef.current) restoreFileRef.current.value = '';
              }
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => restoreFileRef.current?.click()}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Pulihkan Data
              </span>
              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Muat kembali data dari file cadangan JSON dan langsung terekam otomatis ke cloud.
            </p>
          </button>

          {/* Reset Violations Only */}
          <button
            type="button"
            onClick={() => setConfirmResetViolations(true)}
            className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300">
                Reset Pelanggaran
              </span>
              <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-45 transition-transform" />
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
              Kosongkan riwayat keterlambatan semester. Master data siswa &amp; guru tetap aman.
            </p>
          </button>

          {/* Wipe All Data */}
          <button
            type="button"
            onClick={() => {
              setWipeInput('');
              setConfirmWipe(true);
            }}
            className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-red-900 dark:text-red-300">
                Hapus Semua Data
              </span>
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-red-800/80 dark:text-red-400/80">
              Pembersihan total sistem untuk inisialisasi ulang tahun ajaran baru.
            </p>
          </button>
        </div>

        {/* Supabase PostgreSQL Database Integration Banner */}
        <div className="mt-4 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 px-2 py-0.5 rounded">
                <Database className="w-3 h-3" /> Supabase (PostgreSQL) Ready
              </span>
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                Skema 10 Tabel Database Terstruktur
              </span>
            </div>
            <p className="text-xs text-indigo-900/70 dark:text-indigo-300/70">
              Disesuaikan untuk tabel program ini: <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">majors</code>, <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">school_classes</code>, <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">students</code>, <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">late_records</code>, <code className="bg-white/80 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-mono">counseling_entries</code>, dll.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Salin skema SQL Supabase ke clipboard"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Salin SQL</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowSupabaseModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Buka Skema Supabase</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Nama Aplikasi & Branding */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                1. Konfigurasi Nama Aplikasi &amp; Tagline
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Panjang Aplikasi
                </label>
                <input
                  type="text"
                  value={form.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Ditampilkan di judul halaman &amp; dokumen resmi
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pendek / Brand Singkatan
                </label>
                <input
                  type="text"
                  value={form.appShortName}
                  onChange={(e) => handleChange('appShortName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Ditampilkan di top bar navbar (e.g. PATROL SMESA)
                </span>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline / Slogan Aplikasi
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Prinsip kerja aplikasi (e.g. Catat Cepat • Data Akurat • Pembinaan Tepat)
              </span>
            </div>

            <div className="text-xs pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                URL Logo Resmi Sekolah / Aplikasi
              </label>
              <div className="flex items-center gap-3">
                <SchoolLogo size={42} src={form.logoUrl} className="p-1 border border-slate-200 rounded-lg bg-slate-50 shrink-0" />
                <div className="flex-1">
                  <input
                    type="url"
                    value={form.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://iili.io/nMvNPFs.md.png"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Logo resmi SMKN 1 Jember telah disetel secara bawaan.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Nama Sekolah, Tahun Ajaran, & Jam Masuk */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <School className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                2. Identitas Sekolah &amp; Tahun Ajaran Aktif
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Ajaran Aktif
                </label>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  placeholder="2025/2026"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Semester Aktif
                </label>
                <select
                  value={form.activeSemester}
                  onChange={(e) => handleChange('activeSemester', e.target.value as 'Ganjil' | 'Genap')}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Waktu Masuk Gerbang (WIB)
                </label>
                <input
                  type="time"
                  value={form.gateClosingTime}
                  onChange={(e) => handleChange('gateClosingTime', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Siswa yang tiba setelah waktu ini akan dihitung menit keterlambatannya
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Kontak & Alamat Sekolah (Untuk Kop Surat) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">
                3. Alamat &amp; Kontak Resmi (Kop Dokumen)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <input
                  type="text"
                  value={form.schoolAddress}
                  onChange={(e) => handleChange('schoolAddress', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={form.schoolPhone}
                  onChange={(e) => handleChange('schoolPhone', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Kesiswaan
                </label>
                <input
                  type="email"
                  value={form.schoolEmail}
                  onChange={(e) => handleChange('schoolEmail', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Website Sekolah
                </label>
                <input
                  type="text"
                  value={form.schoolWebsite}
                  onChange={(e) => handleChange('schoolWebsite', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 4: Pejabat Pengesahan */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                4. Pejabat Pengesahan (Tanda Tangan Surat Resmi &amp; Laporan)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={form.principalName}
                  onChange={(e) => handleChange('principalName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={form.principalNip}
                  onChange={(e) => handleChange('principalNip', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Waka Kesiswaan
                </label>
                <input
                  type="text"
                  value={form.vicePrincipalName}
                  onChange={(e) => handleChange('vicePrincipalName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Waka Kesiswaan
                </label>
                <input
                  type="text"
                  value={form.vicePrincipalNip}
                  onChange={(e) => handleChange('vicePrincipalNip', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Preview Kop &amp; Identitas
              </h3>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                Realtime
              </span>
            </div>

            {/* Preview Banner Header */}
            <div className="p-3 bg-slate-900 rounded-lg text-white space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                Preview Top Bar:
              </div>
              <div className="text-xs font-bold text-white">{form.schoolName}</div>
              <div className="text-[11px] text-amber-400 font-medium">{form.tagline}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                Batas Masuk: {form.gateClosingTime} WIB
              </div>
            </div>

            {/* Preview Kop Surat */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-center text-slate-900">
              <div className="text-[9px] text-slate-400 uppercase font-semibold text-left">
                Preview Kop Surat Dokumen Resmi:
              </div>
              <SchoolLogo size={48} src={form.logoUrl} className="mx-auto" />
              <div className="text-[10px] font-bold uppercase text-slate-700 leading-tight">
                PEMERINTAH PROVINSI JAWA TIMUR<br />
                DINAS PENDIDIKAN
              </div>
              <div className="text-xs font-black uppercase text-slate-950 leading-tight">
                {form.schoolName}
              </div>
              <div className="text-[9px] text-slate-600 leading-tight">
                {form.schoolAddress} • Telp: {form.schoolPhone}
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                {form.schoolWebsite} • {form.schoolEmail}
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-700 flex justify-between font-medium">
                <span>Tahun: {form.academicYear}</span>
                <span>Semester: {form.activeSemester}</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={!hasChanges}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-xs ${
                hasChanges ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog: Reset Violations */}
      {confirmResetViolations && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-600 text-white px-5 py-4 flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Konfirmasi Reset Data Pelanggaran Siswa</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Tindakan ini akan <strong>mengosongkan seluruh catatan keterlambatan</strong> dan riwayat pembinaan di semester ini.
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300 text-[11px]">
                ✓ Master Data Siswa, Guru BK, KKK, dan Pengaturan Profil Sekolah tetap utuh &amp; aman.
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmResetViolations(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetViolations(false);
                  onResetViolations?.();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Ya, Reset Pelanggaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Wipe All Data */}
      {confirmWipe && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-red-300 dark:border-red-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-700 text-white px-5 py-4 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Peringatan Kritis: Hapus Seluruh Data</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed text-red-900 dark:text-red-300 font-semibold">
                Tindakan ini akan mengosongkan seluruh data operasional untuk memulai dari awal bersih!
              </p>
              <p className="text-[11px] text-slate-500">
                Ketik kata <strong>HAPUS</strong> di bawah ini untuk mengonfirmasi:
              </p>
              <input
                type="text"
                value={wipeInput}
                onChange={(e) => setWipeInput(e.target.value)}
                placeholder="Ketik 'HAPUS'"
                className="w-full p-2 border border-red-300 dark:border-red-700 rounded-lg font-mono text-center bg-white dark:bg-slate-800 uppercase tracking-widest text-sm"
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmWipe(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={wipeInput.trim().toUpperCase() !== 'HAPUS'}
                onClick={() => {
                  setConfirmWipe(false);
                  onWipeAllData?.();
                }}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white font-semibold rounded-lg shadow-xs"
              >
                Hapus Semua Data Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Reset ke Data Sampel SMKN 1 Jember */}
      {confirmResetSample && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-purple-200 dark:border-purple-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-200" />
                <h3 className="font-bold text-sm">Muat Ulang Data Sampel SMKN 1 Jember</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmResetSample(false)}
                className="text-purple-200 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Apakah Anda ingin mengembalikan seluruh data sistem ke <strong>Dataset Contoh Resmi SMKN 1 Jember</strong>?
              </p>

              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl p-3.5 space-y-2">
                <div className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Cakupan Data yang Dimuat Ulang:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-purple-950/80 dark:text-purple-300/80 text-[11px]">
                  <li><strong>Siswa Aktif:</strong> Siswa contoh di 7 Konsentrasi Keahlian (RPL, AKL, MPLB, BD, DKV, Kuliner, Perhotelan).</li>
                  <li><strong>Struktur Kelas:</strong> 30+ Rombel kelas X, XI, XII beserta Wali Kelas &amp; Ruangan.</li>
                  <li><strong>Personil Sekolah:</strong> 7 Kaprodi (KKK), Guru BK, dan Tim Kesiswaan lengkap dengan NIP &amp; kontak.</li>
                  <li><strong>Riwayat Keterlambatan:</strong> Catatan pelanggaran gerbang pagi dan komitmen pembinaan BK contoh.</li>
                  <li><strong>Akun Petugas:</strong> Akun admin, piket, dan guru BK.</li>
                </ul>
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-blue-900 dark:text-blue-300 text-[11px] flex items-center gap-2">
                <Cloud className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Data otomatis diperbarui ke LocalStorage dan disinkronkan ke Cloud Firebase secara realtime.</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmResetSample(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetSample(false);
                  onResetSampleData?.();
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ya, Muat Ulang Data Sampel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Skema Database Supabase (PostgreSQL) */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-indigo-200 dark:border-indigo-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-5 py-4 flex items-center justify-between shrink-0 border-b border-indigo-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base">Skema Tabel Database Supabase (PostgreSQL)</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      10 Tabel DDL
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/70">
                    Struktur tabel relasional, foreign keys, indeks &amp; seed data yang disesuaikan untuk PATROL SMKN 1 Jember
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSupabaseModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                &times;
              </button>
            </div>

            {/* Modal Sub-navigation Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSupabaseActiveTab('tables')}
                className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  supabaseActiveTab === 'tables'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Daftar 10 Tabel &amp; Kolom</span>
              </button>
              <button
                type="button"
                onClick={() => setSupabaseActiveTab('sql')}
                className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  supabaseActiveTab === 'sql'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Script SQL Lengkap (DDL)</span>
              </button>
              <button
                type="button"
                onClick={() => setSupabaseActiveTab('guide')}
                className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                  supabaseActiveTab === 'guide'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Panduan Setup Supabase</span>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {supabaseActiveTab === 'tables' && (
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl text-slate-700 dark:text-slate-300 text-xs">
                    Berikut adalah pemetaan <strong>10 Tabel Utama</strong> pada program PATROL SMKN 1 Jember jika diimplementasikan menggunakan basis data relasional PostgreSQL di Supabase:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs font-mono">1. public.majors</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Master Data</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Tabel Konsentrasi Keahlian: RPL, AKL, MPLB, BD, DKV, Kuliner, Perhotelan.</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>id (PK, varchar 20)</div>
                        <div>name, code, kaprodi, color, description</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs font-mono">2. public.school_classes</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Master Data</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Rombongan belajar siswa (X RPL 1, XI AKL 2, dll) berelasi dengan jurusan.</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>id (PK), name, grade (X/XI/XII)</div>
                        <div>major_id (FK -&gt; majors.id), wali_kelas, room</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs font-mono">3. public.students</span>
                        <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded">Inti Siswa</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Data seluruh siswa SMKN 1 Jember hasil import Excel/CSV.</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>id (PK), nis (UNIQUE), nisn (UNIQUE), name, gender</div>
                        <div>major_id (FK), grade, class_name, parent_name, parent_phone, wali_kelas</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-600 dark:text-rose-400 text-xs font-mono">4. public.late_records</span>
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded">Transaksi Piket</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Pencatatan pelanggaran keterlambatan di gerbang sekolah.</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>id (PK), student_id (FK -&gt; students.id), date, time</div>
                        <div>minutes_late, reason, sanction, recorded_by, counseling_status</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-600 dark:text-purple-400 text-xs font-mono">5. public.counseling_entries</span>
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">Layanan BK</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Catatan pembinaan siswa oleh Guru BK, Wali Kelas, dan Tim Kesiswaan.</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>id (PK), record_id (FK), student_id (FK), date, level</div>
                        <div>counselor_name, agreement_notes, status, follow_up_date</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs font-mono">6. public.guru_bk &amp; kkk</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Master Petugas</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Data Guru Bimbingan Konseling dan Ketua Konsentrasi Keahlian (Kaprodi).</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>guru_bk: id, nip, name, phone, role_title, status</div>
                        <div>kkk: id, nip, name, major_id (FK), phone, office_room</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs font-mono">7. public.tim_kesiswaan</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Kesiswaan</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Waka Kesiswaan, staf tata tertib, dan pembina OSIS/MPK.</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>id (PK), nip, name, position, phone, email, status</div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs font-mono">8. public.user_accounts &amp; settings</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">Konfigurasi</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">Akun login aplikasi &amp; identitas resmi profil sekolah SMKN 1 Jember.</p>
                      <div className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 space-y-0.5 text-slate-700 dark:text-slate-300">
                        <div>user_accounts: id, username, password, role, name</div>
                        <div>school_settings: app_name, gate_closing_time, principal_name</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {supabaseActiveTab === 'sql' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                      Salin script SQL ini dan paste langsung di menu <strong>SQL Editor</strong> dashboard Supabase Anda:
                    </span>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-96 border border-slate-800 selection:bg-indigo-500 selection:text-white">
                      {SUPABASE_SQL_SCHEMA}
                    </pre>
                  </div>
                </div>
              )}

              {supabaseActiveTab === 'guide' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-900 dark:text-emerald-300 text-xs">
                    <strong>Langkah Praktis Menjalankan Database di Supabase:</strong>
                  </div>

                  <ol className="list-decimal pl-5 space-y-3 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    <li>
                      <strong>Buat Project Baru di Supabase:</strong>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Buka <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">supabase.com</a>, login, dan klik <em>New Project</em>. Beri nama misalnya <code>patrol-smkn1-jember</code> dan pilih region <strong>Singapore (ap-southeast-1)</strong> untuk latency tercepat ke Indonesia.
                      </p>
                    </li>
                    <li>
                      <strong>Buka Fitur SQL Editor:</strong>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Di menu bilah kiri dashboard Supabase, klik ikon <strong>SQL Editor</strong>, lalu klik <strong>New Query</strong>.
                      </p>
                    </li>
                    <li>
                      <strong>Jalankan Script SQL:</strong>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Salin script SQL dari tab <em>Script SQL Lengkap (DDL)</em> di atas, tempelkan ke editor Supabase, lalu klik tombol hijau <strong>RUN</strong> di pojok kanan bawah editor (atau tekan <code>Ctrl + Enter</code>).
                      </p>
                    </li>
                    <li>
                      <strong>Hasil Eksekusi:</strong>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Seketika 10 tabel relasional, foreign keys, indeks, dan keamanan Row Level Security (RLS) serta data contoh SMKN 1 Jember telah aktif siap pakai di menu <strong>Table Editor</strong> Supabase!
                      </p>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 text-xs">
              <span className="text-[11px] text-slate-500">
                Aplikasi PATROL SMKN 1 Jember · Kompatibel Supabase / PostgreSQL
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="px-3 py-1.5 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Unduh File .sql</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSupabaseModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
