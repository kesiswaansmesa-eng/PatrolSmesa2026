import React, { useId } from 'react';
import { LateRecord, Student, AppRole, Major, getViolationTier } from '../types/patrol';
import { MAJORS } from '../data/initialData';
import { formatIndonesianDate, generateWhatsAppLink } from '../utils/storage';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingDown, 
  Send, 
  Printer, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles,
  Building,
  GraduationCap,
  Award,
  CheckCircle2,
  BarChart2
} from 'lucide-react';

interface DashboardViewProps {
  records: LateRecord[];
  students: Student[];
  majors?: Major[];
  activeRole: AppRole;
  onOpenQuickRecord: () => void;
  onNavigateToTab: (tab: string) => void;
  onPrintCallLetter: (record: LateRecord, student: Student) => void;
  selectedMajorFilter?: string;
  selectedClassFilter?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  students,
  majors = [],
  activeRole,
  onOpenQuickRecord,
  onNavigateToTab,
  onPrintCallLetter,
  selectedMajorFilter,
  selectedClassFilter,
}) => {
  const todayStr = '2026-10-10'; // Runtime date
  const todayRecords = records.filter((r) => r.date === todayStr);

  // Filter based on role selections if active
  const filteredRecords = records.filter((r) => {
    if (activeRole === 'kkk' && selectedMajorFilter && selectedMajorFilter !== 'ALL') {
      if (r.majorId !== selectedMajorFilter) return false;
    }
    if (activeRole === 'walikelas' && selectedClassFilter && selectedClassFilter !== 'ALL') {
      if (r.className !== selectedClassFilter) return false;
    }
    return true;
  });

  const displayTodayRecords = filteredRecords.filter((r) => r.date === todayStr);

  // Total late minutes today
  const totalMinutesToday = displayTodayRecords.reduce((acc, curr) => acc + curr.minutesLate, 0);
  const avgMinutesToday = displayTodayRecords.length > 0
    ? Math.round(totalMinutesToday / displayTodayRecords.length)
    : 0;

  // Group by student to find violation counts
  const violationCountsByStudent: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    violationCountsByStudent[r.studentId] = (violationCountsByStudent[r.studentId] || 0) + 1;
  });

  // Tiers count: 1-3 Hijau, 4-6 Orange, 7+ Merah
  let greenCount = 0; // 1 - 3
  let orangeCount = 0; // 4 - 6
  let redCount = 0; // >= 7

  students.forEach((s) => {
    const c = violationCountsByStudent[s.id] || 0;
    if (c >= 1 && c <= 3) greenCount++;
    else if (c >= 4 && c <= 6) orangeCount++;
    else if (c >= 7) redCount++;
  });

  // Students requiring follow-up (Orange 4-6 & Merah >=7)
  const studentsNeedingCounseling = students
    .filter((s) => (violationCountsByStudent[s.id] || 0) >= 4)
    .sort((a, b) => (violationCountsByStudent[b.id] || 0) - (violationCountsByStudent[a.id] || 0));

  // Day of week distribution
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;
  const dayCounts: Record<string, number> = { Senin: 0, Selasa: 0, Rabu: 0, Kamis: 0, Jumat: 0 };
  filteredRecords.forEach((r) => {
    if (dayCounts[r.dayOfWeek] !== undefined) {
      dayCounts[r.dayOfWeek]++;
    }
  });

  // Reasons distribution
  const reasonCounts: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
  });
  const sortedReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Major late counts & ranking (Grafik Jurusan Paling Banyak Terlambat)
  // Diambilkan dan digenerate otomatis mengikuti data konsentrasi keahlian & keterlambatan di database
  const dynamicMajorsMap = new Map<string, Major>();

  // 1. Ambil data konsentrasi keahlian yang tersimpan di database
  if (majors && majors.length > 0) {
    majors.forEach((m) => {
      dynamicMajorsMap.set(m.id, m);
    });
  }

  // 2. Deteksi jurusan dari data siswa di database jika belum terdaftar
  students.forEach((s) => {
    if (s.majorId && !dynamicMajorsMap.has(s.majorId)) {
      dynamicMajorsMap.set(s.majorId, {
        id: s.majorId,
        code: s.majorId,
        name: s.majorId,
        kaprodi: '-',
        color: '#3b82f6',
      });
    }
  });

  // 3. Deteksi jurusan dari data keterlambatan di database
  filteredRecords.forEach((r) => {
    if (r.majorId && !dynamicMajorsMap.has(r.majorId)) {
      dynamicMajorsMap.set(r.majorId, {
        id: r.majorId,
        code: r.majorId,
        name: r.majorId,
        kaprodi: '-',
        color: '#6366f1',
      });
    }
  });

  const allDatabaseMajors = Array.from(dynamicMajorsMap.values());
  const majorRecordCounts: Record<string, number> = {};
  const majorStudentCounts: Record<string, Set<string>> = {};
  const majorTotalMinutes: Record<string, number> = {};

  allDatabaseMajors.forEach((m) => {
    majorRecordCounts[m.id] = 0;
    majorStudentCounts[m.id] = new Set();
    majorTotalMinutes[m.id] = 0;
  });

  filteredRecords.forEach((r) => {
    if (r.majorId) {
      if (!majorRecordCounts[r.majorId]) {
        majorRecordCounts[r.majorId] = 0;
        majorStudentCounts[r.majorId] = new Set();
        majorTotalMinutes[r.majorId] = 0;
      }
      majorRecordCounts[r.majorId] = (majorRecordCounts[r.majorId] || 0) + 1;
      majorStudentCounts[r.majorId].add(r.studentId);
      majorTotalMinutes[r.majorId] = (majorTotalMinutes[r.majorId] || 0) + (r.minutesLate || 0);
    }
  });

  // Urutan konsentrasi keahlian dengan frekuensi keterlambatan tertinggi di SMKN 1 Jember
  const rankedMajors = allDatabaseMajors.map((m) => ({
    major: m,
    totalRecords: majorRecordCounts[m.id] || 0,
    uniqueStudents: majorStudentCounts[m.id]?.size || 0,
    totalMinutes: majorTotalMinutes[m.id] || 0,
  })).sort((a, b) => {
    if (b.totalRecords !== a.totalRecords) {
      return b.totalRecords - a.totalRecords;
    }
    if (b.uniqueStudents !== a.uniqueStudents) {
      return b.uniqueStudents - a.uniqueStudents;
    }
    return a.major.code.localeCompare(b.major.code);
  });

  const maxMajorRecords = Math.max(...rankedMajors.map((m) => m.totalRecords), 0);

  // Class late counts & Zero Late identification
  const allClassNames = Array.from(new Set(students.map((s) => s.className))).sort();
  const classRecordCounts: Record<string, number> = {};
  allClassNames.forEach((cls) => {
    classRecordCounts[cls] = 0;
  });
  filteredRecords.forEach((r) => {
    if (classRecordCounts[r.className] !== undefined) {
      classRecordCounts[r.className]++;
    }
  });

  // Zero Late classes (Kelas Tanpa Keterlambatan)
  const zeroLateClasses = allClassNames.filter((cls) => classRecordCounts[cls] === 0);
  const leastLateClasses = allClassNames
    .filter((cls) => classRecordCounts[cls] === 1)
    .slice(0, 4);

  // Jurusan paling sedikit terlambat
  const leastLateMajors = [...rankedMajors].reverse();

  const totalSchoolStudents = 1250;
  const disciplineRate = (
    ((totalSchoolStudents - displayTodayRecords.length) / totalSchoolStudents) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with School Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <span>Sistem Informasi Monitoring Kedisiplinan Siswa</span>
            <span aria-hidden="true">·</span>
            <span>Tahun Ajaran 2025/2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Dashboard Pengawasan Keterlambatan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Pusat data keterlambatan gerbang, evaluasi kedisiplinan jurusan, dan apresiasi kelas tertib SMKN 1 Jember.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => onNavigateToTab('pencatatan')}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
          >
            Lihat Semua Log
          </button>
          <button
            onClick={onOpenQuickRecord}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>+ Catat Siswa Piket</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hari Ini */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Terlambat Hari Ini</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {displayTodayRecords.length}
            </span>
            <span className="text-xs text-slate-500">siswa tercatat</span>
          </div>
          <div className="mt-2 text-xs text-slate-600 flex items-center gap-1.5">
            <span className="text-slate-400">Rata-rata:</span>
            <strong className="font-mono tabular-nums text-slate-800">{avgMinutesToday} Menit</strong>
          </div>
        </div>

        {/* Card 2: Indeks Ketepatan Waktu */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Indeks Ketepatan Waktu</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600">
              {disciplineRate}%
            </span>
            <span className="text-xs text-emerald-700 font-medium">Tepat Waktu</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Populasi {totalSchoolStudents} siswa SMKN 1 Jember
          </div>
        </div>

        {/* Card 3: Zona Status Kedisiplinan 1-3 Hijau, 4-6 Orange, 7+ Merah */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Sebaran Status Kedisiplinan</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold font-mono">
              {greenCount} Hijau
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-bold font-mono">
              {orangeCount} Orange
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold font-mono">
              {redCount} Merah
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Hijau: 1-3x | Orange: 4-6x | Merah: ≥7x
          </div>
        </div>

        {/* Card 4: Total Pelanggaran Semester Ini */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Akumulasi Catatan</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900">
              {filteredRecords.length}
            </span>
            <span className="text-xs text-slate-500">kali pelanggaran</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Semester Ganjil 2025/2026
          </div>
        </div>
      </div>

      {/* SEKSI 1: GRAFIK JURUSAN PALING BANYAK SISWA TERLAMBAT & KELAS ZERO LATE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri (7 Cols): Grafik Jurusan Paling Banyak Siswa Terlambat */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Grafik Jurusan Paling Banyak Siswa Terlambat
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Urutan konsentrasi keahlian dengan frekuensi keterlambatan tertinggi di SMKN 1 Jember
              </p>
            </div>
            {rankedMajors.length > 0 && maxMajorRecords > 0 ? (
              <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded">
                Puncak: {rankedMajors[0]?.major.code} ({rankedMajors[0]?.totalRecords}x)
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                0 Kasus Keterlambatan
              </span>
            )}
          </div>

          {rankedMajors.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Belum ada data konsentrasi keahlian di database.
            </div>
          ) : (
            <div className="space-y-3.5 pt-1">
              {rankedMajors.map((item, idx) => {
                const pct = maxMajorRecords > 0 ? Math.round((item.totalRecords / maxMajorRecords) * 100) : 0;
                const shareOfAll = filteredRecords.length > 0 ? Math.round((item.totalRecords / filteredRecords.length) * 100) : 0;
                const isTop = idx === 0 && item.totalRecords > 0;

                return (
                  <div key={item.major.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.major.color || '#3b82f6' }}
                        />
                        <span className={`font-semibold ${isTop ? 'text-red-700' : 'text-slate-800'}`}>
                          {item.major.code} - {item.major.name.split('(')[0].trim()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {item.uniqueStudents} siswa unik
                        </span>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {item.totalRecords}x ({shareOfAll}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.totalRecords === 0
                            ? 'bg-transparent'
                            : isTop
                            ? 'bg-red-500'
                            : idx === 1
                            ? 'bg-orange-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${item.totalRecords === 0 ? 0 : Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Kaprodi terkait diwajibkan melakukan koordinasi dengan wali kelas binaan.</span>
            <span className="text-[11px] font-medium text-blue-600">Otomatis dari Database</span>
          </div>
        </div>

        {/* Kolom Kanan (5 Cols): Jurusan & Kelas Paling Sedikit Terlambat (Zero Late Champions) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Jurusan &amp; Kelas Paling Sedikit Terlambat
                </h2>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Zero Late
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Apresiasi kedisiplinan bagi rombongan belajar dan jurusan dengan catatan keterlambatan 0 (nihil).
            </p>

            {/* Showcase Jurusan Paling Tertib */}
            {leastLateMajors.length > 0 && (
              <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Jurusan Paling Tertib (Minim Terlambat):</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-800 text-xs">
                    {leastLateMajors[0]?.totalRecords === 0 ? 'Nihil Keterlambatan' : `Hanya ${leastLateMajors[0]?.totalRecords} Kasus`}
                  </span>
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {leastLateMajors[0]?.major.name} ({leastLateMajors[0]?.major.code})
                </div>
                {leastLateMajors.length > 1 && (
                  <p className="text-[11px] text-emerald-800 leading-snug">
                    Disusul oleh {leastLateMajors[1]?.major.code} ({leastLateMajors[1]?.totalRecords ?? 0}x)
                    {leastLateMajors[2] ? ` dan ${leastLateMajors[2]?.major.code} (${leastLateMajors[2]?.totalRecords ?? 0}x)` : ''}.
                  </p>
                )}
              </div>
            )}

            {/* Kelas-Kelas Zero Late */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">
                  Rombel / Kelas Zero Late (0 Kasus Terlambat):
                </span>
                <span className="font-mono text-emerald-600 font-bold text-xs">
                  {zeroLateClasses.length} Kelas
                </span>
              </div>

              {zeroLateClasses.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                  Semua kelas telah mencatat minimal 1 kali keterlambatan.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {zeroLateClasses.map((cls) => (
                    <div
                      key={cls}
                      className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-slate-900">{cls}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                        0 Late
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Runner-up 1 Late */}
            {leastLateClasses.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Kelas Keterlambatan Sangat Rendah (1 Kasus): </span>
                <span className="font-mono">{leastLateClasses.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            ⭐ <strong>Catatan Kesiswaan:</strong> Kelas dengan catatan 0 keterlambatan layak mendapatkan Piagam Penghargaan Rombel Terdisiplin pada saat Upacara Bendera hari Senin.
          </div>
        </div>
      </div>

      {/* SEKSI 2: RADAR SISWA RAWAN & PENCATATAN GERBANG HARI INI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri (2 Kolom): Realtime Log Keterlambatan Hari Ini */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pencatatan Gerbang Hari Ini ({displayTodayRecords.length} Siswa)
              </h2>
              <p className="text-xs text-slate-500">
                {formatIndonesianDate(todayStr)} • Gerbang Utama SMKN 1 Jember
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('pencatatan')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
            >
              Lihat Seluruh Riwayat →
            </button>
          </div>

          {displayTodayRecords.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada siswa terlambat hari ini</p>
              <p className="text-xs text-slate-400 mt-1">
                Semua siswa hadir tepat waktu atau pencatatan piket belum dimulai.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Jam / Menit</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                    <th className="py-2.5 px-3">Status Keterlambatan</th>
                    <th className="py-2.5 px-3">Alasan</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayTodayRecords.map((rec) => {
                    const student = students.find((s) => s.id === rec.studentId);
                    const totalViolations = (violationCountsByStudent[rec.studentId] || 1);
                    const tier = getViolationTier(totalViolations);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900 tabular-nums">
                            {rec.time} WIB
                          </div>
                          <div className="text-[11px] font-mono text-red-600 tabular-nums">
                            +{rec.minutesLate} Menit
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{rec.studentName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">NIS: {rec.studentNis}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-medium text-slate-800">{rec.className}</span>
                          <div className="text-[10px] text-slate-500">{rec.majorId}</div>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}
                          >
                            {totalViolations}x • {tier.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 max-w-[140px] truncate" title={rec.reason}>
                          {rec.reason}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {student && (
                              <a
                                href={generateWhatsAppLink(rec, student, totalViolations)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                                title="Kirim Notifikasi WhatsApp ke Orang Tua"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {student && totalViolations >= 4 && (
                              <button
                                onClick={() => onPrintCallLetter(rec, student)}
                                className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                title="Cetak Dokumen Resmi"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Kolom Kanan (1 Kolom): Radar Siswa Rawan (Orange 4-6x & Merah ≥7x) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span>Radar Siswa Rawan (≥4x)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Siswa zona Orange (4-6x) &amp; Merah (≥7x)
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('pembinaan')}
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
            >
              Semua
            </button>
          </div>

          <div className="space-y-2.5">
            {studentsNeedingCounseling.slice(0, 5).map((student) => {
              const count = violationCountsByStudent[student.id] || 0;
              const tier = getViolationTier(count);

              return (
                <div
                  key={student.id}
                  className={`p-3 rounded-lg border text-xs ${tier.badgeBg} ${tier.badgeBorder}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{student.name}</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        count >= 7 ? 'bg-red-200 text-red-900' : 'bg-orange-200 text-orange-900'
                      }`}
                    >
                      {count}x Terlambat
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 flex items-center justify-between">
                    <span>{student.className} · Wali: {student.waliKelas}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className={`font-semibold ${tier.badgeText}`}>
                      {count >= 7 ? 'Merah (Panggilan Orang Tua)' : 'Orange (Konseling BK)'}
                    </span>
                    <button
                      onClick={() => onNavigateToTab('pembinaan')}
                      className="text-blue-700 font-semibold hover:underline"
                    >
                      Tindak Lanjuti →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-200">
            <div className="font-semibold text-slate-800 mb-1">Standar Skala Warna Disiplin:</div>
            <ul className="space-y-1 text-[11px] text-slate-600">
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span><strong>1–3x (Hijau)</strong>: Teguran &amp; sanksi edukatif piket</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />
                <span><strong>4–6x (Orange)</strong>: Konseling BK &amp; Wali Kelas</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <span><strong>≥7x (Merah)</strong>: Pemanggilan Orang Tua Resmi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
