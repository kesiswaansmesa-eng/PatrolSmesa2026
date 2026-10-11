import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, MajorId } from '../types/patrol';
import { MAJORS } from '../data/initialData';
import { 
  Users, 
  Upload, 
  Download, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  HelpCircle,
  FileCheck,
  Building,
  GraduationCap
} from 'lucide-react';

interface MasterDataViewProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  onToast: (msg: string) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  students,
  onUpdateStudents,
  onToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Modal states
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Import preview state
  const [parsedImportRows, setParsedImportRows] = useState<Partial<Student>[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Manual student form
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nis: '',
    nisn: '',
    name: '',
    gender: 'L',
    majorId: 'RPL',
    grade: 'X',
    className: 'X RPL 1',
    parentName: '',
    parentPhone: '628',
    waliKelas: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.name.toLowerCase().includes(q) ||
        s.nis.includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.parentName.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedMajor !== 'ALL' && s.majorId !== selectedMajor) return false;
    if (selectedClass !== 'ALL' && s.className !== selectedClass) return false;
    return true;
  });

  const uniqueClasses = Array.from(new Set(students.map((s) => s.className))).sort();

  // Handle Download Sample Excel / CSV
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIS: '23241099',
        NISN: '0065412999',
        Nama: 'Budi Santoso Nugroho',
        Jenis_Kelamin: 'L',
        Kelas: 'X RPL 1',
        Jurusan: 'RPL',
        Nama_Orang_Tua: 'Sutrisno',
        No_WA_Orang_Tua: '6281234567899',
        Wali_Kelas: 'Danang Prasetyo, S.Kom.',
      },
      {
        NIS: '23241100',
        NISN: '0065413000',
        Nama: 'Siti Nur Aisyah',
        Jenis_Kelamin: 'P',
        Kelas: 'XI AKL 2',
        Jurusan: 'AKL',
        Nama_Orang_Tua: 'Abdul Halim',
        No_WA_Orang_Tua: '6281234567888',
        Wali_Kelas: 'Dra. Sri Wahyuni',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Siswa');
    XLSX.writeFile(wb, 'Template_Import_Siswa_PATROL_SMESA.xlsx');
    onToast('Template Excel berhasil diunduh.');
  };

  // Handle File Upload (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setImportError('File kosong atau format tidak sesuai.');
          return;
        }

        // Map columns with flexible headers
        const parsed: Partial<Student>[] = rawJson.map((row, idx) => {
          const nis = String(row['NIS'] || row['nis'] || row['Nomor Induk'] || '').trim();
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          const name = String(row['Nama'] || row['nama'] || row['Nama Siswa'] || row['Nama Lengkap'] || '').trim();
          const gender = (String(row['Jenis_Kelamin'] || row['Gender'] || row['JK'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L') as 'L' | 'P';
          const className = String(row['Kelas'] || row['kelas'] || row['Rombel'] || 'X RPL 1').trim();
          
          let majorId: MajorId = 'RPL';
          const rawMajor = String(row['Jurusan'] || row['major'] || '').toUpperCase();
          if (['RPL', 'PPLG'].some((k) => rawMajor.includes(k))) majorId = 'RPL';
          else if (['AKL', 'AKUNTANSI'].some((k) => rawMajor.includes(k))) majorId = 'AKL';
          else if (['MPLB', 'OTKP', 'PERKANTORAN'].some((k) => rawMajor.includes(k))) majorId = 'MPLB';
          else if (['BD', 'BDP', 'PEMASARAN', 'BISNIS'].some((k) => rawMajor.includes(k))) majorId = 'BD';
          else if (['DKV', 'DESAIN'].some((k) => rawMajor.includes(k))) majorId = 'DKV';
          else if (['KL', 'KULINER', 'BOGA'].some((k) => rawMajor.includes(k))) majorId = 'KL';
          else if (['HTL', 'HOTEL', 'PERHOTELAN'].some((k) => rawMajor.includes(k))) majorId = 'HTL';

          const parentName = String(row['Nama_Orang_Tua'] || row['Orang Tua'] || row['Wali'] || '-').trim();
          let parentPhone = String(row['No_WA_Orang_Tua'] || row['No WA'] || row['No HP'] || row['Telepon'] || '628').trim();
          if (parentPhone.startsWith('0')) parentPhone = '62' + parentPhone.slice(1);

          const waliKelas = String(row['Wali_Kelas'] || row['Wali Kelas'] || 'Wali Kelas').trim();

          const grade = className.toUpperCase().startsWith('XII') ? 'XII' : className.toUpperCase().startsWith('XI') ? 'XI' : 'X';

          return {
            id: `std-imp-${Date.now()}-${idx}`,
            nis: nis || `2324${String(1000 + idx)}`,
            nisn: nisn || `006${String(500000 + idx)}`,
            name: name || `Siswa Baru ${idx + 1}`,
            gender,
            majorId,
            grade,
            className,
            parentName,
            parentPhone,
            waliKelas,
          };
        });

        setParsedImportRows(parsed);
      } catch (err) {
        console.error('Error parsing excel', err);
        setImportError('Gagal membaca file Excel/CSV. Pastikan format file valid.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit Import
  const handleCommitImport = () => {
    if (parsedImportRows.length === 0) return;

    let updated: Student[] = [];
    if (importMode === 'replace') {
      updated = parsedImportRows as Student[];
    } else {
      // Append without duplicating NIS
      const existingNis = new Set(students.map((s) => s.nis));
      const newItems = (parsedImportRows as Student[]).filter((s) => !existingNis.has(s.nis));
      updated = [...students, ...newItems];
    }

    onUpdateStudents(updated);
    onToast(`Berhasil mengimpor ${parsedImportRows.length} data siswa.`);
    setImportModalOpen(false);
    setParsedImportRows([]);
    setImportFileName('');
  };

  // Export All Students to Excel
  const handleExportStudents = () => {
    const exportRows = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      NISN: s.nisn,
      Nama_Siswa: s.name,
      Jenis_Kelamin: s.gender,
      Kelas: s.className,
      Jurusan: s.majorId,
      Nama_Orang_Tua: s.parentName,
      No_WhatsApp_Ortu: s.parentPhone,
      Wali_Kelas: s.waliKelas,
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Siswa');
    XLSX.writeFile(wb, `Master_Data_Siswa_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Data master siswa berhasil diekspor ke Excel.');
  };

  // Open Add / Edit Modal
  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      nis: '',
      nisn: '',
      name: '',
      gender: 'L',
      majorId: 'RPL',
      grade: 'X',
      className: 'X RPL 1',
      parentName: '',
      parentPhone: '628',
      waliKelas: '',
    });
    setStudentModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis,
      nisn: student.nisn,
      name: student.name,
      gender: student.gender,
      majorId: student.majorId,
      grade: student.grade,
      className: student.className,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      waliKelas: student.waliKelas,
    });
    setStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      const updated = students.map((s) =>
        s.id === editingStudent.id ? { ...s, ...formData } : s
      );
      onUpdateStudents(updated);
      onToast(`Data siswa ${formData.name} berhasil diperbarui.`);
    } else {
      const newStudent: Student = {
        ...formData,
        id: `std-${Date.now()}`,
      };
      onUpdateStudents([newStudent, ...students]);
      onToast(`Siswa baru ${formData.name} berhasil ditambahkan.`);
    }
    setStudentModalOpen(false);
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Hapus data siswa ${student.name} (${student.className})?`)) {
      const updated = students.filter((s) => s.id !== student.id);
      onUpdateStudents(updated);
      onToast(`Siswa ${student.name} berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <span>Manajemen Basis Data Siswa &amp; Rombel</span>
            <span>·</span>
            <span>SMK Negeri 1 Jember</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Master Data Siswa &amp; Import Excel
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Kelola data siswa, rombel, nomor kontak WhatsApp orang tua, dan unggah data massal dari file Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleDownloadTemplate}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Unduh template Excel untuk input massal"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Format Excel</span>
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>Import Excel / CSV</span>
          </button>
          <button
            onClick={handleExportStudents}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
            <span>Ekspor Data</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Siswa Aktif</div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
              {students.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Terdaftar di master data</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Rombel / Kelas</div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
              {uniqueClasses.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tingkat X, XI, dan XII</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Konsentrasi Keahlian</div>
            <div className="text-2xl font-mono font-bold text-slate-900 mt-1 tabular-nums">
              {MAJORS.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Program keahlian kejuruan</div>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Nama, NIS, Kelas, atau Orang Tua..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">Semua Jurusan</option>
            {MAJORS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.name.split('(')[0]}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="py-2 px-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="ALL">Semua Kelas</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          {(searchQuery || selectedMajor !== 'ALL' || selectedClass !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMajor('ALL');
                setSelectedClass('ALL');
              }}
              className="text-xs text-blue-700 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Student Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Daftar Siswa Terdaftar ({filteredStudents.length} siswa)
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Menampilkan data aktif
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-700">Tidak ada siswa ditemukan</div>
            <p className="text-xs text-slate-400 mt-1">
              Sesuaikan filter atau gunakan fitur Tambah Siswa / Import Excel.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">No</th>
                  <th className="py-2.5 px-3">NIS / NISN</th>
                  <th className="py-2.5 px-3">Nama Siswa</th>
                  <th className="py-2.5 px-3 text-center">L/P</th>
                  <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                  <th className="py-2.5 px-3">Wali Murid &amp; WhatsApp</th>
                  <th className="py-2.5 px-3">Wali Kelas</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((std, idx) => (
                  <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{std.nis}</div>
                      <div className="text-[10px] text-slate-500">{std.nisn}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{std.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                      {std.gender}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{std.className}</div>
                      <div className="text-[10px] text-slate-500">{std.majorId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-900 font-medium">{std.parentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{std.parentPhone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      {std.waliKelas}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(std)}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Data Siswa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(std)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: IMPORT EXCEL / CSV */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Import Data Siswa dari Excel / CSV</h3>
              </div>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  setParsedImportRows([]);
                  setImportFileName('');
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Instructions */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Petunjuk Format File Excel (.xlsx / .csv):</div>
                  <p className="text-[11px] leading-relaxed">
                    Pastikan file Anda memuat kolom: <strong>NIS</strong>, <strong>NISN</strong>, <strong>Nama</strong>, <strong>Kelas</strong>, <strong>Jurusan</strong> (RPL/AKL/MPLB/BD/DKV/KL/HTL), <strong>Nama_Orang_Tua</strong>, <strong>No_WA_Orang_Tua</strong>, dan <strong>Wali_Kelas</strong>.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-blue-700 underline font-semibold text-[11px]"
                  >
                    Klik di sini untuk mengunduh file template contoh.
                  </button>
                </div>
              </div>

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="font-semibold text-slate-700 mb-1">
                  Pilih file Excel (.xlsx, .xls) atau CSV dari komputer
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {importFileName ? `File terpilih: ${importFileName}` : 'Klik tombol di bawah untuk memilih file'}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Pilih File Excel
                </button>
              </div>

              {importError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview of Parsed Rows */}
              {parsedImportRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Preview Data ({parsedImportRows.length} baris terbaca):
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-blue-600"
                        />
                        <span>Tambahkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-red-600"
                        />
                        <span className="text-red-700 font-semibold">Gantikan Seluruh Data</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 font-semibold text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">NIS</th>
                          <th className="py-1.5 px-2">Nama</th>
                          <th className="py-1.5 px-2">Kelas</th>
                          <th className="py-1.5 px-2">Jurusan</th>
                          <th className="py-1.5 px-2">No WA Ortu</th>
                          <th className="py-1.5 px-2">Wali Kelas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedImportRows.slice(0, 10).map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 px-2 font-mono">{r.nis}</td>
                            <td className="py-1 px-2 font-medium">{r.name}</td>
                            <td className="py-1 px-2">{r.className}</td>
                            <td className="py-1 px-2">{r.majorId}</td>
                            <td className="py-1 px-2 font-mono">{r.parentPhone}</td>
                            <td className="py-1 px-2">{r.waliKelas}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedImportRows.length > 10 && (
                    <div className="text-[10px] text-slate-400 italic text-center">
                      + {parsedImportRows.length - 10} baris lainnya siap diimpor...
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedImportRows.length === 0}
                onClick={handleCommitImport}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simpan {parsedImportRows.length} Siswa ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH / EDIT SISWA MANUAL */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setStudentModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIS (Nomor Induk)</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jurusan</label>
                  <select
                    value={formData.majorId}
                    onChange={(e) => setFormData({ ...formData, majorId: e.target.value as MajorId })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {MAJORS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rombel / Kelas</label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    placeholder="Contoh: X RPL 1"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp Ortu</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="62812345678"
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  value={formData.waliKelas}
                  onChange={(e) => setFormData({ ...formData, waliKelas: e.target.value })}
                  placeholder="Contoh: Danang Prasetyo, S.Kom."
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
