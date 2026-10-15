/**
 * Skema Database PostgreSQL untuk Supabase
 * Disesuaikan khusus dengan seluruh tabel & jenis data pada aplikasi PATROL SMKN 1 Jember
 */

export const SUPABASE_SQL_SCHEMA = `-- =====================================================================
-- DATABASE PATROL SMKN 1 JEMBER (SUPABASE / POSTGRESQL SCHEMA)
-- Aplikasi: PATROL (Pencatatan & Tracing Keterlambatan Siswa)
-- Sekolah: SMK NEGERI 1 JEMBER
-- Tanggal Pembuatan: 2025/2026
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 2. TABEL 1: majors (Konsentrasi Keahlian / Program Keahlian)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.majors (
    id VARCHAR(20) PRIMARY KEY, -- RPL, AKL, MPLB, BD, DKV, KL, HTL
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL,
    kaprodi VARCHAR(150) NOT NULL,
    color VARCHAR(20) NOT NULL DEFAULT '#2563EB',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 3. TABEL 2: school_classes (Rombongan Belajar / Kelas Siswa)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.school_classes (
    id VARCHAR(50) PRIMARY KEY, -- cls-x-rpl-1, etc.
    name VARCHAR(50) NOT NULL, -- X RPL 1, XI AKL 2, etc.
    grade VARCHAR(10) NOT NULL CHECK (grade IN ('X', 'XI', 'XII')),
    major_id VARCHAR(20) NOT NULL REFERENCES public.majors(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    wali_kelas VARCHAR(150) NOT NULL,
    room VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 4. TABEL 3: students (Master Data Siswa SMKN 1 Jember)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(50) PRIMARY KEY, -- std-101
    nis VARCHAR(20) NOT NULL UNIQUE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    gender VARCHAR(5) NOT NULL CHECK (gender IN ('L', 'P')),
    major_id VARCHAR(20) NOT NULL REFERENCES public.majors(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    grade VARCHAR(10) NOT NULL CHECK (grade IN ('X', 'XI', 'XII')),
    class_name VARCHAR(50) NOT NULL,
    parent_name VARCHAR(150) NOT NULL,
    parent_phone VARCHAR(30) NOT NULL, -- Nomor WhatsApp aktif
    wali_kelas VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 5. TABEL 4: late_records (Pencatatan Keterlambatan di Gerbang)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.late_records (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE,
    student_nis VARCHAR(20) NOT NULL,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    major_id VARCHAR(20) NOT NULL REFERENCES public.majors(id) ON UPDATE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time VARCHAR(10) NOT NULL, -- HH:mm (cth: '07:18')
    minutes_late INTEGER NOT NULL DEFAULT 0,
    day_of_week VARCHAR(20) NOT NULL CHECK (day_of_week IN ('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat')),
    semester VARCHAR(50) NOT NULL DEFAULT 'Ganjil 2025/2026',
    reason VARCHAR(150) NOT NULL,
    custom_reason TEXT,
    sanction VARCHAR(150) NOT NULL,
    notes TEXT,
    recorded_by VARCHAR(150) NOT NULL,
    counseling_status VARCHAR(50) NOT NULL DEFAULT 'Belum Dibina' CHECK (counseling_status IN ('Belum Dibina', 'Sedang Dibina', 'Selesai Pembinaan')),
    parent_notified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 6. TABEL 5: counseling_entries (Bimbingan Konseling Siswa)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.counseling_entries (
    id VARCHAR(50) PRIMARY KEY,
    record_id VARCHAR(50) REFERENCES public.late_records(id) ON UPDATE CASCADE ON DELETE SET NULL,
    student_id VARCHAR(50) NOT NULL REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE,
    student_name VARCHAR(150) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    level VARCHAR(50) NOT NULL CHECK (level IN ('Tingkat 1 (Ringan)', 'Tingkat 2 (Sedang)', 'Tingkat 3 (Berat)')),
    counselor_name VARCHAR(150) NOT NULL,
    counselor_role VARCHAR(50) NOT NULL CHECK (counselor_role IN ('Guru BK', 'Tim Kesiswaan', 'Wali Kelas')),
    agreement_notes TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Selesai', 'Dalam Pemantauan', 'Jadwal Temu Orang Tua')),
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 7. TABEL 6: guru_bk (Master Data Guru Bimbingan Konseling)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.guru_bk (
    id VARCHAR(50) PRIMARY KEY,
    nip VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Cuti', 'Nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 8. TABEL 7: kkk (Ketua Konsentrasi Keahlian / Kaprodi)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.kkk (
    id VARCHAR(50) PRIMARY KEY,
    nip VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    major_id VARCHAR(20) NOT NULL REFERENCES public.majors(id) ON UPDATE CASCADE,
    major_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    office_room VARCHAR(100),
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Cuti', 'Nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 9. TABEL 8: tim_kesiswaan (Staf & Tim Kesiswaan SMKN 1 Jember)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tim_kesiswaan (
    id VARCHAR(50) PRIMARY KEY,
    nip VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    position VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Cuti', 'Nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 10. TABEL 9: user_accounts (Akun Login Aplikasi PATROL)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(150) NOT NULL,
    nip VARCHAR(50),
    role VARCHAR(30) NOT NULL CHECK (role IN ('kesiswaan', 'kepsek', 'kkk', 'bk', 'walikelas', 'piket')),
    role_title VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(30),
    major_id VARCHAR(20) REFERENCES public.majors(id),
    class_name VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- =====================================================================
-- 11. TABEL 10: school_settings (Konfigurasi Profil Sekolah)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.school_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'school_settings',
    app_name VARCHAR(150) NOT NULL,
    app_short_name VARCHAR(50) NOT NULL,
    school_name VARCHAR(150) NOT NULL,
    academic_year VARCHAR(30) NOT NULL,
    active_semester VARCHAR(20) NOT NULL CHECK (active_semester IN ('Ganjil', 'Genap')),
    gate_closing_time VARCHAR(10) NOT NULL DEFAULT '07:00',
    tagline VARCHAR(255),
    school_address TEXT,
    school_phone VARCHAR(50),
    school_email VARCHAR(100),
    school_website VARCHAR(100),
    principal_name VARCHAR(150),
    principal_nip VARCHAR(50),
    vice_principal_name VARCHAR(150),
    vice_principal_nip VARCHAR(50),
    logo_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- 12. INDEXES (Performa Pencarian & Filter Cepat)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_late_records_student_id ON public.late_records(student_id);
CREATE INDEX IF NOT EXISTS idx_late_records_date ON public.late_records(date);
CREATE INDEX IF NOT EXISTS idx_late_records_major_id ON public.late_records(major_id);
CREATE INDEX IF NOT EXISTS idx_late_records_class ON public.late_records(class_name);
CREATE INDEX IF NOT EXISTS idx_students_major ON public.students(major_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_name);
CREATE INDEX IF NOT EXISTS idx_students_nis ON public.students(nis);
CREATE INDEX IF NOT EXISTS idx_counseling_student_id ON public.counseling_entries(student_id);

-- =====================================================================
-- 13. ROW LEVEL SECURITY (RLS) UNTUK SUPABASE
-- =====================================================================
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.late_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counseling_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guru_bk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kkk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tim_kesiswaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;

-- Izinkan akses read/write publik/authenticated untuk operasional aplikasi
CREATE POLICY "Akses Terbuka Majors" ON public.majors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka Classes" ON public.school_classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka Students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka Late Records" ON public.late_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka Counseling" ON public.counseling_entries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka Guru BK" ON public.guru_bk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka KKK" ON public.kkk FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka Tim Kesiswaan" ON public.tim_kesiswaan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka User Accounts" ON public.user_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Terbuka School Settings" ON public.school_settings FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- 14. SEED DATA CONTOH SMKN 1 JEMBER (CONTOH AWAL)
-- =====================================================================

-- Seed Jurusan / Konsentrasi Keahlian
INSERT INTO public.majors (id, name, code, kaprodi, color, description) VALUES
('RPL', 'Pengembangan Perangkat Lunak & Gim (PPLG/RPL)', 'RPL', 'Ir. Budi Santoso, S.Kom., M.T.', '#2563EB', 'Fokus rekayasa perangkat lunak, sistem web, mobile & gim multimedia'),
('AKL', 'Akuntansi dan Keuangan Lembaga', 'AKL', 'Dra. Sri Wahyuni, M.Pd.', '#059669', 'Fokus akuntansi perbankan, perpajakan, audit & laporan keuangan'),
('MPLB', 'Manajemen Perkantoran & Layanan Bisnis', 'MPLB', 'Hj. Siti Aminah, S.Pd., M.M.', '#D97706', 'Fokus kearsipan digital, kesekretariatan & otomasi administrasi'),
('BD', 'Bisnis Digital & Pemasaran', 'BD', 'Agus Purnomo, S.E., M.M.', '#7C3AED', 'Fokus digital marketing, e-commerce & ritel modern'),
('DKV', 'Desain Komunikasi Visual', 'DKV', 'Rendra Wijaya, S.Sn., M.Ds.', '#DB2777', 'Fokus grafis, videografi, animasi 2D/3D & periklanan visual'),
('KL', 'Kuliner (Tata Boga)', 'KL', 'Dewi Lestari, S.Pd.', '#EA580C', 'Fokus tata hidang internasional, pastry, bakery & kuliner nusantara'),
('HTL', 'Perhotelan', 'HTL', 'Fajar Hidayat, S.ST.Par.', '#0891B2', 'Fokus front office edotel, housekeeping & hospitalitas pariwisata')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, kaprodi = EXCLUDED.kaprodi;

-- Seed Settings Profil Sekolah
INSERT INTO public.school_settings (
    id, app_name, app_short_name, school_name, academic_year, active_semester,
    gate_closing_time, tagline, school_address, school_phone, school_email, school_website,
    principal_name, principal_nip, vice_principal_name, vice_principal_nip, logo_url
) VALUES (
    'school_settings',
    'PATROL (Pencatatan & Tracing Keterlambatan Sekolah)',
    'PATROL SMESA',
    'SMK NEGERI 1 JEMBER',
    '2025/2026',
    'Ganjil',
    '07:00',
    'Catat Cepat • Data Akurat • Pembinaan Tepat',
    'Jl. Jambu No.17 Patrang - Jember',
    '(0331) 337486',
    'kesiswaansmesa@gmail.com',
    'smkn1jember.sch.id',
    'Drs. H. Sri Handoko, M.Pd.',
    '19650312 198903 1 005',
    'Drs. H. Mulyono, M.Pd.',
    '19680512 199303 1 008',
    'https://iili.io/nMvNPFs.md.png'
) ON CONFLICT (id) DO NOTHING;

-- Seed Siswa Contoh
INSERT INTO public.students (id, nis, nisn, name, gender, major_id, grade, class_name, parent_name, parent_phone, wali_kelas) VALUES
('std-101', '23241001', '0065412891', 'Ahmad Faiz Al-Faruq', 'L', 'RPL', 'XI', 'XI RPL 1', 'Bambang Hariyanto', '6281234567801', 'Danang Prasetyo, S.Kom.'),
('std-102', '23241002', '0065412892', 'Alifia Nurul Aini', 'P', 'AKL', 'XI', 'XI AKL 1', 'Muhammad Subhan', '6281234567802', 'Endang Sulistiyani, S.Pd.'),
('std-103', '23241003', '0065412893', 'Bayu Aditya Pratama', 'L', 'MPLB', 'X', 'X MPLB 2', 'Slamet Riyadi', '6281234567803', 'Nur Hasanah, S.Pd.'),
('std-104', '23241004', '0065412894', 'Cantika Dewi Maharani', 'P', 'BD', 'XII', 'XII BD 1', 'H. Sujarwo', '6281234567804', 'Rina Kusuma, S.E.'),
('std-105', '23241005', '0065412895', 'Daffa Rizky Ramadhan', 'L', 'DKV', 'XI', 'XI DKV 2', 'Eko Wahyudi', '6281234567805', 'Andi Nugroho, S.Pd.'),
('std-106', '23241006', '0065412896', 'Eka Putri Rahayu', 'P', 'KL', 'X', 'X KL 1', 'Joko Susilo', '6281234567806', 'Kartika Sari, S.Pd.'),
('std-107', '23241007', '0065412897', 'Fandi Farhan Kusuma', 'L', 'HTL', 'XII', 'XII HTL 1', 'Herman Sutrisno', '6281234567807', 'Lukman Hakim, S.Pd.')
ON CONFLICT (id) DO NOTHING;

-- Seed Akun Contoh
INSERT INTO public.user_accounts (id, username, password, name, nip, role, role_title, email, phone, status, notes) VALUES
('usr-admin-01', 'admin', 'admin123', 'Drs. H. Mulyono, M.Pd.', '19680512 199303 1 008', 'kesiswaan', 'Waka Kesiswaan & Tim Kedisiplinan', 'kesiswaansmesa@gmail.com', '6281234567001', 'Aktif', 'Administrator Utama Sistem PATROL SMESA.'),
('usr-piket-01', 'piket', 'piket123', 'Danang Prasetyo, S.Kom.', '19871020 201402 1 005', 'piket', 'Petugas Piket Gerbang Utama', 'danang.osis@smkn1jember.sch.id', '6281234567003', 'Aktif', 'Petugas Piket Gerbang untuk pencatatan cepat kehadiran pagi.'),
('usr-bk-01', 'gurubk', 'bk123', 'Nur Hasanah, S.Pd., Kons.', '19740510 199903 2 003', 'bk', 'Koordinator Guru BK', 'bk@smkn1jember.sch.id', '6281234567101', 'Aktif', 'Akun Koordinator Bimbingan Konseling.')
ON CONFLICT (id) DO NOTHING;
`;
