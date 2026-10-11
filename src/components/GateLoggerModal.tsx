import React, { useState, useId } from 'react';
import { Student, LateRecord, LateReason, EducationalSanction, AppSettings, SchoolClass } from '../types/patrol';
import { calculateMinutesLate, getIndonesianDayName, generateWhatsAppLink } from '../utils/storage';
import { 
  X, 
  Search, 
  Clock, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  ScanLine, 
  UserCheck, 
  Sparkles,
  HelpCircle,
  FileCheck2
} from 'lucide-react';

interface GateLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  existingRecords: LateRecord[];
  onSaveRecord: (record: Omit<LateRecord, 'id' | 'createdAt'>) => void;
  settings?: AppSettings;
  classes?: SchoolClass[];
}

const COMMON_REASONS: LateReason[] = [
  'Bangun kesiangan',
  'Ban bocor / Kendaraan mogok',
  'Macet lalu lintas (Gladak Kembar / PB Sudirman / Roxy)',
  'Mengantar orang tua / adik',
  'Hujan lebat / Cuaca buruk',
  'Ketinggalan angkutan umum',
  'Kendala teknis di perjalanan',
  'Membantu pekerjaan rumah',
  'Lainnya',
];

const SANCTIONS: EducationalSanction[] = [
  'Operasi Semut & Pembersihan Taman Sekolah',
  'Literasi & Resume Buku di Perpustakaan',
  'Menyanyikan Lagu Kebangsaan & Doa Kedisiplinan',
  'Perawatan Tanaman Green House',
  'Piket Kebersihan Lingkungan Masjid',
  'Pengarahan Khusus Tim Piket Kesiswaan',
];

export const GateLoggerModal: React.FC<GateLoggerModalProps> = ({
  isOpen,
  onClose,
  students,
  existingRecords,
  onSaveRecord,
  settings,
  classes = [],
}) => {
  const searchInputId = useId();
  const notesInputId = useId();
  const recordedByInputId = useId();
  const customReasonInputId = useId();

  // Search & Student selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Time & Date
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHour = String(now.getHours()).padStart(2, '0');
  const currentMinute = String(now.getMinutes()).padStart(2, '0');
  const [recordDate, setRecordDate] = useState(todayStr);
  const [recordTime, setRecordTime] = useState(`${currentHour}:${currentMinute}`);

  // Reason & Sanction
  const [selectedReason, setSelectedReason] = useState<LateReason>('Bangun kesiangan');
  const [customReasonText, setCustomReasonText] = useState('');
  const [selectedSanction, setSelectedSanction] = useState<EducationalSanction>(
    'Operasi Semut & Pembersihan Taman Sekolah'
  );
  const [notes, setNotes] = useState('');
  const [recordedBy, setRecordedBy] = useState('Pak Hendra (Piket Gerbang)');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [openWhatsAppDirectly, setOpenWhatsAppDirectly] = useState(false);
  const [justSavedNotification, setJustSavedNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const uniqueClasses = classes.length > 0
    ? Array.from(new Set(classes.map((c) => c.name))).sort()
    : Array.from(new Set(students.map((s) => s.className))).sort();

  // Filter students based on query and class filter
  const filteredStudents = students.filter((s) => {
    if (selectedClassFilter !== 'ALL' && s.className !== selectedClassFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.nis.includes(searchQuery.trim()) ||
        s.className.toLowerCase().includes(q)
      );
    }
    return selectedClassFilter !== 'ALL';
  });

  const gateClosingTime = settings?.gateClosingTime || '07:00';
  const minutesLate = calculateMinutesLate(recordTime, gateClosingTime);

  // Check student's violation history this semester
  const studentPreviousViolations = selectedStudent
    ? existingRecords.filter((r) => r.studentId === selectedStudent.id)
    : [];
  const currentViolationNumber = studentPreviousViolations.length + 1;

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setSearchQuery('');
  };

  const handleQuickScannerSimulation = () => {
    // Pick a random student or cycle through students to simulate rapid barcode scan
    const randomIndex = Math.floor(Math.random() * students.length);
    setSelectedStudent(students[randomIndex]);
    setSearchQuery('');
  };

  const handleSubmit = (keepOpenForNext = false) => {
    if (!selectedStudent) {
      alert('Pilih siswa terlebih dahulu!');
      return;
    }

    const dayOfWeek = getIndonesianDayName(recordDate);
    const finalReason = selectedReason === 'Lainnya' && customReasonText ? customReasonText as LateReason : selectedReason;
    const activeSemesterStr = `${settings?.activeSemester || 'Ganjil'} ${settings?.academicYear || '2025/2026'}` as any;

    const newRecordData: Omit<LateRecord, 'id' | 'createdAt'> = {
      studentId: selectedStudent.id,
      studentNis: selectedStudent.nis,
      studentName: selectedStudent.name,
      className: selectedStudent.className,
      majorId: selectedStudent.majorId,
      date: recordDate,
      time: recordTime,
      minutesLate,
      dayOfWeek,
      semester: activeSemesterStr,
      reason: finalReason,
      customReason: selectedReason === 'Lainnya' ? customReasonText : undefined,
      sanction: selectedSanction,
      notes,
      recordedBy,
      counselingStatus: currentViolationNumber >= 3 ? 'Sedang Dibina' : 'Belum Dibina',
      parentNotified: openWhatsAppDirectly,
    };

    onSaveRecord(newRecordData);

    if (openWhatsAppDirectly) {
      const mockFullRecord: LateRecord = {
        ...newRecordData,
        id: 'temp-id',
        createdAt: new Date().toISOString(),
      };
      const waUrl = generateWhatsAppLink(
        mockFullRecord, 
        selectedStudent, 
        currentViolationNumber,
        settings?.schoolName,
        settings?.schoolAddress
      );
      window.open(waUrl, '_blank');
    }

    setJustSavedNotification(`Berhasil mencatat: ${selectedStudent.name} (${selectedStudent.className})`);
    setTimeout(() => setJustSavedNotification(null), 3000);

    if (keepOpenForNext) {
      // Reset only student and notes, keep time/date/recorder
      setSelectedStudent(null);
      setSearchQuery('');
      setNotes('');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">
                Pencatatan Keterlambatan Gerbang
              </h2>
              <p className="text-xs text-slate-300">
                Piket {settings?.schoolName || 'SMKN 1 Jember'} • Batas Masuk {gateClosingTime} WIB
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if just saved */}
        {justSavedNotification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-800 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{justSavedNotification}</span>
          </div>
        )}

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-slate-800">
          {/* Step 1: Identitas Siswa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor={searchInputId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                1. Cari / Scan Siswa
              </label>
              <button
                type="button"
                onClick={handleQuickScannerSimulation}
                className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                title="Simulasi pemindaian barcode kartu pelajar untuk demo cepat"
              >
                <ScanLine className="w-3.5 h-3.5" />
                <span>Simulasi Scan Barcode Kartu</span>
              </button>
            </div>

            {!selectedStudent ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="sm:w-48 shrink-0">
                    <select
                      value={selectedClassFilter}
                      onChange={(e) => setSelectedClassFilter(e.target.value)}
                      className="w-full py-2 px-2.5 text-xs border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="ALL">🔍 Semua Kelas ({uniqueClasses.length})</option>
                      {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          Kelas: {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      id={searchInputId}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={selectedClassFilter !== 'ALL' ? `Cari siswa di kelas ${selectedClassFilter}...` : "Ketik Nama, NIS, atau Kelas..."}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Autocomplete Dropdown or Class Student List */}
                {(searchQuery.trim().length > 0 || selectedClassFilter !== 'ALL') && (
                  <div className="border border-slate-200 rounded-lg shadow-lg bg-white max-h-52 overflow-y-auto divide-y divide-slate-100 z-10">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((std) => (
                        <button
                          key={std.id}
                          type="button"
                          onClick={() => handleSelectStudent(std)}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{std.name}</span>
                            <div className="text-[11px] text-slate-500">
                              NIS: {std.nis} · <span className="font-medium text-blue-700">{std.className}</span> · Wali: {std.waliKelas}
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 font-semibold">
                            Pilih Siswa
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-xs text-slate-500 text-center">
                        Tidak ada siswa yang cocok {selectedClassFilter !== 'ALL' ? `di kelas ${selectedClassFilter}` : `dengan kata kunci "${searchQuery}"`}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Selected Student Info Card */
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {selectedStudent.name}
                    </h3>
                    <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-x-2">
                      <span>NIS: <strong className="font-mono">{selectedStudent.nis}</strong></span>
                      <span>·</span>
                      <span>Kelas: <strong className="font-medium">{selectedStudent.className}</strong></span>
                      <span>·</span>
                      <span>Wali: {selectedStudent.waliKelas}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Wali Murid: {selectedStudent.parentName} ({selectedStudent.parentPhone})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-slate-500 hover:text-red-600 font-medium px-2 py-1 hover:bg-white rounded transition-colors"
                >
                  Ganti
                </button>
              </div>
            )}

            {/* Violation History Badge */}
            {selectedStudent && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  currentViolationNumber >= 7
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : currentViolationNumber >= 4
                    ? 'bg-orange-50 border-orange-300 text-orange-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${
                      currentViolationNumber >= 7
                        ? 'text-red-600'
                        : currentViolationNumber >= 4
                        ? 'text-orange-600'
                        : 'text-emerald-600'
                    }`}
                  />
                  <span>
                    <strong>Keterlambatan ke-{currentViolationNumber}</strong> semester ini.
                    {currentViolationNumber >= 7 ? (
                      <span className="font-bold ml-1 text-red-700">
                        (Kategori Merah: Wajib Panggilan Orang Tua ke Sekolah)
                      </span>
                    ) : currentViolationNumber >= 4 ? (
                      <span className="font-semibold ml-1 text-orange-700">
                        (Kategori Orange: Masuk Pembinaan Guru BK &amp; Wali Kelas)
                      </span>
                    ) : (
                      <span className="ml-1 text-emerald-700 font-medium">
                        (Kategori Hijau: Teguran &amp; Sanksi Edukatif)
                      </span>
                    )}
                  </span>
                </div>
                <span className="font-mono font-semibold text-[11px] whitespace-nowrap">
                  Total: {studentPreviousViolations.length}x sebelumnya
                </span>
              </div>
            )}
          </div>

          {/* Step 2: Waktu Kedatangan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor="record-date" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Kedatangan
              </label>
              <input
                id="record-date"
                type="date"
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="record-time" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Jam Tiba (WIB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="record-time"
                  type="time"
                  value={recordTime}
                  onChange={(e) => setRecordTime(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    setRecordTime(
                      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                    );
                  }}
                  className="text-xs px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg whitespace-nowrap transition-colors"
                >
                  Sekarang
                </button>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Terlambat: <span className="font-mono font-bold text-red-600 tabular-nums">{minutesLate} menit</span> (batas 07:00)
              </div>
            </div>
          </div>

          {/* Step 3: Alasan Keterlambatan */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              2. Alasan Keterlambatan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {COMMON_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`text-left p-2 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
            {selectedReason === 'Lainnya' && (
              <input
                id={customReasonInputId}
                aria-label="Tulis alasan spesifik jika memilih Lainnya"
                type="text"
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder="Tulis alasan spesifik..."
                className="w-full mt-2 text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Step 4: Sanksi Edukatif */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor="sanction-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              3. Sanksi Edukatif Terapan (Piket)
            </label>
            <select
              id="sanction-select"
              value={selectedSanction}
              onChange={(e) => setSelectedSanction(e.target.value as EducationalSanction)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 bg-white"
            >
              {SANCTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Step 5: Catatan & Petugas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label htmlFor={notesInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Catatan Kejadian (Opsional)
              </label>
              <input
                id={notesInputId}
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Ban bocor di Jl. Gajah Mada..."
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={recordedByInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Petugas Piket
              </label>
              <input
                id={recordedByInputId}
                type="text"
                value={recordedBy}
                onChange={(e) => setRecordedBy(e.target.value)}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Toggle WhatsApp notification */}
          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={openWhatsAppDirectly}
                onChange={(e) => setOpenWhatsAppDirectly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="font-medium flex items-center gap-1.5 text-emerald-800">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                Langsung buka WhatsApp untuk kirim notifikasi resmi ke Orang Tua
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Batal
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors shadow-xs"
            >
              Simpan & Lanjut Siswa Lain
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Simpan Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
