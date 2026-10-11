import React, { useState } from 'react';
import { Student, LateRecord, CounselingEntry, CounselingLevel, GuruBK, TimKesiswaan } from '../types/patrol';
import { formatIndonesianDate, generateWhatsAppLink } from '../utils/storage';
import { 
  ShieldAlert, 
  UserCheck, 
  Printer, 
  Send, 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  Calendar,
  AlertTriangle,
  History,
  X,
  Search,
  Filter,
  Phone,
  Sparkles,
  HeartHandshake
} from 'lucide-react';

interface PembinaanViewProps {
  records: LateRecord[];
  students: Student[];
  counselingEntries: CounselingEntry[];
  guruBK?: GuruBK[];
  timKesiswaan?: TimKesiswaan[];
  onAddCounselingEntry: (entry: Omit<CounselingEntry, 'id'>) => void;
  onPrintCallLetter: (record: LateRecord, student: Student) => void;
  onPrintCommitmentLetter: (student: Student, count: number) => void;
}

export const PembinaanView: React.FC<PembinaanViewProps> = ({
  records,
  students,
  counselingEntries,
  guruBK = [],
  timKesiswaan = [],
  onAddCounselingEntry,
  onPrintCallLetter,
  onPrintCommitmentLetter,
}) => {
  // Main view filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [mainSearchQuery, setMainSearchQuery] = useState<string>('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalClassFilter, setModalClassFilter] = useState<string>('ALL');
  const [modalSearchQuery, setModalSearchQuery] = useState<string>('');

  // Form states for adding new counseling entry
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [counselingLevel, setCounselingLevel] = useState<CounselingLevel>('Tingkat 2 (Sedang)');
  const [counselorRole, setCounselorRole] = useState<'Guru BK' | 'Tim Kesiswaan' | 'Wali Kelas'>('Guru BK');
  const [counselorName, setCounselorName] = useState(
    guruBK[0]?.name || 'Dra. Hj. Nur Hasanah, M.Kons.'
  );
  const [agreementNotes, setAgreementNotes] = useState('');
  const [counselingDate, setCounselingDate] = useState(new Date().toISOString().split('T')[0]);
  const [counselingStatus, setCounselingStatus] = useState<'Selesai' | 'Dalam Pemantauan' | 'Jadwal Temu Orang Tua'>('Dalam Pemantauan');

  const uniqueClasses = Array.from(new Set(students.map((s) => s.className))).sort();

  // Count late incidents per student
  const studentLateCount: Record<string, number> = {};
  records.forEach((r) => {
    studentLateCount[r.studentId] = (studentLateCount[r.studentId] || 0) + 1;
  });

  // Categorize students
  const level1Students = students.filter(
    (s) => (studentLateCount[s.id] || 0) >= 1 && (studentLateCount[s.id] || 0) <= 3
  );
  const level2Students = students.filter(
    (s) => (studentLateCount[s.id] || 0) >= 4 && (studentLateCount[s.id] || 0) <= 6
  );
  const level3Students = students.filter((s) => (studentLateCount[s.id] || 0) >= 7);

  // Filter level 3 students on main view by class & search
  const filteredLevel3Students = level3Students.filter((s) => {
    if (selectedClassFilter !== 'ALL' && s.className !== selectedClassFilter) return false;
    if (mainSearchQuery.trim()) {
      const q = mainSearchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nis.includes(q) || s.className.toLowerCase().includes(q);
    }
    return true;
  });

  // Filter counseling logs on main view by class & search
  const filteredCounselingLogs = counselingEntries.filter((c) => {
    if (selectedClassFilter !== 'ALL' && c.className !== selectedClassFilter) return false;
    if (selectedLevelFilter !== 'ALL' && !c.level.toLowerCase().includes(selectedLevelFilter.toLowerCase())) return false;
    if (mainSearchQuery.trim()) {
      const q = mainSearchQuery.toLowerCase();
      return (
        c.studentName.toLowerCase().includes(q) ||
        c.className.toLowerCase().includes(q) ||
        c.counselorName.toLowerCase().includes(q) ||
        c.agreementNotes.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Modal filtered students based on modalClassFilter and modalSearchQuery
  const modalFilteredStudents = students.filter((s) => {
    if (modalClassFilter !== 'ALL' && s.className !== modalClassFilter) return false;
    if (modalSearchQuery.trim()) {
      const q = modalSearchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.nis.includes(q) || s.className.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedStudent = students.find((s) => s.id === targetStudentId);

  // When changing counselor role in modal, update counselorName default
  const handleCounselorRoleChange = (role: 'Guru BK' | 'Tim Kesiswaan' | 'Wali Kelas') => {
    setCounselorRole(role);
    if (role === 'Guru BK') {
      setCounselorName(guruBK[0]?.name || 'Dra. Hj. Nur Hasanah, M.Kons.');
    } else if (role === 'Tim Kesiswaan') {
      setCounselorName(timKesiswaan[0]?.name || 'Drs. H. Mulyono, M.Pd.');
    } else if (role === 'Wali Kelas') {
      setCounselorName(selectedStudent?.waliKelas || 'Wali Kelas Siswa');
    }
  };

  const handleOpenAddModal = () => {
    setModalClassFilter('ALL');
    setModalSearchQuery('');
    if (students.length > 0) {
      setTargetStudentId(students[0].id);
      if (counselorRole === 'Wali Kelas') {
        setCounselorName(students[0].waliKelas);
      }
    }
    setShowAddModal(true);
  };

  const handleSaveCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === targetStudentId);
    if (!student) return;

    onAddCounselingEntry({
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      date: counselingDate,
      level: counselingLevel,
      counselorName: counselorName.trim() || 'Tim Kesiswaan SMESA',
      counselorRole,
      agreementNotes,
      status: counselingStatus,
    });

    setAgreementNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            <span>SOP Penegakan Disiplin Siswa Berjenjang</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Pusat Pembinaan &amp; Konseling Kesiswaan
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pendampingan terpadu Wali Kelas, Guru BK, dan Tim Kesiswaan SMKN 1 Jember
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Hasil Pembinaan</span>
          </button>
        </div>
      </div>

      {/* 3 SOP Stages Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tingkat 1 (1-3x Hijau) */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 p-4 shadow-xs space-y-2.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Tingkat 1 (1–3x Terlambat) • Hijau
            </span>
            <span className="font-mono text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
              {level1Students.length} Siswa
            </span>
          </div>
          <h3 className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
            Teguran &amp; Sanksi Edukatif
          </h3>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
            Dilakukan langsung oleh Petugas Piket &amp; Satpam Gerbang. Meliputi pembersihan lingkungan, literasi perpustakaan, atau doa kedisiplinan.
          </p>
          <div className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium pt-1 border-t border-emerald-200 dark:border-emerald-800">
            Penanggung Jawab: Piket Gerbang
          </div>
        </div>

        {/* Tingkat 2 (4-6x Orange) */}
        <div className="bg-orange-50/60 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800/60 p-4 shadow-xs space-y-2.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800 dark:text-orange-300">
              Tingkat 2 (4–6x Terlambat) • Orange
            </span>
            <span className="font-mono text-xs font-bold text-orange-900 dark:text-orange-200 bg-orange-100 dark:bg-orange-900/60 px-2 py-0.5 rounded">
              {level2Students.length} Siswa
            </span>
          </div>
          <h3 className="font-bold text-orange-950 dark:text-orange-100 text-sm">
            Konseling Wali Kelas &amp; Guru BK
          </h3>
          <p className="text-xs text-orange-900/80 dark:text-orange-300/80 leading-relaxed">
            Identifikasi kendala perjalanan/keluarga, komitmen tertulis, serta penandatanganan Surat Pernyataan Siswa bermaterai/resmi.
          </p>
          <div className="text-[11px] text-orange-800 dark:text-orange-400 font-medium pt-1 border-t border-orange-200 dark:border-orange-800">
            Penanggung Jawab: Wali Kelas &amp; Guru BK
          </div>
        </div>

        {/* Tingkat 3 (>=7x Merah) */}
        <div className="bg-red-50/60 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800/60 p-4 shadow-xs space-y-2.5 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 dark:text-red-300">
              Tingkat 3 (≥ 7x Terlambat) • Merah
            </span>
            <span className="font-mono text-xs font-bold text-red-900 dark:text-red-200 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded">
              {level3Students.length} Siswa
            </span>
          </div>
          <h3 className="font-bold text-red-950 dark:text-red-100 text-sm">
            Pemanggilan Resmi Orang Tua &amp; SP
          </h3>
          <p className="text-xs text-red-900/80 dark:text-red-300/80 leading-relaxed">
            Sidang khusus Tim Kesiswaan, Guru BK, dan orang tua murid. Penerbitan Surat Panggilan Resmi dan Surat Peringatan Kesiswaan.
          </p>
          <div className="text-[11px] text-red-800 dark:text-red-400 font-medium pt-1 border-t border-red-200 dark:border-red-800">
            Penanggung Jawab: Tim Kesiswaan &amp; Waka
          </div>
        </div>
      </div>

      {/* Main Filter Toolbar (Filter Siswa Berdasarkan Kelas & Pencarian) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Filter Tampilan Siswa &amp; Riwayat:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Kelas:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">🔍 Semua Kelas ({uniqueClasses.length})</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Level Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400">Tingkat:</span>
            <select
              value={selectedLevelFilter}
              onChange={(e) => setSelectedLevelFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Semua Tingkat</option>
              <option value="Tingkat 1">Tingkat 1 (Ringan)</option>
              <option value="Tingkat 2">Tingkat 2 (Sedang)</option>
              <option value="Tingkat 3">Tingkat 3 (Berat)</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={mainSearchQuery}
              onChange={(e) => setMainSearchQuery(e.target.value)}
              placeholder="Cari siswa atau catatan..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {(selectedClassFilter !== 'ALL' || selectedLevelFilter !== 'ALL' || mainSearchQuery) && (
            <button
              onClick={() => {
                setSelectedClassFilter('ALL');
                setSelectedLevelFilter('ALL');
                setMainSearchQuery('');
              }}
              className="text-xs text-blue-700 dark:text-blue-400 hover:underline px-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Tabel Siswa Kategori Berat (Tingkat 3) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-red-200 dark:border-red-900/60 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-red-100 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-red-950 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Daftar Siswa Kategori Berat (≥ 7x Merah - Wajib Panggilan Orang Tua)</span>
            </h2>
            <p className="text-xs text-red-800/80 dark:text-red-400/80">
              {selectedClassFilter !== 'ALL' ? `Menampilkan siswa di kelas ${selectedClassFilter}` : 'Siswa dengan akumulasi keterlambatan 7 kali atau lebih di semester ini'}
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-900/50 px-2.5 py-1 rounded">
            {filteredLevel3Students.length} Siswa Perlu Penanganan
          </span>
        </div>

        {filteredLevel3Students.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {selectedClassFilter !== 'ALL'
                ? `Tidak ada siswa kategori berat di kelas ${selectedClassFilter}`
                : 'Tidak ada siswa di Tingkat 3 saat ini'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Seluruh siswa berada dalam batas aman kedisiplinan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                  <th className="py-2.5 px-3 text-center">Akumulasi Terlambat</th>
                  <th className="py-2.5 px-3">Wali Murid &amp; Kontak</th>
                  <th className="py-2.5 px-3">Wali Kelas</th>
                  <th className="py-2.5 px-3 text-right">Aksi Penanganan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredLevel3Students.map((std) => {
                  const count = studentLateCount[std.id] || 0;
                  const latestRecord = records.filter((r) => r.studentId === std.id)[0];

                  return (
                    <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{std.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIS: {std.nis}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{std.className}</span>
                        <div className="text-[10px] text-slate-500">{std.majorId}</div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="font-mono font-bold bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 px-2.5 py-1 rounded text-xs tabular-nums">
                          {count} Kali
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{std.parentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{std.parentPhone}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {std.waliKelas}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {latestRecord && (
                            <a
                              href={generateWhatsAppLink(latestRecord, std, count)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                              title="Kirim Notifikasi Panggilan via WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>WA Ortu</span>
                            </a>
                          )}
                          {latestRecord && (
                            <button
                              onClick={() => onPrintCallLetter(latestRecord, std)}
                              className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                              title="Cetak Surat Panggilan Orang Tua Resmi"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Surat Panggilan</span>
                            </button>
                          )}
                          <button
                            onClick={() => onPrintCommitmentLetter(std, count)}
                            className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                            title="Cetak Surat Pernyataan Siswa"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Surat Pernyataan</span>
                          </button>
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

      {/* Riwayat Konseling & Pembinaan Tersimpan */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Log Riwayat Konseling &amp; Kesepakatan Kedisiplinan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dokumentasi konseling yang telah dilakukan oleh Guru BK, Wali Kelas, dan Tim Kesiswaan
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {filteredCounselingLogs.length} Sesi Ditampilkan
          </span>
        </div>

        {filteredCounselingLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
            Belum ada log sesi konseling yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Tingkat Pembinaan</th>
                  <th className="py-2.5 px-3">Pembina / Konselor</th>
                  <th className="py-2.5 px-3">Catatan Komitmen &amp; Hasil Konseling</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredCounselingLogs.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                      {formatIndonesianDate(c.date)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">{c.studentName}</div>
                      <div className="text-[11px] text-slate-500">{c.className}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {c.level}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{c.counselorName}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{c.counselorRole}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 leading-relaxed max-w-md">
                      {c.agreementNotes}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.status === 'Selesai'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : c.status === 'Jadwal Temu Orang Tua'
                            ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL CATAT PEMBINAAN & KONSELING (DENGAN FILTER KELAS)   */}
      {/* ========================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Catat Sesi Pembinaan &amp; Konseling Siswa</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCounseling} className="p-5 space-y-3.5 text-xs text-slate-800 dark:text-slate-200 max-h-[80vh] overflow-y-auto">
              {/* FILTER KELAS & SEARCH SISWA SECTION */}
              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-blue-950 dark:text-blue-300 text-xs">
                    1. Filter &amp; Pemilihan Siswa Berdasarkan Kelas
                  </label>
                  <span className="text-[10px] text-blue-700 dark:text-blue-400">
                    Mempermudah pencarian siswa per rombel
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Filter Rombel / Kelas:
                    </label>
                    <select
                      value={modalClassFilter}
                      onChange={(e) => {
                        const newClass = e.target.value;
                        setModalClassFilter(newClass);
                        const match = students.find((s) => newClass === 'ALL' || s.className === newClass);
                        if (match) {
                          setTargetStudentId(match.id);
                          if (counselorRole === 'Wali Kelas') setCounselorName(match.waliKelas);
                        }
                      }}
                      className="w-full p-2 border border-blue-300 dark:border-blue-800 rounded-lg bg-white dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200"
                    >
                      <option value="ALL">🔍 Semua Kelas ({uniqueClasses.length} Rombel)</option>
                      {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas: {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Cari Nama / NIS:
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={modalSearchQuery}
                        onChange={(e) => setModalSearchQuery(e.target.value)}
                        placeholder="Ketik nama atau NIS..."
                        className="w-full pl-8 pr-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daftar Siswa ({modalFilteredStudents.length} siswa ditemukan):
                  </label>
                  <select
                    value={targetStudentId}
                    onChange={(e) => {
                      const sId = e.target.value;
                      setTargetStudentId(sId);
                      const std = students.find((s) => s.id === sId);
                      if (std && counselorRole === 'Wali Kelas') {
                        setCounselorName(std.waliKelas);
                      }
                    }}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                    required
                  >
                    {modalFilteredStudents.map((std) => {
                      const count = studentLateCount[std.id] || 0;
                      return (
                        <option key={std.id} value={std.id}>
                          {std.name} — {std.className} (Terlambat: {count}x)
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Selected Student Information Card */}
                {selectedStudent && (
                  <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">NIS / Kelas:</span>{' '}
                      <strong className="text-slate-900 dark:text-white">{selectedStudent.nis} ({selectedStudent.className})</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Akumulasi:</span>{' '}
                      <span className="font-bold text-red-600 dark:text-red-400">{studentLateCount[selectedStudent.id] || 0}x Terlambat</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Wali Kelas:</span>{' '}
                      <span className="text-slate-800 dark:text-slate-200">{selectedStudent.waliKelas}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Ortu:</span>{' '}
                      <span className="text-slate-800 dark:text-slate-200">{selectedStudent.parentName}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* TINGKAT DAN TANGGAL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tingkat Pembinaan</label>
                  <select
                    value={counselingLevel}
                    onChange={(e) => setCounselingLevel(e.target.value as CounselingLevel)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="Tingkat 1 (Ringan)">Tingkat 1 (Ringan - Edukatif)</option>
                    <option value="Tingkat 2 (Sedang)">Tingkat 2 (Sedang - Konseling BK)</option>
                    <option value="Tingkat 3 (Berat)">Tingkat 3 (Berat - Panggilan Ortu/SP)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Konseling</label>
                  <input
                    type="date"
                    value={counselingDate}
                    onChange={(e) => setCounselingDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    required
                  />
                </div>
              </div>

              {/* PERAN DAN NAMA KONSELOR */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Peran Konselor / Pembina</label>
                  <select
                    value={counselorRole}
                    onChange={(e) => handleCounselorRoleChange(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="Guru BK">Guru BK (Bimbingan Konseling)</option>
                    <option value="Tim Kesiswaan">Tim Kesiswaan</option>
                    <option value="Wali Kelas">Wali Kelas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Nama Konselor / Pembina</label>
                  {counselorRole === 'Guru BK' && guruBK.length > 0 ? (
                    <select
                      value={counselorName}
                      onChange={(e) => setCounselorName(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-medium"
                    >
                      {guruBK.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.roleTitle})
                        </option>
                      ))}
                    </select>
                  ) : counselorRole === 'Tim Kesiswaan' && timKesiswaan.length > 0 ? (
                    <select
                      value={counselorName}
                      onChange={(e) => setCounselorName(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-medium"
                    >
                      {timKesiswaan.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name} ({t.position})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={counselorName}
                      onChange={(e) => setCounselorName(e.target.value)}
                      placeholder="Nama Konselor & Gelar"
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-medium"
                      required
                    />
                  )}
                </div>
              </div>

              {/* CATATAN KOMITMEN */}
              <div>
                <label className="block font-semibold mb-1">
                  Catatan Komitmen Siswa, Hasil Konseling &amp; Rekomendasi
                </label>
                <textarea
                  value={agreementNotes}
                  onChange={(e) => setAgreementNotes(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Siswa berkomitmen berangkat pukul 06.20 WIB, mengatur alarm malam, dan tidak begadang. Dilakukan monitoring selama 2 pekan ke depan..."
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
              </div>

              {/* STATUS PENANGANAN */}
              <div>
                <label className="block font-semibold mb-1">Status Penanganan</label>
                <select
                  value={counselingStatus}
                  onChange={(e) => setCounselingStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="Dalam Pemantauan">Dalam Pemantauan (Monitoring 1-2 Minggu)</option>
                  <option value="Jadwal Temu Orang Tua">Jadwal Temu Orang Tua / Surat Panggilan</option>
                  <option value="Selesai">Selesai (Komitmen Berhasil &amp; Ditutup)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Simpan Catatan Pembinaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
