import React, { useState } from 'react';
import { Student, LateRecord, CounselingEntry, CounselingLevel } from '../types/patrol';
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
  X
} from 'lucide-react';

interface PembinaanViewProps {
  records: LateRecord[];
  students: Student[];
  counselingEntries: CounselingEntry[];
  onAddCounselingEntry: (entry: Omit<CounselingEntry, 'id'>) => void;
  onPrintCallLetter: (record: LateRecord, student: Student) => void;
  onPrintCommitmentLetter: (student: Student, count: number) => void;
}

export const PembinaanView: React.FC<PembinaanViewProps> = ({
  records,
  students,
  counselingEntries,
  onAddCounselingEntry,
  onPrintCallLetter,
  onPrintCommitmentLetter,
}) => {
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding new counseling entry
  const [targetStudentId, setTargetStudentId] = useState(students[0]?.id || '');
  const [counselingLevel, setCounselingLevel] = useState<CounselingLevel>('Tingkat 2 (Sedang)');
  const [counselorName, setCounselorName] = useState('Nur Hasanah, S.Pd., Kons.');
  const [counselorRole, setCounselorRole] = useState<'Guru BK' | 'Tim Kesiswaan' | 'Wali Kelas'>('Guru BK');
  const [agreementNotes, setAgreementNotes] = useState('');
  const [counselingDate, setCounselingDate] = useState(new Date().toISOString().split('T')[0]);
  const [counselingStatus, setCounselingStatus] = useState<'Selesai' | 'Dalam Pemantauan' | 'Jadwal Temu Orang Tua'>('Dalam Pemantauan');

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
      counselorName,
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
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider">
            <span>SOP Penegakan Disiplin Siswa Berjenjang</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Pusat Pembinaan &amp; Konseling Kesiswaan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pendampingan terpadu Wali Kelas, Guru BK, dan Tim Kesiswaan SMKN 1 Jember
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
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
        <div className="bg-emerald-50/50 rounded-xl border border-emerald-200 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Tingkat 1 (1–3x Terlambat) • Hijau
            </span>
            <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
              {level1Students.length} Siswa
            </span>
          </div>
          <h3 className="font-bold text-emerald-950 text-sm">
            Teguran &amp; Sanksi Edukatif
          </h3>
          <p className="text-xs text-emerald-900/80 leading-relaxed">
            Dilakukan langsung oleh Petugas Piket &amp; Satpam Gerbang. Meliputi pembersihan lingkungan, literasi perpustakaan, atau doa kedisiplinan.
          </p>
          <div className="text-[11px] text-emerald-800 font-medium pt-1 border-t border-emerald-200">
            Penanggung Jawab: Piket Gerbang
          </div>
        </div>

        {/* Tingkat 2 (4-6x Orange) */}
        <div className="bg-orange-50/50 rounded-xl border border-orange-200 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800">
              Tingkat 2 (4–6x Terlambat) • Orange
            </span>
            <span className="font-mono text-xs font-bold text-orange-900 bg-orange-100 px-2 py-0.5 rounded">
              {level2Students.length} Siswa
            </span>
          </div>
          <h3 className="font-bold text-orange-950 text-sm">
            Konseling Wali Kelas &amp; Guru BK
          </h3>
          <p className="text-xs text-orange-900/80 leading-relaxed">
            Identifikasi kendala perjalanan/keluarga, pembuatan komitmen tertulis, serta penandatanganan Surat Pernyataan Siswa.
          </p>
          <div className="text-[11px] text-orange-800 font-medium pt-1 border-t border-orange-200">
            Penanggung Jawab: Wali Kelas &amp; Guru BK
          </div>
        </div>

        {/* Tingkat 3 (>=7x Merah) */}
        <div className="bg-red-50/50 rounded-xl border border-red-200 p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800">
              Tingkat 3 (≥ 7x Terlambat) • Merah
            </span>
            <span className="font-mono text-xs font-bold text-red-900 bg-red-100 px-2 py-0.5 rounded">
              {level3Students.length} Siswa
            </span>
          </div>
          <h3 className="font-bold text-red-950 text-sm">
            Pemanggilan Resmi Orang Tua
          </h3>
          <p className="text-xs text-red-900/80 leading-relaxed">
            Penerbitan Surat Panggilan Resmi berkop SMKN 1 Jember, konferensi kasus di Ruang Kesiswaan, dan evaluasi kedisiplinan tingkat lanjut.
          </p>
          <div className="text-[11px] text-red-800 font-medium pt-1 border-t border-red-200">
            Penanggung Jawab: Waka Kesiswaan &amp; Kepala Sekolah
          </div>
        </div>
      </div>

      {/* Daftar Siswa Tingkat 3 (Prioritas Utama Panggilan Orang Tua) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-red-50/40 border-b border-red-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-red-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Daftar Siswa Kategori Berat (≥ 7x Merah - Wajib Panggilan Orang Tua)</span>
            </h2>
            <p className="text-xs text-red-800/80">
              Siswa dengan akumulasi keterlambatan 7 kali atau lebih di semester ini
            </p>
          </div>
        </div>

        {level3Students.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada siswa di Tingkat 3 saat ini</p>
            <p className="text-xs text-slate-400 mt-0.5">Seluruh siswa berada dalam batas aman kedisiplinan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                  <th className="py-2.5 px-3 text-center">Akumulasi Terlambat</th>
                  <th className="py-2.5 px-3">Wali Murid &amp; Kontak</th>
                  <th className="py-2.5 px-3">Wali Kelas</th>
                  <th className="py-2.5 px-3 text-right">Aksi Penanganan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {level3Students.map((std) => {
                  const count = studentLateCount[std.id] || 0;
                  const latestRecord = records.filter((r) => r.studentId === std.id)[0];

                  return (
                    <tr key={std.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{std.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIS: {std.nis}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{std.className}</span>
                        <div className="text-[10px] text-slate-500">{std.majorId}</div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="font-mono font-bold bg-red-100 text-red-900 px-2.5 py-1 rounded text-xs tabular-nums">
                          {count} Kali
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{std.parentName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{std.parentPhone}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {std.waliKelas}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {latestRecord && (
                            <a
                              href={generateWhatsAppLink(latestRecord, std, count)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Kirim pesan pemberitahuan WhatsApp ke Orang Tua"
                            >
                              <Send className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hubungi Ortu</span>
                            </a>
                          )}
                          {latestRecord && (
                            <button
                              onClick={() => onPrintCallLetter(latestRecord, std)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                              title="Cetak Surat Panggilan Orang Tua Resmi SMKN 1 Jember"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-600" />
                              <span>Cetak Surat Panggilan</span>
                            </button>
                          )}
                          <button
                            onClick={() => onPrintCommitmentLetter(std, count)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1"
                            title="Cetak Surat Pernyataan Siswa"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Surat Komitmen</span>
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Log Riwayat Konseling &amp; Kesepakatan Kedisiplinan</span>
            </h2>
            <p className="text-xs text-slate-500">
              Dokumentasi konseling yang telah dilakukan oleh Guru BK, Wali Kelas, dan Tim Kesiswaan
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {counselingEntries.length} Sesi Tercatat
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Siswa</th>
                <th className="py-2.5 px-3">Tingkat Pembinaan</th>
                <th className="py-2.5 px-3">Pembina / Konselor</th>
                <th className="py-2.5 px-3">Catatan Komitmen &amp; Hasil Konseling</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {counselingEntries.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                    {formatIndonesianDate(c.date)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{c.studentName}</div>
                    <div className="text-[11px] text-slate-500">{c.className}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {c.level}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-medium text-slate-800">{c.counselorName}</div>
                    <div className="text-[10px] text-slate-500">{c.counselorRole}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 leading-relaxed max-w-md">
                    {c.agreementNotes}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.status === 'Selesai'
                          ? 'bg-emerald-100 text-emerald-800'
                          : c.status === 'Jadwal Temu Orang Tua'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
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
      </div>

      {/* Modal Add Counseling */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Catat Sesi Pembinaan &amp; Konseling Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCounseling} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Siswa</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  required
                >
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.name} ({std.className}) - Terlambat: {studentLateCount[std.id] || 0}x
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Pembinaan</label>
                  <select
                    value={counselingLevel}
                    onChange={(e) => setCounselingLevel(e.target.value as CounselingLevel)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tingkat 1 (Ringan)">Tingkat 1 (Ringan)</option>
                    <option value="Tingkat 2 (Sedang)">Tingkat 2 (Sedang)</option>
                    <option value="Tingkat 3 (Berat)">Tingkat 3 (Berat)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Konseling</label>
                  <input
                    type="date"
                    value={counselingDate}
                    onChange={(e) => setCounselingDate(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Konselor / Pembina</label>
                  <input
                    type="text"
                    value={counselorName}
                    onChange={(e) => setCounselorName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran Konselor</label>
                  <select
                    value={counselorRole}
                    onChange={(e) => setCounselorRole(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Guru BK">Guru BK</option>
                    <option value="Tim Kesiswaan">Tim Kesiswaan</option>
                    <option value="Wali Kelas">Wali Kelas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Komitmen Siswa &amp; Rekomendasi
                </label>
                <textarea
                  value={agreementNotes}
                  onChange={(e) => setAgreementNotes(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Siswa berkomitmen berangkat pukul 06.25 WIB, mengatur jam tidur malam, dan membuat kesepakatan dengan orang tua..."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Penanganan</label>
                <select
                  value={counselingStatus}
                  onChange={(e) => setCounselingStatus(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Dalam Pemantauan">Dalam Pemantauan</option>
                  <option value="Jadwal Temu Orang Tua">Jadwal Temu Orang Tua</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
