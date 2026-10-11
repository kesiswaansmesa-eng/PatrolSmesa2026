import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { LateRecord, Student, MajorId, Major, SchoolClass, LateReason, EducationalSanction } from '../types/patrol';
import { MAJORS, INITIAL_CLASSES } from '../data/initialData';
import { formatIndonesianDate, generateWhatsAppLink, downloadCSV, getIndonesianDayName } from '../utils/storage';
import { 
  Search, 
  Filter, 
  Download, 
  Upload,
  Send, 
  Printer, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  SlidersHorizontal,
  ChevronDown,
  UserCheck,
  FileSpreadsheet,
  FileCheck,
  Cloud,
  X
} from 'lucide-react';

interface PencatatanViewProps {
  records: LateRecord[];
  students: Student[];
  majors?: Major[];
  classes?: SchoolClass[];
  onOpenQuickRecord: () => void;
  onDeleteRecord: (id: string) => void;
  onUpdateStatus: (id: string, status: 'Belum Dibina' | 'Sedang Dibina' | 'Selesai Pembinaan') => void;
  onPrintCallLetter: (record: LateRecord, student: Student) => void;
  onImportRecords?: (newRecords: LateRecord[], mode?: 'append' | 'replace') => void;
}

export const PencatatanView: React.FC<PencatatanViewProps> = ({
  records,
  students,
  majors = [],
  classes = [],
  onOpenQuickRecord,
  onDeleteRecord,
  onUpdateStatus,
  onPrintCallLetter,
  onImportRecords,
}) => {
  const currentMajors = majors;
  const currentClasses = classes;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Import Modal State
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedImportRecords, setParsedImportRecords] = useState<LateRecord[]>([]);
  const [importFileName, setImportFileName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available classes for dropdown, filtered by selectedMajor if applicable
  const availableClassesForFilter = currentClasses.length > 0
    ? (selectedMajor === 'ALL'
        ? Array.from(new Set(currentClasses.map((c) => c.name))).sort()
        : Array.from(new Set(currentClasses.filter((c) => c.majorId === selectedMajor).map((c) => c.name))).sort())
    : Array.from(new Set(students.map((s) => s.className))).sort();

  // Count violations per student for contextual badging
  const studentViolationCounts: Record<string, number> = {};
  records.forEach((r) => {
    studentViolationCounts[r.studentId] = (studentViolationCounts[r.studentId] || 0) + 1;
  });

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        r.studentName.toLowerCase().includes(q) ||
        r.studentNis.includes(q) ||
        r.className.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedMajor !== 'ALL' && r.majorId !== selectedMajor) return false;
    if (selectedClass !== 'ALL' && r.className !== selectedClass) return false;
    if (selectedSemester !== 'ALL' && r.semester !== selectedSemester) return false;
    if (selectedStatus !== 'ALL' && r.counselingStatus !== selectedStatus) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    return true;
  });

  const handleExport = () => {
    downloadCSV(filteredRecords, `Rekap_Keterlambatan_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(ws);

        if (data.length === 0) {
          setImportError('File kosong atau data tidak terbaca.');
          return;
        }

        const studentMapByNis = new Map<string, Student>();
        const studentMapByName = new Map<string, Student>();
        students.forEach((s) => {
          if (s.nis) studentMapByNis.set(s.nis.trim(), s);
          studentMapByName.set(s.name.toLowerCase().trim(), s);
        });

        const parsed: LateRecord[] = [];
        data.forEach((row, idx) => {
          const rawNis = String(row['NIS'] || row['nis'] || row['Nis'] || '').trim();
          const rawName = String(row['Nama'] || row['Nama_Siswa'] || row['nama'] || row['Nama Siswa'] || '').trim();
          if (!rawNis && !rawName) return;

          const matchedStudent = (rawNis ? studentMapByNis.get(rawNis) : null) || 
                                (rawName ? studentMapByName.get(rawName.toLowerCase()) : null);

          const studentId = matchedStudent?.id || `std-imp-${rawNis || idx}`;
          const studentName = matchedStudent?.name || rawName || 'Siswa Tanpa Nama';
          const studentNis = matchedStudent?.nis || rawNis || '-';
          const className = matchedStudent?.className || String(row['Kelas'] || row['kelas'] || 'X RPL 1').trim();
          const majorId = (matchedStudent?.majorId || String(row['Jurusan'] || row['jurusan'] || 'RPL').trim()) as MajorId;
          const date = String(row['Tanggal'] || row['tanggal'] || row['Date'] || new Date().toISOString().split('T')[0]).trim();
          const time = String(row['Jam'] || row['Waktu'] || row['waktu'] || '07:15').trim();
          const minutesLate = Number(row['Menit_Terlambat'] || row['Menit'] || row['menit'] || 15);
          const reason = (String(row['Alasan'] || row['alasan'] || 'Bangun kesiangan').trim()) as LateReason;
          const sanction = (String(row['Sanksi'] || row['sanksi'] || 'Operasi Semut & Pembersihan Taman Sekolah').trim()) as EducationalSanction;
          const recordedBy = String(row['Petugas'] || row['Pencatat'] || row['recordedBy'] || 'Piket Gerbang').trim();

          parsed.push({
            id: `rec-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            studentId,
            studentName,
            studentNis,
            className,
            majorId,
            date,
            time,
            minutesLate: isNaN(minutesLate) ? 15 : minutesLate,
            dayOfWeek: getIndonesianDayName(date),
            reason,
            sanction,
            notes: String(row['Catatan'] || row['notes'] || 'Import via Excel').trim(),
            counselingStatus: 'Belum Dibina',
            parentNotified: false,
            semester: 'Ganjil 2025/2026',
            recordedBy,
            createdAt: new Date().toISOString(),
          });
        });

        if (parsed.length === 0) {
          setImportError('Tidak ada baris catatan keterlambatan yang valid.');
          return;
        }

        setParsedImportRecords(parsed);
      } catch (err) {
        console.error('Error membaca file import keterlambatan:', err);
        setImportError('Gagal memproses file. Pastikan format file Excel (.xlsx, .xls) atau CSV valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImport = () => {
    if (parsedImportRecords.length === 0) return;
    if (onImportRecords) {
      onImportRecords(parsedImportRecords, importMode);
    }
    setImportModalOpen(false);
    setParsedImportRecords([]);
    setImportFileName('');
    setImportError(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Action & Filter Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Data Riwayat Keterlambatan Siswa
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Firebase
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {filteredRecords.length} catatan keterlambatan tersimpan di sistem & database cloud
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import Excel / CSV</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={onOpenQuickRecord}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>+ Catat Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama, NIS, Kelas, atau Alasan..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Major Filter */}
          <div>
            <select
              aria-label="Filter Jurusan"
              value={selectedMajor}
              onChange={(e) => {
                setSelectedMajor(e.target.value);
                setSelectedClass('ALL');
              }}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Semua Jurusan</option>
              {currentMajors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select
              aria-label="Filter Kelas"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Semua Kelas ({availableClassesForFilter.length})</option>
              {availableClassesForFilter.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Status Pembinaan Filter */}
          <div>
            <select
              aria-label="Filter Status Pembinaan"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Semua Status</option>
              <option value="Belum Dibina">Belum Dibina</option>
              <option value="Sedang Dibina">Sedang Dibina</option>
              <option value="Selesai Pembinaan">Selesai Pembinaan</option>
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <input
              aria-label="Filter Tanggal Spesifik"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear filter indicator if active */}
        {(searchQuery || selectedMajor !== 'ALL' || selectedStatus !== 'ALL' || dateFilter) && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Ditemukan {filteredRecords.length} data sesuai filter</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMajor('ALL');
                setSelectedStatus('ALL');
                setDateFilter('');
              }}
              className="text-blue-700 hover:underline font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">Tidak ada data keterlambatan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Sesuaikan kata kunci pencarian atau tambah catatan keterlambatan baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Tanggal &amp; Waktu</th>
                  <th className="py-3 px-3">Siswa</th>
                  <th className="py-3 px-3">Kelas / Jurusan</th>
                  <th className="py-3 px-3">Alasan Keterlambatan</th>
                  <th className="py-3 px-3">Sanksi Edukatif</th>
                  <th className="py-3 px-3">Status Pembinaan</th>
                  <th className="py-3 px-3">Petugas</th>
                  <th className="py-3 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const student = students.find((s) => s.id === rec.studentId);
                  const totalViolations = studentViolationCounts[rec.studentId] || 1;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{formatIndonesianDate(rec.date)}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono tabular-nums">
                          <span>{rec.time} WIB</span>
                          <span className="text-red-600 font-bold">({rec.minutesLate}m)</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{rec.studentName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-mono">
                          <span>NIS: {rec.studentNis}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                              totalViolations >= 7
                                ? 'bg-red-50 text-red-700 border-red-300'
                                : totalViolations >= 4
                                ? 'bg-orange-50 text-orange-700 border-orange-300'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            }`}
                          >
                            {totalViolations}x {totalViolations >= 7 ? '(Merah)' : totalViolations >= 4 ? '(Orange)' : '(Hijau)'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{rec.className}</div>
                        <div className="text-[11px] text-slate-500">{rec.majorId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-[180px]">
                        <div className="truncate font-medium" title={rec.reason}>
                          {rec.reason}
                        </div>
                        {rec.notes && (
                          <div className="text-[10px] text-slate-500 truncate" title={rec.notes}>
                            Ket: {rec.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 max-w-[180px] truncate" title={rec.sanction}>
                        {rec.sanction}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          aria-label={`Status Pembinaan untuk ${rec.studentName}`}
                          value={rec.counselingStatus}
                          onChange={(e) =>
                            onUpdateStatus(
                              rec.id,
                              e.target.value as 'Belum Dibina' | 'Sedang Dibina' | 'Selesai Pembinaan'
                            )
                          }
                          className={`text-[11px] font-semibold py-1 px-2 rounded-md border ${
                            rec.counselingStatus === 'Selesai Pembinaan'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : rec.counselingStatus === 'Sedang Dibina'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="Belum Dibina">Belum Dibina</option>
                          <option value="Sedang Dibina">Sedang Dibina</option>
                          <option value="Selesai Pembinaan">Selesai</option>
                        </select>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                        {rec.recordedBy}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {student && (
                            <a
                              href={generateWhatsAppLink(rec, student, totalViolations)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                              title="Kirim Notifikasi WA ke Orang Tua"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {student && totalViolations >= 3 && (
                            <button
                              onClick={() => onPrintCallLetter(rec, student)}
                              className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                              title="Cetak Surat Panggilan Orang Tua Resmi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan keterlambatan ${rec.studentName}?`)) {
                                onDeleteRecord(rec.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL IMPORT EXCEL / CSV PELANGGARAN */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Import Data Catatan Keterlambatan dari Excel / CSV</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setParsedImportRecords([]);
                  setImportFileName('');
                  setImportError(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-blue-600" />
                  Otomatis Terekam Permanen ke Firebase Firestore
                </p>
                <p className="text-blue-700">
                  Data keterlambatan yang diimpor akan langsung tersimpan ke basis data Firebase dan memperbarui grafik keterlambatan jurusan secara real-time.
                </p>
                <p className="text-[11px] text-blue-600 font-mono mt-1">
                  Format Kolom yang didukung: NIS, Nama, Kelas, Jurusan, Tanggal (YYYY-MM-DD), Jam (HH:mm), Menit_Terlambat, Alasan, Sanksi, Petugas
                </p>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih File Excel (.xlsx, .xls) atau .csv:
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/40"
                >
                  <Upload className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-xs font-semibold text-slate-800">
                    {importFileName ? importFileName : 'Klik untuk Memilih File Excel / CSV'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    Mendukung file export rekap gerbang atau absensi harian
                  </span>
                </button>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedImportRecords.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      Preview Data ({parsedImportRecords.length} Catatan Terbaca):
                    </span>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="importRecordMode"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span>Gabungkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                        <input
                          type="radio"
                          name="importRecordMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-amber-700 font-medium">Ganti Semua (Replace)</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-48 text-[11px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 font-semibold text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">Tanggal</th>
                          <th className="py-1.5 px-2">NIS</th>
                          <th className="py-1.5 px-2">Nama Siswa</th>
                          <th className="py-1.5 px-2">Kelas</th>
                          <th className="py-1.5 px-2">Menit</th>
                          <th className="py-1.5 px-2">Alasan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedImportRecords.slice(0, 8).map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 px-2 font-mono whitespace-nowrap">{r.date}</td>
                            <td className="py-1 px-2 font-mono">{r.studentNis}</td>
                            <td className="py-1 px-2 font-medium">{r.studentName}</td>
                            <td className="py-1 px-2">{r.className}</td>
                            <td className="py-1 px-2 font-mono text-red-600 font-bold">+{r.minutesLate}m</td>
                            <td className="py-1 px-2 truncate max-w-[120px]">{r.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setImportModalOpen(false);
                  setParsedImportRecords([]);
                  setImportFileName('');
                  setImportError(null);
                }}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedImportRecords.length === 0}
                onClick={handleCommitImport}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simpan {parsedImportRecords.length} Catatan ke Database Firebase</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
