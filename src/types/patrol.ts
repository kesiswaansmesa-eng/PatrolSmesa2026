export type MajorId = 'RPL' | 'AKL' | 'MPLB' | 'BD' | 'DKV' | 'KL' | 'HTL';

export interface Major {
  id: MajorId;
  name: string;
  code: string;
  kaprodi: string;
  color: string;
}

export type GradeLevel = 'X' | 'XI' | 'XII';

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  gender: 'L' | 'P';
  majorId: MajorId;
  grade: GradeLevel;
  className: string; // e.g. "X RPL 1", "XI AKL 2"
  parentName: string;
  parentPhone: string; // WhatsApp active
  waliKelas: string;
  avatarUrl?: string;
}

export type LateReason = 
  | 'Bangun kesiangan'
  | 'Ban bocor / Kendaraan mogok'
  | 'Macet lalu lintas (Gladak Kembar / PB Sudirman / Roxy)'
  | 'Mengantar orang tua / adik'
  | 'Hujan lebat / Cuaca buruk'
  | 'Ketinggalan angkutan umum'
  | 'Kendala teknis di perjalanan'
  | 'Membantu pekerjaan rumah'
  | 'Lainnya';

export type EducationalSanction =
  | 'Operasi Semut & Pembersihan Taman Sekolah'
  | 'Literasi & Resume Buku di Perpustakaan'
  | 'Menyanyikan Lagu Kebangsaan & Doa Kedisiplinan'
  | 'Perawatan Tanaman Green House'
  | 'Piket Kebersihan Lingkungan Masjid'
  | 'Pengarahan Khusus Tim Piket Kesiswaan';

export type CounselingLevel = 'Tingkat 1 (Ringan)' | 'Tingkat 2 (Sedang)' | 'Tingkat 3 (Berat)';

export interface GuruBK {
  id: string;
  nip: string;
  name: string;
  phone: string;
  roleTitle: string; // e.g. "Koordinator Guru BK", "Guru BK Kelas X", "Guru BK Kelas XI", "Guru BK Kelas XII"
  specialization?: string;
  email?: string;
  status: 'Aktif' | 'Cuti' | 'Nonaktif';
}

export interface KKK {
  id: string;
  nip: string;
  name: string;
  majorId: MajorId;
  majorName: string;
  phone: string;
  officeRoom?: string; // Ruang Bengkel/Studio/Lab
  email?: string;
  status: 'Aktif' | 'Nonaktif' | 'Cuti';
}

export interface TimKesiswaan {
  id: string;
  nip: string;
  name: string;
  position: string; // e.g. "Waka Kesiswaan", "Koordinator Piket & Tatib", "Pembina OSIS & MPK", "Staf Kedisiplinan"
  phone: string;
  email?: string;
  status: 'Aktif' | 'Nonaktif' | 'Cuti';
}

export interface LateRecord {
  id: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  className: string;
  majorId: MajorId;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (e.g. "07:18")
  minutesLate: number; // e.g. 18 (school starts at 07:00)
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat';
  semester: 'Ganjil 2025/2026' | 'Genap 2025/2026';
  reason: LateReason;
  customReason?: string;
  sanction: EducationalSanction;
  notes?: string;
  recordedBy: string; // e.g. "Bpk. Hendra (Piket Gerbang)"
  counselingStatus: 'Belum Dibina' | 'Sedang Dibina' | 'Selesai Pembinaan';
  parentNotified: boolean;
  createdAt: string;
}

export interface CounselingEntry {
  id: string;
  recordId?: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  level: CounselingLevel;
  counselorName: string;
  counselorRole: 'Guru BK' | 'Tim Kesiswaan' | 'Wali Kelas';
  agreementNotes: string; // Komitmen siswa
  status: 'Selesai' | 'Dalam Pemantauan' | 'Jadwal Temu Orang Tua';
  followUpDate?: string;
}

export type AppRole = 'kesiswaan' | 'kepsek' | 'kkk' | 'bk' | 'walikelas' | 'piket';

export interface UserSession {
  role: AppRole;
  name: string;
  title: string;
  email: string;
}

export interface AppSettings {
  appName: string;
  appShortName: string;
  schoolName: string;
  academicYear: string;
  activeSemester: 'Ganjil' | 'Genap';
  gateClosingTime: string;
  tagline: string;
  schoolAddress: string;
  schoolPhone: string;
  schoolEmail: string;
  schoolWebsite: string;
  principalName: string;
  principalNip: string;
  vicePrincipalName: string;
  vicePrincipalNip: string;
  logoUrl?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'PATROL (Pencatatan & Tracing Keterlambatan Sekolah)',
  appShortName: 'PATROL SMESA',
  schoolName: 'SMK NEGERI 1 JEMBER',
  academicYear: '2025/2026',
  activeSemester: 'Ganjil',
  gateClosingTime: '07:00',
  tagline: 'Catat Cepat • Data Akurat • Pembinaan Tepat',
  schoolAddress: 'Jl. Danau Toba No. 16, Jember, Jawa Timur 68121',
  schoolPhone: '(0331) 337486',
  schoolEmail: 'kesiswaansmesa@gmail.com',
  schoolWebsite: 'smkn1jember.sch.id',
  principalName: 'Drs. H. Sri Handoko, M.Pd.',
  principalNip: '19650312 198903 1 005',
  vicePrincipalName: 'Drs. H. Mulyono, M.Pd.',
  vicePrincipalNip: '19680512 199303 1 008',
  logoUrl: 'https://iili.io/nMvNPFs.md.png',
};

export type ViolationTier = 'ringan' | 'sedang' | 'berat';

export interface ViolationTierInfo {
  tier: ViolationTier;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  barColor: string;
  actionRequired: string;
}

export const getViolationTier = (count: number): ViolationTierInfo => {
  if (count <= 3) {
    return {
      tier: 'ringan',
      label: '1 - 3x (Ringan)',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-700',
      badgeBorder: 'border-emerald-300',
      barColor: 'bg-emerald-500',
      actionRequired: 'Teguran lisan & sanksi edukatif piket',
    };
  }
  if (count <= 6) {
    return {
      tier: 'sedang',
      label: '4 - 6x (Sedang)',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
      badgeBorder: 'border-orange-300',
      barColor: 'bg-orange-500',
      actionRequired: 'Konseling Guru BK & Wali Kelas',
    };
  }
  return {
    tier: 'berat',
    label: '≥ 7x (Berat)',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-300',
    barColor: 'bg-red-600',
    actionRequired: 'Pemanggilan Resmi Orang Tua / SP',
  };
};

export interface FilterOptions {
  searchQuery: string;
  majorId?: string;
  className?: string;
  semester?: string;
  month?: string; // "2026-10", etc.
  dayOfWeek?: string;
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
  counselingStatus?: string;
}
