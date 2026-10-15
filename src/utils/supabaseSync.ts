import { getSupabaseClient, checkSupabaseTablesStatus } from '../lib/supabase';
import {
  LateRecord,
  Student,
  CounselingEntry,
  GuruBK,
  KKK,
  TimKesiswaan,
  Major,
  SchoolClass,
  UserAccount,
  AppSettings,
  DEFAULT_SETTINGS
} from '../types/patrol';
import {
  INITIAL_STUDENTS,
  INITIAL_LATE_RECORDS,
  INITIAL_COUNSELING_ENTRIES,
  INITIAL_GURU_BK,
  INITIAL_KKK,
  INITIAL_TIM_KESISWAAN,
  MAJORS,
  INITIAL_CLASSES,
  INITIAL_ACCOUNTS
} from '../data/initialData';

export interface SupabaseSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  error: string | null;
  tablesReady: boolean;
  missingTables: string[];
}

let syncStatus: SupabaseSyncStatus = {
  isConnected: false,
  isSyncing: false,
  lastSync: null,
  error: null,
  tablesReady: false,
  missingTables: []
};

const statusListeners = new Set<(status: SupabaseSyncStatus) => void>();

function updateStatus(updates: Partial<SupabaseSyncStatus>) {
  syncStatus = { ...syncStatus, ...updates };
  statusListeners.forEach((listener) => {
    try {
      listener(syncStatus);
    } catch (e) {
      console.error('Error in Supabase status listener:', e);
    }
  });
}

export function subscribeSupabaseSyncStatus(listener: (status: SupabaseSyncStatus) => void): () => void {
  statusListeners.add(listener);
  listener(syncStatus);
  return () => {
    statusListeners.delete(listener);
  };
}

export function getSupabaseSyncStatus(): SupabaseSyncStatus {
  return syncStatus;
}

// -------------------------------------------------------------
// Data Mappers: Frontend camelCase <-> Supabase PostgreSQL snake_case
// -------------------------------------------------------------

export function mapMajorToDb(m: Major) {
  return {
    id: m.id,
    name: m.name,
    code: m.code,
    kaprodi: m.kaprodi,
    color: m.color,
    description: m.description || null,
    updated_at: new Date().toISOString()
  };
}

export function mapDbToMajor(row: any): Major {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    kaprodi: row.kaprodi,
    color: row.color,
    description: row.description || ''
  };
}

export function mapClassToDb(c: SchoolClass) {
  return {
    id: c.id,
    name: c.name,
    grade: c.grade,
    major_id: c.majorId,
    wali_kelas: c.waliKelas,
    room: c.room || null,
    updated_at: new Date().toISOString()
  };
}

export function mapDbToClass(row: any): SchoolClass {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    majorId: row.major_id,
    waliKelas: row.wali_kelas,
    room: row.room || ''
  };
}

export function mapStudentToDb(s: Student) {
  return {
    id: s.id,
    nis: s.nis,
    nisn: s.nisn,
    name: s.name,
    gender: s.gender,
    major_id: s.majorId,
    grade: s.grade,
    class_name: s.className,
    parent_name: s.parentName,
    parent_phone: s.parentPhone,
    wali_kelas: s.waliKelas,
    avatar_url: s.avatarUrl || null,
    updated_at: new Date().toISOString()
  };
}

export function mapDbToStudent(row: any): Student {
  return {
    id: row.id,
    nis: row.nis,
    nisn: row.nisn,
    name: row.name,
    gender: row.gender,
    majorId: row.major_id,
    grade: row.grade,
    className: row.class_name,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    waliKelas: row.wali_kelas,
    avatarUrl: row.avatar_url || ''
  };
}

export function mapLateRecordToDb(r: LateRecord) {
  return {
    id: r.id,
    student_id: r.studentId,
    student_nis: r.studentNis,
    student_name: r.studentName,
    class_name: r.className,
    major_id: r.majorId,
    date: r.date,
    time: r.time,
    minutes_late: r.minutesLate || 0,
    day_of_week: r.dayOfWeek,
    semester: r.semester || 'Ganjil 2025/2026',
    reason: r.reason,
    custom_reason: r.customReason || null,
    sanction: r.sanction,
    notes: r.notes || null,
    recorded_by: r.recordedBy,
    counseling_status: r.counselingStatus,
    parent_notified: !!r.parentNotified,
    created_at: r.createdAt || new Date().toISOString()
  };
}

export function mapDbToLateRecord(row: any): LateRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    studentNis: row.student_nis,
    studentName: row.student_name,
    className: row.class_name,
    majorId: row.major_id,
    date: row.date,
    time: row.time,
    minutesLate: row.minutes_late || 0,
    dayOfWeek: row.day_of_week,
    semester: row.semester,
    reason: row.reason,
    customReason: row.custom_reason || undefined,
    sanction: row.sanction,
    notes: row.notes || undefined,
    recordedBy: row.recorded_by,
    counselingStatus: row.counseling_status,
    parentNotified: row.parent_notified,
    createdAt: row.created_at
  };
}

export function mapCounselingToDb(c: CounselingEntry) {
  return {
    id: c.id,
    record_id: c.recordId || null,
    student_id: c.studentId,
    student_name: c.studentName,
    class_name: c.className,
    date: c.date,
    level: c.level,
    counselor_name: c.counselorName,
    counselor_role: c.counselorRole,
    agreement_notes: c.agreementNotes,
    status: c.status,
    follow_up_date: c.followUpDate || null,
    created_at: new Date().toISOString()
  };
}

export function mapDbToCounseling(row: any): CounselingEntry {
  return {
    id: row.id,
    recordId: row.record_id || undefined,
    studentId: row.student_id,
    studentName: row.student_name,
    className: row.class_name,
    date: row.date,
    level: row.level,
    counselorName: row.counselor_name,
    counselorRole: row.counselor_role,
    agreementNotes: row.agreement_notes,
    status: row.status,
    followUpDate: row.follow_up_date || undefined
  };
}

export function mapGuruBKToDb(g: GuruBK) {
  return {
    id: g.id,
    nip: g.nip,
    name: g.name,
    phone: g.phone,
    role_title: g.roleTitle,
    specialization: g.specialization || null,
    email: g.email || null,
    status: g.status
  };
}

export function mapDbToGuruBK(row: any): GuruBK {
  return {
    id: row.id,
    nip: row.nip,
    name: row.name,
    phone: row.phone,
    roleTitle: row.role_title,
    specialization: row.specialization || '',
    email: row.email || '',
    status: row.status
  };
}

export function mapKKKToDb(k: KKK) {
  return {
    id: k.id,
    nip: k.nip,
    name: k.name,
    major_id: k.majorId,
    major_name: k.majorName,
    phone: k.phone,
    office_room: k.officeRoom || null,
    email: k.email || null,
    status: k.status
  };
}

export function mapDbToKKK(row: any): KKK {
  return {
    id: row.id,
    nip: row.nip,
    name: row.name,
    majorId: row.major_id,
    majorName: row.major_name,
    phone: row.phone,
    officeRoom: row.office_room || '',
    email: row.email || '',
    status: row.status
  };
}

export function mapTimKesiswaanToDb(t: TimKesiswaan) {
  return {
    id: t.id,
    nip: t.nip,
    name: t.name,
    position: t.position,
    phone: t.phone,
    email: t.email || null,
    status: t.status
  };
}

export function mapDbToTimKesiswaan(row: any): TimKesiswaan {
  return {
    id: row.id,
    nip: row.nip,
    name: row.name,
    position: row.position,
    phone: row.phone,
    email: row.email || '',
    status: row.status
  };
}

export function mapAccountToDb(a: UserAccount) {
  return {
    id: a.id,
    username: a.username,
    password: a.password,
    name: a.name,
    nip: a.nip || null,
    role: a.role,
    role_title: a.roleTitle,
    email: a.email || null,
    phone: a.phone || null,
    major_id: a.majorId || null,
    class_name: a.className || null,
    status: a.status,
    notes: a.notes || null,
    created_at: a.createdAt || new Date().toISOString(),
    last_login: a.lastLogin || null
  };
}

export function mapDbToAccount(row: any): UserAccount {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    name: row.name,
    nip: row.nip || '',
    role: row.role,
    roleTitle: row.role_title,
    email: row.email || '',
    phone: row.phone || '',
    majorId: row.major_id || undefined,
    className: row.class_name || undefined,
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
    lastLogin: row.last_login || undefined
  };
}

export function mapSettingsToDb(s: AppSettings) {
  return {
    id: 'school_settings',
    app_name: s.appName,
    app_short_name: s.appShortName,
    school_name: s.schoolName,
    academic_year: s.academicYear,
    active_semester: s.activeSemester,
    gate_closing_time: s.gateClosingTime,
    tagline: s.tagline || null,
    school_address: s.schoolAddress || null,
    school_phone: s.schoolPhone || null,
    school_email: s.schoolEmail || null,
    school_website: s.schoolWebsite || null,
    principal_name: s.principalName || null,
    principal_nip: s.principalNip || null,
    vice_principal_name: s.vicePrincipalName || null,
    vice_principal_nip: s.vicePrincipalNip || null,
    logo_url: s.logoUrl || null,
    updated_at: new Date().toISOString()
  };
}

export function mapDbToSettings(row: any): AppSettings {
  return {
    appName: row.app_name || DEFAULT_SETTINGS.appName,
    appShortName: row.app_short_name || DEFAULT_SETTINGS.appShortName,
    schoolName: row.school_name || DEFAULT_SETTINGS.schoolName,
    academicYear: row.academic_year || DEFAULT_SETTINGS.academicYear,
    activeSemester: row.active_semester || DEFAULT_SETTINGS.activeSemester,
    gateClosingTime: row.gate_closing_time || DEFAULT_SETTINGS.gateClosingTime,
    tagline: row.tagline || DEFAULT_SETTINGS.tagline,
    schoolAddress: row.school_address || DEFAULT_SETTINGS.schoolAddress,
    schoolPhone: row.school_phone || DEFAULT_SETTINGS.schoolPhone,
    schoolEmail: row.school_email || DEFAULT_SETTINGS.schoolEmail,
    schoolWebsite: row.school_website || DEFAULT_SETTINGS.schoolWebsite,
    principalName: row.principal_name || DEFAULT_SETTINGS.principalName,
    principalNip: row.principal_nip || DEFAULT_SETTINGS.principalNip,
    vicePrincipalName: row.vice_principal_name || DEFAULT_SETTINGS.vicePrincipalName,
    vicePrincipalNip: row.vice_principal_nip || DEFAULT_SETTINGS.vicePrincipalNip,
    logoUrl: row.logo_url || DEFAULT_SETTINGS.logoUrl
  };
}

// -------------------------------------------------------------
// Core Supabase Persistence Operations
// -------------------------------------------------------------

export async function saveRecordSupabase(record: LateRecord): Promise<void> {
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });
  try {
    const { error } = await client
      .from('late_records')
      .upsert(mapLateRecordToDb(record), { onConflict: 'id' });
    if (error) throw error;
    updateStatus({ isSyncing: false, lastSync: new Date(), error: null });
  } catch (err: any) {
    updateStatus({ isSyncing: false, error: err.message });
    throw err;
  }
}

export async function deleteRecordSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });
  try {
    const { error } = await client.from('late_records').delete().eq('id', id);
    if (error) throw error;
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (err: any) {
    updateStatus({ isSyncing: false, error: err.message });
    throw err;
  }
}

export async function saveRecordsBatchSupabase(records: LateRecord[]): Promise<void> {
  if (records.length === 0) return;
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });
  try {
    const payload = records.map(mapLateRecordToDb);
    const { error } = await client
      .from('late_records')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    updateStatus({ isSyncing: false, lastSync: new Date(), error: null });
  } catch (err: any) {
    updateStatus({ isSyncing: false, error: err.message });
    throw err;
  }
}

export async function saveCounselingSupabase(entry: CounselingEntry): Promise<void> {
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });
  try {
    const { error } = await client
      .from('counseling_entries')
      .upsert(mapCounselingToDb(entry), { onConflict: 'id' });
    if (error) throw error;
    updateStatus({ isSyncing: false, lastSync: new Date(), error: null });
  } catch (err: any) {
    updateStatus({ isSyncing: false, error: err.message });
    throw err;
  }
}

export async function deleteCounselingSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });
  try {
    const { error } = await client.from('counseling_entries').delete().eq('id', id);
    if (error) throw error;
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (err: any) {
    updateStatus({ isSyncing: false, error: err.message });
    throw err;
  }
}

export async function saveStudentsBatchSupabase(students: Student[]): Promise<void> {
  if (students.length === 0) return;
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });
  try {
    const payload = students.map(mapStudentToDb);
    const { error } = await client.from('students').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (err: any) {
    updateStatus({ isSyncing: false, error: err.message });
    throw err;
  }
}

export async function deleteStudentSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('students').delete().eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    console.warn('deleteStudentSupabase error:', err);
  }
}

export async function saveMajorsBatchSupabase(majors: Major[]): Promise<void> {
  if (majors.length === 0) return;
  const client = getSupabaseClient();
  try {
    const payload = majors.map(mapMajorToDb);
    const { error } = await client.from('majors').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    console.warn('saveMajorsBatchSupabase error:', err);
  }
}

export async function deleteMajorSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('majors').delete().eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    console.warn('deleteMajorSupabase error:', err);
  }
}

export async function saveClassesBatchSupabase(classes: SchoolClass[]): Promise<void> {
  if (classes.length === 0) return;
  const client = getSupabaseClient();
  try {
    const payload = classes.map(mapClassToDb);
    const { error } = await client.from('school_classes').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    console.warn('saveClassesBatchSupabase error:', err);
  }
}

export async function deleteClassSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('school_classes').delete().eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    console.warn('deleteClassSupabase error:', err);
  }
}

export async function saveGuruBKBatchSupabase(gurus: GuruBK[]): Promise<void> {
  if (gurus.length === 0) return;
  const client = getSupabaseClient();
  try {
    const payload = gurus.map(mapGuruBKToDb);
    const { error } = await client.from('guru_bk').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    console.warn('saveGuruBKBatchSupabase error:', err);
  }
}

export async function deleteGuruBKSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('guru_bk').delete().eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    console.warn('deleteGuruBKSupabase error:', err);
  }
}

export async function saveKKKBatchSupabase(kkks: KKK[]): Promise<void> {
  if (kkks.length === 0) return;
  const client = getSupabaseClient();
  try {
    const payload = kkks.map(mapKKKToDb);
    const { error } = await client.from('kkk').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    console.warn('saveKKKBatchSupabase error:', err);
  }
}

export async function deleteKKKSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('kkk').delete().eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    console.warn('deleteKKKSupabase error:', err);
  }
}

export async function saveTimKesiswaanBatchSupabase(tims: TimKesiswaan[]): Promise<void> {
  if (tims.length === 0) return;
  const client = getSupabaseClient();
  try {
    const payload = tims.map(mapTimKesiswaanToDb);
    const { error } = await client.from('tim_kesiswaan').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    console.warn('saveTimKesiswaanBatchSupabase error:', err);
  }
}

export async function deleteTimKesiswaanSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('tim_kesiswaan').delete().eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    console.warn('deleteTimKesiswaanSupabase error:', err);
  }
}

export async function saveAccountsBatchSupabase(accounts: UserAccount[]): Promise<void> {
  if (accounts.length === 0) return;
  const client = getSupabaseClient();
  try {
    const payload = accounts.map(mapAccountToDb);
    const { error } = await client.from('user_accounts').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    console.warn('saveAccountsBatchSupabase error:', err);
  }
}

export async function deleteAccountSupabase(id: string): Promise<void> {
  const client = getSupabaseClient();
  try {
    const { error } = await client.from('user_accounts').delete().eq('id', id);
    if (error) throw error;
  } catch (err: any) {
    console.warn('deleteAccountSupabase error:', err);
  }
}

export async function saveSettingsSupabase(settings: AppSettings): Promise<void> {
  const client = getSupabaseClient();
  try {
    const payload = mapSettingsToDb(settings);
    const { error } = await client.from('school_settings').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  } catch (err: any) {
    console.warn('saveSettingsSupabase error:', err);
  }
}

/**
 * Fetch all tables from Supabase
 */
export async function fetchAllSupabaseData(): Promise<{
  records: LateRecord[];
  students: Student[];
  counseling: CounselingEntry[];
  guruBK: GuruBK[];
  kkk: KKK[];
  timKesiswaan: TimKesiswaan[];
  majors: Major[];
  classes: SchoolClass[];
  accounts: UserAccount[];
  settings: AppSettings | null;
} | null> {
  const client = getSupabaseClient();
  try {
    const [
      recordsRes,
      studentsRes,
      counselingRes,
      guruRes,
      kkkRes,
      timRes,
      majorsRes,
      classesRes,
      accountsRes,
      settingsRes
    ] = await Promise.all([
      client.from('late_records').select('*').order('created_at', { ascending: false }),
      client.from('students').select('*'),
      client.from('counseling_entries').select('*').order('created_at', { ascending: false }),
      client.from('guru_bk').select('*'),
      client.from('kkk').select('*'),
      client.from('tim_kesiswaan').select('*'),
      client.from('majors').select('*'),
      client.from('school_classes').select('*'),
      client.from('user_accounts').select('*'),
      client.from('school_settings').select('*').limit(1)
    ]);

    if (recordsRes.error && recordsRes.error.code === 'PGRST205') {
      return null;
    }

    return {
      records: (recordsRes.data || []).map(mapDbToLateRecord),
      students: (studentsRes.data || []).map(mapDbToStudent),
      counseling: (counselingRes.data || []).map(mapDbToCounseling),
      guruBK: (guruRes.data || []).map(mapDbToGuruBK),
      kkk: (kkkRes.data || []).map(mapDbToKKK),
      timKesiswaan: (timRes.data || []).map(mapDbToTimKesiswaan),
      majors: (majorsRes.data || []).map(mapDbToMajor),
      classes: (classesRes.data || []).map(mapDbToClass),
      accounts: (accountsRes.data || []).map(mapDbToAccount),
      settings: settingsRes.data && settingsRes.data.length > 0 ? mapDbToSettings(settingsRes.data[0]) : null
    };
  } catch (e) {
    console.warn('fetchAllSupabaseData error:', e);
    return null;
  }
}

/**
 * Reset and force re-populate entire Supabase database with official SMKN 1 Jember sample data
 */
export async function forceResetToSampleDataSupabase(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });

  try {
    // Check tables first
    const status = await checkSupabaseTablesStatus();
    if (!status.allExist) {
      updateStatus({ isSyncing: false, tablesReady: false, missingTables: status.details.filter(d => !d.exists).map(d => d.tableName) });
      return {
        success: false,
        message: `Tabel belum lengkap di Supabase (${status.missingCount} belum dibuat). Silakan jalankan script SQL di Supabase SQL Editor terlebih dahulu!`
      };
    }

    // 1. Majors
    await saveMajorsBatchSupabase(MAJORS);
    // 2. Classes
    await saveClassesBatchSupabase(INITIAL_CLASSES);
    // 3. Students
    await saveStudentsBatchSupabase(INITIAL_STUDENTS);
    // 4. Late records
    await saveRecordsBatchSupabase(INITIAL_LATE_RECORDS);
    // 5. Counseling
    for (const c of INITIAL_COUNSELING_ENTRIES) {
      await saveCounselingSupabase(c);
    }
    // 6. Guru BK
    await saveGuruBKBatchSupabase(INITIAL_GURU_BK);
    // 7. KKK
    await saveKKKBatchSupabase(INITIAL_KKK);
    // 8. Tim Kesiswaan
    await saveTimKesiswaanBatchSupabase(INITIAL_TIM_KESISWAAN);
    // 9. Accounts
    await saveAccountsBatchSupabase(INITIAL_ACCOUNTS);
    // 10. School Settings
    await saveSettingsSupabase(DEFAULT_SETTINGS);

    updateStatus({
      isConnected: true,
      isSyncing: false,
      lastSync: new Date(),
      error: null,
      tablesReady: true,
      missingTables: []
    });

    return {
      success: true,
      message: 'Seluruh database Supabase berhasil diisi dengan data sampel resmi SMKN 1 Jember!'
    };
  } catch (err: any) {
    updateStatus({ isSyncing: false, error: err.message });
    return {
      success: false,
      message: `Gagal mereset data di Supabase: ${err.message}`
    };
  }
}

/**
 * Wipe operational violations from Supabase
 */
export async function resetViolationsSupabase(): Promise<void> {
  const client = getSupabaseClient();
  updateStatus({ isSyncing: true });
  try {
    await client.from('counseling_entries').delete().neq('id', '---');
    await client.from('late_records').delete().neq('id', '---');
    updateStatus({ isSyncing: false, lastSync: new Date() });
  } catch (e: any) {
    updateStatus({ isSyncing: false, error: e.message });
    throw e;
  }
}

/**
 * Start Supabase Realtime synchronization with live postgres_changes and polling
 */
export interface SupabaseSyncCallbacks {
  onRecordsChange: (records: LateRecord[]) => void;
  onStudentsChange: (students: Student[]) => void;
  onCounselingChange: (entries: CounselingEntry[]) => void;
  onGuruBKChange: (gurus: GuruBK[]) => void;
  onKKKChange: (kkks: KKK[]) => void;
  onTimKesiswaanChange: (tims: TimKesiswaan[]) => void;
  onMajorsChange: (majors: Major[]) => void;
  onClassesChange: (classes: SchoolClass[]) => void;
  onAccountsChange: (accounts: UserAccount[]) => void;
  onSettingsChange: (settings: AppSettings) => void;
}

export function startSupabaseRealtimeSync(callbacks: SupabaseSyncCallbacks): () => void {
  const client = getSupabaseClient();
  let isSubscribed = true;

  const pullLatest = async () => {
    if (!isSubscribed) return;
    try {
      const data = await fetchAllSupabaseData();
      if (!data) return;

      updateStatus({
        isConnected: true,
        lastSync: new Date(),
        error: null,
        tablesReady: true,
        missingTables: []
      });

      if (data.records.length > 0) callbacks.onRecordsChange(data.records);
      if (data.students.length > 0) callbacks.onStudentsChange(data.students);
      if (data.counseling.length > 0) callbacks.onCounselingChange(data.counseling);
      if (data.guruBK.length > 0) callbacks.onGuruBKChange(data.guruBK);
      if (data.kkk.length > 0) callbacks.onKKKChange(data.kkk);
      if (data.timKesiswaan.length > 0) callbacks.onTimKesiswaanChange(data.timKesiswaan);
      if (data.majors.length > 0) callbacks.onMajorsChange(data.majors);
      if (data.classes.length > 0) callbacks.onClassesChange(data.classes);
      if (data.accounts.length > 0) callbacks.onAccountsChange(data.accounts);
      if (data.settings) callbacks.onSettingsChange(data.settings);
    } catch (e: any) {
      console.warn('Supabase pull error:', e);
    }
  };

  // Initial pull
  pullLatest();

  // Setup Postgres Realtime Channel
  const channel = client
    .channel('patrol_smesa_live_channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'late_records' },
      () => pullLatest()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'counseling_entries' },
      () => pullLatest()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'students' },
      () => pullLatest()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'school_classes' },
      () => pullLatest()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'majors' },
      () => pullLatest()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_accounts' },
      () => pullLatest()
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'school_settings' },
      () => pullLatest()
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        updateStatus({ isConnected: true });
      }
    });

  // Polling fallback every 15 seconds to guarantee multi-browser sync even if Realtime is filtered
  const intervalId = setInterval(pullLatest, 15000);

  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
    client.removeChannel(channel);
  };
}

/**
 * Bootstrap Supabase with current local data or initial sample data if Supabase tables are ready & empty
 */
export async function initAndBootstrapSupabaseData(localState: {
  records: LateRecord[];
  students: Student[];
  counseling: CounselingEntry[];
  guruBK: GuruBK[];
  kkk: KKK[];
  timKesiswaan: TimKesiswaan[];
  majors: Major[];
  classes: SchoolClass[];
  accounts: UserAccount[];
  settings: AppSettings;
}): Promise<'seeded_from_local' | 'already_seeded' | 'tables_missing' | 'error'> {
  try {
    const status = await checkSupabaseTablesStatus();
    if (!status.allExist) {
      updateStatus({
        isConnected: true,
        tablesReady: false,
        missingTables: status.details.filter(d => !d.exists).map(d => d.tableName)
      });
      return 'tables_missing';
    }

    updateStatus({
      isConnected: true,
      tablesReady: true,
      missingTables: []
    });

    const client = getSupabaseClient();
    const { count } = await client.from('students').select('*', { count: 'exact', head: true });

    if (!count || count === 0) {
      // Seed from local or default initial data
      await saveMajorsBatchSupabase(localState.majors.length > 0 ? localState.majors : MAJORS);
      await saveClassesBatchSupabase(localState.classes.length > 0 ? localState.classes : INITIAL_CLASSES);
      await saveStudentsBatchSupabase(localState.students.length > 0 ? localState.students : INITIAL_STUDENTS);
      if (localState.records.length > 0) {
        await saveRecordsBatchSupabase(localState.records);
      } else {
        await saveRecordsBatchSupabase(INITIAL_LATE_RECORDS);
      }
      if (localState.counseling.length > 0) {
        for (const c of localState.counseling) await saveCounselingSupabase(c);
      }
      await saveGuruBKBatchSupabase(localState.guruBK.length > 0 ? localState.guruBK : INITIAL_GURU_BK);
      await saveKKKBatchSupabase(localState.kkk.length > 0 ? localState.kkk : INITIAL_KKK);
      await saveTimKesiswaanBatchSupabase(localState.timKesiswaan.length > 0 ? localState.timKesiswaan : INITIAL_TIM_KESISWAAN);
      await saveAccountsBatchSupabase(localState.accounts.length > 0 ? localState.accounts : INITIAL_ACCOUNTS);
      await saveSettingsSupabase(localState.settings);

      return 'seeded_from_local';
    }

    return 'already_seeded';
  } catch (err: any) {
    console.warn('initAndBootstrapSupabaseData notice:', err);
    return 'error';
  }
}
