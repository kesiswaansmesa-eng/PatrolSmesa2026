import { Student, LateRecord, CounselingEntry, AppRole, UserSession, AppSettings, DEFAULT_SETTINGS, GuruBK, KKK, TimKesiswaan, Major, SchoolClass, UserAccount } from '../types/patrol';
import { INITIAL_STUDENTS, INITIAL_LATE_RECORDS, INITIAL_COUNSELING_ENTRIES, INITIAL_GURU_BK, INITIAL_KKK, INITIAL_TIM_KESISWAAN, MAJORS, INITIAL_CLASSES, INITIAL_ACCOUNTS } from '../data/initialData';

const STORAGE_KEYS = {
  RECORDS: 'patrol_smesa_records_v1',
  STUDENTS: 'patrol_smesa_students_v1',
  COUNSELING: 'patrol_smesa_counseling_v1',
  GURU_BK: 'patrol_smesa_guru_bk_v1',
  KKK: 'patrol_smesa_kkk_v1',
  TIM_KESISWAAN: 'patrol_smesa_tim_kesiswaan_v1',
  MAJORS: 'patrol_smesa_majors_v1',
  CLASSES: 'patrol_smesa_classes_v1',
  ACCOUNTS: 'patrol_smesa_user_accounts_v1',
  ROLE: 'patrol_smesa_role_v1',
  SESSION: 'patrol_smesa_session_v1',
  SETTINGS: 'patrol_smesa_settings_v1',
  SELECTED_MAJOR: 'patrol_smesa_sel_major_v1',
  SELECTED_CLASS: 'patrol_smesa_sel_class_v1',
  THEME: 'patrol_smesa_theme_v1',
};

export type ThemeMode = 'light' | 'dark';

export const getStoredTheme = (): ThemeMode => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw === 'dark' || raw === 'light') return raw;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
};

export const applyTheme = (theme: ThemeMode): void => {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

export const saveStoredTheme = (theme: ThemeMode): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    applyTheme(theme);
  } catch (e) {
    console.error('Failed to save theme to storage', e);
  }
};

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.logoUrl || parsed.logoUrl.includes('placeholder') || parsed.logoUrl.includes('unsplash')) {
      parsed.logoUrl = DEFAULT_SETTINGS.logoUrl;
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to storage', e);
  }
};

export const getStoredSession = (): UserSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const saveStoredSession = (session: UserSession | null): void => {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
      localStorage.setItem(STORAGE_KEYS.ROLE, session.role);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

export const getStoredRecords = (): LateRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredRecords = (records: LateRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to storage', e);
  }
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to storage', e);
  }
};

export const getStoredCounseling = (): CounselingEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUNSELING);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredCounseling = (entries: CounselingEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.COUNSELING, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save counseling logs to storage', e);
  }
};

export const getStoredGuruBK = (): GuruBK[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GURU_BK);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredGuruBK = (items: GuruBK[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GURU_BK, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save Guru BK to storage', e);
  }
};

export const getStoredKKK = (): KKK[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KKK);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredKKK = (items: KKK[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.KKK, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save KKK to storage', e);
  }
};

export const getStoredTimKesiswaan = (): TimKesiswaan[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIM_KESISWAAN);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredTimKesiswaan = (items: TimKesiswaan[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TIM_KESISWAAN, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save Tim Kesiswaan to storage', e);
  }
};

export const getStoredMajors = (): Major[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAJORS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredMajors = (items: Major[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MAJORS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save majors to storage', e);
  }
};

export const getStoredClasses = (): SchoolClass[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredClasses = (items: SchoolClass[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save classes to storage', e);
  }
};

export const getStoredAccounts = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredAccounts = (items: UserAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save accounts to storage', e);
  }
};

export const getStoredRole = (): AppRole => {
  try {
    const role = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (role && ['kesiswaan', 'kepsek', 'kkk', 'walikelas', 'piket'].includes(role)) {
      return role as AppRole;
    }
  } catch (e) {
    // ignore
  }
  return 'kesiswaan';
};

export const saveStoredRole = (role: AppRole): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  } catch (e) {
    // ignore
  }
};

export const resetAllData = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_LATE_RECORDS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.COUNSELING, JSON.stringify(INITIAL_COUNSELING_ENTRIES));
    localStorage.setItem(STORAGE_KEYS.GURU_BK, JSON.stringify(INITIAL_GURU_BK));
    localStorage.setItem(STORAGE_KEYS.KKK, JSON.stringify(INITIAL_KKK));
    localStorage.setItem(STORAGE_KEYS.TIM_KESISWAAN, JSON.stringify(INITIAL_TIM_KESISWAAN));
    localStorage.setItem(STORAGE_KEYS.MAJORS, JSON.stringify(MAJORS));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
  } catch (e) {
    // ignore
  }
};

/**
 * Resets ONLY late records & counseling entries back to empty, leaving all Master Data intact.
 */
export const resetViolationsOnly = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COUNSELING, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to reset violations data', e);
  }
};

/**
 * Completely empties operational and master data records for clean start.
 */
export const wipeAllSystemData = (): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COUNSELING, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify([]));
  } catch (e) {
    console.error('Failed to wipe system data', e);
  }
};

export interface SystemBackupPayload {
  version: string;
  exportedAt: string;
  records: LateRecord[];
  students: Student[];
  counseling: CounselingEntry[];
  guruBK: GuruBK[];
  kkk: KKK[];
  timKesiswaan: TimKesiswaan[];
  majors?: Major[];
  classes?: SchoolClass[];
  accounts?: UserAccount[];
  settings: AppSettings;
}

export const exportSystemBackup = (): void => {
  try {
    const backup: SystemBackupPayload = {
      version: '1.4.0',
      exportedAt: new Date().toISOString(),
      records: getStoredRecords(),
      students: getStoredStudents(),
      counseling: getStoredCounseling(),
      guruBK: getStoredGuruBK(),
      kkk: getStoredKKK(),
      timKesiswaan: getStoredTimKesiswaan(),
      majors: getStoredMajors(),
      classes: getStoredClasses(),
      accounts: getStoredAccounts(),
      settings: getStoredSettings(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    const timeFormatted = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BACKUP_PATROL_SMESA_SMKN1_JEMBER_${timeFormatted}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (e) {
    console.error('Failed to export backup', e);
  }
};

export const restoreSystemBackup = (parsed: any): boolean => {
  try {
    if (!parsed || typeof parsed !== 'object') return false;

    if (Array.isArray(parsed.records)) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(parsed.records));
    }
    if (Array.isArray(parsed.students)) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(parsed.students));
    }
    if (Array.isArray(parsed.counseling)) {
      localStorage.setItem(STORAGE_KEYS.COUNSELING, JSON.stringify(parsed.counseling));
    }
    if (Array.isArray(parsed.guruBK)) {
      localStorage.setItem(STORAGE_KEYS.GURU_BK, JSON.stringify(parsed.guruBK));
    }
    if (Array.isArray(parsed.kkk)) {
      localStorage.setItem(STORAGE_KEYS.KKK, JSON.stringify(parsed.kkk));
    }
    if (Array.isArray(parsed.timKesiswaan)) {
      localStorage.setItem(STORAGE_KEYS.TIM_KESISWAAN, JSON.stringify(parsed.timKesiswaan));
    }
    if (Array.isArray(parsed.majors)) {
      localStorage.setItem(STORAGE_KEYS.MAJORS, JSON.stringify(parsed.majors));
    }
    if (Array.isArray(parsed.classes)) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(parsed.classes));
    }
    if (Array.isArray(parsed.accounts)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(parsed.accounts));
    }
    if (parsed.settings && typeof parsed.settings === 'object') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
    }
    return true;
  } catch (e) {
    console.error('Failed to restore backup', e);
    return false;
  }
};

export const getIndonesianDayName = (dateStr: string): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' => {
  const date = new Date(dateStr);
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday ...
  switch (dayIndex) {
    case 1: return 'Senin';
    case 2: return 'Selasa';
    case 3: return 'Rabu';
    case 4: return 'Kamis';
    case 5: return 'Jumat';
    case 6: return 'Senin'; // fallback
    default: return 'Senin';
  }
};

export const calculateMinutesLate = (timeStr: string, gateClosingTime: string = '07:00'): number => {
  const [hourStr, minuteStr] = timeStr.split(':');
  const h = parseInt(hourStr, 10);
  const m = parseInt(minuteStr, 10);
  if (isNaN(h) || isNaN(m)) return 0;

  const [gateHStr, gateMStr] = (gateClosingTime || '07:00').split(':');
  const gh = parseInt(gateHStr, 10) || 7;
  const gm = parseInt(gateMStr, 10) || 0;

  const currentTotal = h * 60 + m;
  const schoolStart = gh * 60 + gm;
  return Math.max(0, currentTotal - schoolStart);
};

export const formatIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const generateWhatsAppLink = (
  record: LateRecord, 
  student: Student, 
  totalViolations: number,
  schoolName: string = 'SMK NEGERI 1 JEMBER',
  schoolAddress: string = 'Jl. Jambu No.17 Patrang - Jember'
): string => {
  const phone = student.parentPhone.replace(/[^0-9]/g, '');
  const cleanPhone = phone.startsWith('0') ? '62' + phone.slice(1) : phone;

  const text = 
`*PEMBERITAHUAN KETERLAMBATAN SISWA*
*${schoolName.toUpperCase()} (TIM KESISWAAN)*
${schoolAddress}

Kepada Yth.
Bapak/Ibu Wali dari *${student.name}*
Kelas: *${student.className}* (NIS: ${student.nis})

Dengan hormat, kami memberitahukan bahwa ananda tiba di sekolah hari ini:
📅 *Tanggal*: ${formatIndonesianDate(record.date)}
⏰ *Waktu Tiba*: ${record.time} WIB
⏱️ *Keterlambatan*: ${record.minutesLate} menit
⚠️ *Alasan*: ${record.reason}
🛠️ *Sanksi Edukatif*: ${record.sanction}
📊 *Riwayat Keterlambatan*: Ke-${totalViolations} semester ini

Mohon Bapak/Ibu memberikan motivasi dan perhatian agar ananda dapat hadir tepat waktu demi pembentukan kedisiplinan dan karakter kerja siswa SMK.

Terima kasih atas perhatian dan kerja samanya.

_Hormat kami,_
*Tim Kesiswaan ${schoolName}*
_Aplikasi PATROL SMESA_`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

export const exportToCSV = (records: LateRecord[]): string => {
  const headers = [
    'No',
    'Tanggal',
    'Hari',
    'Waktu',
    'Menit Terlambat',
    'NIS',
    'Nama Siswa',
    'Kelas',
    'Jurusan',
    'Semester',
    'Alasan',
    'Sanksi Edukatif',
    'Petugas Pencatat',
    'Status Pembinaan',
    'Notifikasi Ortu',
    'Catatan'
  ];

  const rows = records.map((rec, index) => [
    index + 1,
    rec.date,
    rec.dayOfWeek,
    rec.time,
    rec.minutesLate,
    `"${rec.studentNis}"`,
    `"${rec.studentName}"`,
    `"${rec.className}"`,
    rec.majorId,
    `"${rec.semester}"`,
    `"${rec.reason}"`,
    `"${rec.sanction}"`,
    `"${rec.recordedBy}"`,
    rec.counselingStatus,
    rec.parentNotified ? 'Sudah' : 'Belum',
    `"${(rec.notes || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

export const downloadCSV = (records: LateRecord[], filename = 'Laporan_Keterlambatan_SMKN1_Jember.csv'): void => {
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(exportToCSV(records));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export type DatabaseProvider = 'supabase' | 'firebase' | 'local';

export const getStoredBackendProvider = (): DatabaseProvider => {
  try {
    const raw = localStorage.getItem('patrol_smesa_backend_provider');
    if (raw === 'firebase' || raw === 'local') return raw;
    return 'supabase'; // Default to Supabase as configured
  } catch {
    return 'supabase';
  }
};

export const saveStoredBackendProvider = (provider: DatabaseProvider): void => {
  try {
    localStorage.setItem('patrol_smesa_backend_provider', provider);
  } catch (e) {
    console.error('Failed to save backend provider', e);
  }
};
