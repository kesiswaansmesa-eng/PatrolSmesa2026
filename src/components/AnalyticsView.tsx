import React, { useState } from 'react';
import { LateRecord, Student, Major, MajorId, getViolationTier } from '../types/patrol';
import { 
  BarChart3, 
  Users, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Clock, 
  AlertTriangle,
  PieChart,
  HelpCircle,
  TrendingUp,
  Award,
  Filter,
  CheckCircle2,
  BarChart2
} from 'lucide-react';

interface AnalyticsViewProps {
  records: LateRecord[];
  students: Student[];
  majors?: Major[];
}

type AnalyticsSubTab = 'siswa' | 'kelas' | 'jurusan' | 'hari' | 'waktu' | 'alasan' | 'semester';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ records, students, majors = [] }) => {
  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>('siswa');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');

  // Filter records by semester if selected
  const activeRecords = records.filter((r) => {
    if (semesterFilter !== 'ALL' && r.semester !== semesterFilter) return false;
    return true;
  });

  // 1. Group by Student
  const studentStatsMap: Record<
    string,
    { student: Student; count: number; totalMinutes: number; lastDate: string; reasons: Record<string, number> }
  > = {};

  activeRecords.forEach((r) => {
    const student = students.find((s) => s.id === r.studentId);
    if (!student) return;

    if (!studentStatsMap[student.id]) {
      studentStatsMap[student.id] = {
        student,
        count: 0,
        totalMinutes: 0,
        lastDate: r.date,
        reasons: {},
      };
    }

    studentStatsMap[student.id].count += 1;
    studentStatsMap[student.id].totalMinutes += r.minutesLate;
    if (r.date > studentStatsMap[student.id].lastDate) {
      studentStatsMap[student.id].lastDate = r.date;
    }
    studentStatsMap[student.id].reasons[r.reason] =
      (studentStatsMap[student.id].reasons[r.reason] || 0) + 1;
  });

  const sortedStudentStats = Object.values(studentStatsMap).sort((a, b) => b.count - a.count);

  // 2. Group by Class
  const classStatsMap: Record<string, { className: string; majorId: string; count: number; totalMinutes: number }> = {};
  activeRecords.forEach((r) => {
    if (!classStatsMap[r.className]) {
      classStatsMap[r.className] = {
        className: r.className,
        majorId: r.majorId,
        count: 0,
        totalMinutes: 0,
      };
    }
    classStatsMap[r.className].count += 1;
    classStatsMap[r.className].totalMinutes += r.minutesLate;
  });
  const sortedClassStats = Object.values(classStatsMap).sort((a, b) => b.count - a.count);

  // 3. Group by Major (Diambil dan digenerate otomatis mengikuti data di database)
  const dynamicMajorsMap = new Map<string, Major>();
  if (majors && majors.length > 0) {
    majors.forEach((m) => dynamicMajorsMap.set(m.id, m));
  }
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
  activeRecords.forEach((r) => {
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

  const allAvailableMajors = Array.from(dynamicMajorsMap.values());
  const majorStatsMap: Record<string, { major: Major; count: number; totalMinutes: number }> = {};
  allAvailableMajors.forEach((m) => {
    majorStatsMap[m.id] = { major: m, count: 0, totalMinutes: 0 };
  });
  activeRecords.forEach((r) => {
    if (r.majorId) {
      if (!majorStatsMap[r.majorId]) {
        majorStatsMap[r.majorId] = {
          major: dynamicMajorsMap.get(r.majorId) || {
            id: r.majorId,
            code: r.majorId,
            name: r.majorId,
            kaprodi: '-',
            color: '#6366f1',
          },
          count: 0,
          totalMinutes: 0,
        };
      }
      majorStatsMap[r.majorId].count += 1;
      majorStatsMap[r.majorId].totalMinutes += (r.minutesLate || 0);
    }
  });
  const sortedMajorStats = Object.values(majorStatsMap).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.major.code.localeCompare(b.major.code);
  });

  // 4. Group by Day of Week
  const dayStats: Record<string, number> = { Senin: 0, Selasa: 0, Rabu: 0, Kamis: 0, Jumat: 0 };
  activeRecords.forEach((r) => {
    if (dayStats[r.dayOfWeek] !== undefined) {
      dayStats[r.dayOfWeek] += 1;
    }
  });

  // 5. Group by Reason (Pareto)
  const reasonStats: Record<string, number> = {};
  activeRecords.forEach((r) => {
    reasonStats[r.reason] = (reasonStats[r.reason] || 0) + 1;
  });
  const sortedReasonStats = Object.entries(reasonStats).sort((a, b) => b[1] - a[1]);

  // 6. Arrival Time Distribution (07:01-07:10, 07:11-07:20, 07:21-07:30, >07:30)
  const timeBuckets = {
    '07:01 - 07:10 (Ringan)': 0,
    '07:11 - 07:20 (Sedang)': 0,
    '07:21 - 07:30 (Tinggi)': 0,
    '> 07:30 (Kritis)': 0,
  };
  activeRecords.forEach((r) => {
    const mins = r.minutesLate;
    if (mins <= 10) timeBuckets['07:01 - 07:10 (Ringan)']++;
    else if (mins <= 20) timeBuckets['07:11 - 07:20 (Sedang)']++;
    else if (mins <= 30) timeBuckets['07:21 - 07:30 (Tinggi)']++;
    else timeBuckets['> 07:30 (Kritis)']++;
  });

  // 7. Monthly Trend
  const monthlyStats: Record<string, number> = {};
  activeRecords.forEach((r) => {
    const monthKey = r.date.substring(0, 7); // "2026-10"
    monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Title & Semester Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Analisis Komparatif &amp; Statistik Kedisiplinan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis data multi-dimensi berdasarkan Siswa, Kelas, Jurusan, Hari, Jam, dan Alasan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="semester-filter" className="text-xs text-slate-500 font-medium">Periode Semester:</label>
          <select
            id="semester-filter"
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            className="text-xs py-1.5 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white font-medium"
          >
            <option value="ALL">Semua Periode</option>
            <option value="Ganjil 2025/2026">Semester Ganjil 2025/2026</option>
            <option value="Genap 2025/2026">Semester Genap 2025/2026</option>
          </select>
        </div>
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl overflow-x-auto text-xs">
        {[
          { id: 'siswa', label: 'Per Siswa', icon: Users },
          { id: 'kelas', label: 'Per Kelas', icon: Building2 },
          { id: 'jurusan', label: 'Per Jurusan', icon: GraduationCap },
          { id: 'hari', label: 'Per Hari (Senin-Jumat)', icon: Calendar },
          { id: 'alasan', label: 'Alasan Keterlambatan', icon: PieChart },
          { id: 'waktu', label: 'Sebaran Jam Datang', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as AnalyticsSubTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB TAB 1: PER SISWA */}
      {activeSubTab === 'siswa' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Peringkat Siswa Sering Terlambat
              </h2>
              <p className="text-xs text-slate-500">
                Urutan siswa berdasarkan akumulasi frekuensi dan total durasi keterlambatan
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              Total {sortedStudentStats.length} Siswa Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 text-center w-12">Rank</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                  <th className="py-2.5 px-3 text-center">Frekuensi</th>
                  <th className="py-2.5 px-3">Total Menit</th>
                  <th className="py-2.5 px-3">Kategori Pembinaan</th>
                  <th className="py-2.5 px-3">Wali Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedStudentStats.map((item, index) => {
                  const tier = getViolationTier(item.count);

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {index + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{item.student.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIS: {item.student.nis}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{item.student.className}</span>
                        <div className="text-[10px] text-slate-500">{item.student.majorId}</div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`font-mono font-bold px-2.5 py-0.5 rounded text-xs tabular-nums border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}
                        >
                          {item.count}x
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono tabular-nums text-slate-700 font-medium">
                        {item.totalMinutes} menit
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        {item.count >= 7 ? (
                          <span className="text-red-700 font-bold bg-red-50 border border-red-300 px-2 py-0.5 rounded text-[11px]">
                            ≥ 7x (Merah) Panggilan Ortu Resmi
                          </span>
                        ) : item.count >= 4 ? (
                          <span className="text-orange-700 font-semibold bg-orange-50 border border-orange-300 px-2 py-0.5 rounded text-[11px]">
                            4 - 6x (Orange) Konseling BK &amp; Wali
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                            1 - 3x (Hijau) Sanksi Edukatif Piket
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {item.student.waliKelas}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 2: PER KELAS */}
      {activeSubTab === 'kelas' && (
        <div className="space-y-6">
          {/* Zero Late Classes Hall of Fame */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-950">
                  Hall of Fame Disiplin: Rombel / Kelas Zero Late (0 Kasus Terlambat)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-1 rounded-full font-mono">
                100% Tepat Waktu
              </span>
            </div>
            <p className="text-xs text-emerald-800">
              Rombongan belajar di bawah ini tidak memiliki satu pun catatan keterlambatan di semester ini:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {Array.from(new Set(students.map((s) => s.className)))
                .filter((cls) => !classStatsMap[cls] || classStatsMap[cls].count === 0)
                .map((zeroCls) => (
                  <div
                    key={zeroCls}
                    className="p-3 bg-white border border-emerald-200 rounded-lg shadow-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{zeroCls}</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Nihil Pelanggaran</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                ))}
            </div>
          </div>

          {/* Ranking Kelas Table & Bars */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Ranking Keterlambatan Berdasarkan Rombongan Belajar (Kelas)
                </h2>
                <p className="text-xs text-slate-500">
                  Digunakan oleh Tim Kesiswaan untuk evaluasi kedisiplinan per rombel dan penilaian Wali Kelas
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {sortedClassStats.length} Kelas Tercatat
              </span>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visual Ranking */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Tingkat Frekuensi Pelanggaran per Kelas
                </h3>
                {sortedClassStats.map((item, idx) => {
                  const maxCount = Math.max(...sortedClassStats.map((c) => c.count), 1);
                  const pct = Math.round((item.count / maxCount) * 100);

                  return (
                    <div key={item.className} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">
                          #{idx + 1} {item.className} ({item.majorId})
                        </span>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {item.count} kejadian ({item.totalMinutes} menit)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-red-500' : idx <= 2 ? 'bg-orange-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table Detail */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="py-2 px-3">Kelas</th>
                      <th className="py-2 px-3">Jurusan</th>
                      <th className="py-2 px-3 text-right">Total Kasus</th>
                      <th className="py-2 px-3 text-right">Rata-rata Menit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sortedClassStats.map((c) => (
                      <tr key={c.className} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">{c.className}</td>
                        <td className="py-2 px-3 text-slate-600">{c.majorId}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold tabular-nums text-slate-800">
                          {c.count}x
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                          {Math.round(c.totalMinutes / c.count)} Menit
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: PER JURUSAN */}
      {activeSubTab === 'jurusan' && (
        <div className="space-y-6">
          {/* Grafik Jurusan Paling Banyak Siswa Terlambat */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Grafik Jurusan Paling Banyak Siswa Terlambat
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisasi perbandingan total kasus keterlambatan antar konsentrasi keahlian di SMKN 1 Jember (Otomatis dari Database)
                </p>
              </div>
              {sortedMajorStats.length > 0 && sortedMajorStats[0].count > 0 ? (
                <span className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded">
                  Tertinggi: {sortedMajorStats[0]?.major.code} ({sortedMajorStats[0]?.count}x)
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                  0 Kasus Keterlambatan
                </span>
              )}
            </div>

            {sortedMajorStats.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                Belum ada data konsentrasi keahlian di database.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {sortedMajorStats.map((item, idx) => {
                  const maxMajor = Math.max(...sortedMajorStats.map((m) => m.count), 0);
                  const pct = maxMajor > 0 ? Math.round((item.count / maxMajor) * 100) : 0;
                  const shareOfAll = activeRecords.length > 0 ? Math.round((item.count / activeRecords.length) * 100) : 0;
                  const isTop = idx === 0 && item.count > 0;

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
                            {item.major.code} - {item.major.name}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums font-bold text-slate-900">
                          {item.count} kejadian ({shareOfAll}%)
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.count === 0
                              ? 'bg-transparent'
                              : isTop
                              ? 'bg-red-500'
                              : idx === 1
                              ? 'bg-orange-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${item.count === 0 ? 0 : Math.max(pct, 5)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cards Jurusan Detail */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Detail Data Konsentrasi Keahlian (Kaprodi)
              </h2>
              <p className="text-xs text-slate-500">
                Monitoring khusus Ketua Konsentrasi Keahlian (KKK / Kaprodi) SMKN 1 Jember
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedMajorStats.map((item, idx) => {
                const totalActive = activeRecords.length || 1;
                const pctOfAll = Math.round((item.count / totalActive) * 100);
                const isLeast = idx === sortedMajorStats.length - 1;

                return (
                  <div
                    key={item.major.id}
                    className={`rounded-xl p-4 space-y-3 border ${
                      isLeast ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.major.color }}
                          />
                          <span className="font-bold text-slate-900 text-sm">{item.major.code}</span>
                          {isLeast && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              Paling Tertib
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {item.major.name}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                        {item.count}x
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Porsi dari total keterlambatan</span>
                        <span className="font-mono font-bold tabular-nums">{pctOfAll}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pctOfAll}%`,
                            backgroundColor: item.major.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-500">
                      Kaprodi: <strong className="text-slate-700">{item.major.kaprodi}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 4: PER HARI */}
      {activeSubTab === 'hari' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Tren Keterlambatan Berdasarkan Hari dalam Seminggu
            </h2>
            <p className="text-xs text-slate-500">
              Analisis siklus hari untuk menempatkan petugas piket dan pengamanan gerbang sekolah
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {Object.entries(dayStats).map(([dayName, count]) => {
              const maxVal = Math.max(...Object.values(dayStats), 1);
              const pct = Math.round((count / maxVal) * 100);
              const isSenin = dayName === 'Senin';

              return (
                <div
                  key={dayName}
                  className={`p-4 rounded-xl border text-center space-y-2 ${
                    isSenin ? 'bg-red-50/70 border-red-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="font-bold text-slate-900 text-sm">{dayName}</div>
                  <div
                    className={`text-2xl font-mono font-bold tabular-nums ${
                      isSenin ? 'text-red-700' : 'text-blue-700'
                    }`}
                  >
                    {count}
                  </div>
                  <div className="text-[11px] text-slate-500">Kasus Terlambat</div>
                  <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-600">
                    {isSenin ? 'Upacara Bendera (Paling Padat)' : 'Kegiatan Belajar Reguler'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Rekomendasi Kebijakan Hari Senin:</span>
            </div>
            <p className="leading-relaxed">
              Tingkat keterlambatan hari Senin meningkat lebih dari 60% dibanding hari lainnya dikarenakan kemacetan ruas jalan utama (Gladak Kembar &amp; Jl. PB Sudirman) serta persiapan upacara bendera pukul 06.45 WIB. Disarankan menambah petugas piket kesiswaan di gerbang barat dan timur setiap Senin pagi.
            </p>
          </div>
        </div>
      )}

      {/* SUB TAB 5: ALASAN KETERLAMBATAN (PARETO) */}
      {activeSubTab === 'alasan' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Analisis Pareto: Alasan Keterlambatan Paling Sering
            </h2>
            <p className="text-xs text-slate-500">
              Identifikasi akar penyebab keterlambatan untuk intervensi preventif kesiswaan
            </p>
          </div>

          <div className="space-y-4">
            {sortedReasonStats.map(([reason, count], idx) => {
              const max = Math.max(...sortedReasonStats.map((r) => r[1]), 1);
              const percentage = Math.round((count / activeRecords.length) * 100);

              return (
                <div key={reason} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                      <span className="font-semibold text-slate-800">{reason}</span>
                    </div>
                    <div className="font-mono tabular-nums text-slate-900 font-bold">
                      {count} siswa ({percentage}%)
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.round((count / max) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB TAB 6: SEBARAN JAM DATANG */}
      {activeSubTab === 'waktu' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Sebaran Waktu Kedatangan Siswa di Gerbang Sekolah
            </h2>
            <p className="text-xs text-slate-500">
              Distribusi menit keterlambatan di atas batas masuk 07.00 WIB
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(timeBuckets).map(([label, count]) => {
              const isHeavy = label.includes('Kritis') || label.includes('Tinggi');
              return (
                <div
                  key={label}
                  className={`p-4 rounded-xl border ${
                    isHeavy ? 'bg-red-50/50 border-red-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-700">{label}</div>
                  <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-2">
                    {count} siswa
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {Math.round((count / (activeRecords.length || 1)) * 100)}% dari total terlambat
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <strong>Catatan Waktu Gerbang:</strong> Mayoritas siswa terlambat tiba pada interval <strong>07:11 - 07:20 WIB</strong> (selisih 10-20 menit). Hal ini menunjukkan sebagian besar siswa hanya membutuhkan antisipasi waktu berangkat sekitar 15 menit lebih awal dari rumah masing-masing.
          </div>
        </div>
      )}
    </div>
  );
};
