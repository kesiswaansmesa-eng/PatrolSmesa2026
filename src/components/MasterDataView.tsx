import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, MajorId, GuruBK, KKK, TimKesiswaan } from '../types/patrol';
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
  GraduationCap,
  HeartHandshake,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Database,
  ArrowDownToLine,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';

interface MasterDataViewProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  guruBK?: GuruBK[];
  onUpdateGuruBK?: (list: GuruBK[]) => void;
  kkkList?: KKK[];
  onUpdateKKK?: (list: KKK[]) => void;
  timKesiswaan?: TimKesiswaan[];
  onUpdateTimKesiswaan?: (list: TimKesiswaan[]) => void;
  onResetViolations?: () => void;
  onWipeAllData?: () => void;
  onBackupData?: () => void;
  onRestoreData?: (file: File) => void;
  onToast: (msg: string) => void;
}

export type MasterTab = 'siswa' | 'guru_bk' | 'kkk' | 'tim_kesiswaan';

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  students,
  onUpdateStudents,
  guruBK = [],
  onUpdateGuruBK,
  kkkList = [],
  onUpdateKKK,
  timKesiswaan = [],
  onUpdateTimKesiswaan,
  onResetViolations,
  onWipeAllData,
  onBackupData,
  onRestoreData,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('siswa');

  // Search & Filters for Siswa
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  // Search for Other Master Data
  const [bkSearch, setBkSearch] = useState('');
  const [kkkSearch, setKkkSearch] = useState('');
  const [kesiswaanSearch, setKesiswaanSearch] = useState('');

  // Confirmation Modals
  const [confirmResetViolationsOpen, setConfirmResetViolationsOpen] = useState(false);
  const [confirmWipeOpen, setConfirmWipeOpen] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');

  // Modals state for Students
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Modals state for Guru BK
  const [bkModalOpen, setBkModalOpen] = useState(false);
  const [editingBk, setEditingBk] = useState<GuruBK | null>(null);
  const [bkForm, setBkForm] = useState<Omit<GuruBK, 'id'>>({
    nip: '',
    name: '',
    phone: '628',
    roleTitle: 'Guru BK Tingkat X',
    specialization: '',
    email: '',
    status: 'Aktif',
  });

  // Modals state for KKK
  const [kkkModalOpen, setKkkModalOpen] = useState(false);
  const [editingKkk, setEditingKkk] = useState<KKK | null>(null);
  const [kkkForm, setKkkForm] = useState<Omit<KKK, 'id'>>({
    nip: '',
    name: '',
    majorId: 'RPL',
    majorName: 'Pengembangan Perangkat Lunak & Gim (PPLG / RPL)',
    phone: '628',
    officeRoom: '',
    email: '',
    status: 'Aktif',
  });

  // Modals state for Tim Kesiswaan
  const [kesiswaanModalOpen, setKesiswaanModalOpen] = useState(false);
  const [editingKesiswaan, setEditingKesiswaan] = useState<TimKesiswaan | null>(null);
  const [kesiswaanForm, setKesiswaanForm] = useState<Omit<TimKesiswaan, 'id'>>({
    nip: '',
    name: '',
    position: 'Koordinator Ketertiban, Disiplin & Piket',
    phone: '628',
    email: '',
    status: 'Aktif',
  });

  // Import preview state for Siswa
  const [parsedImportRows, setParsedImportRows] = useState<Partial<Student>[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importFileName, setImportFileName] = useState<string>('');
  const [importError, setImportError] = useState<string | null>(null);

  // Import preview state for Guru BK
  const [bkImportModalOpen, setBkImportModalOpen] = useState(false);
  const [parsedImportBkRows, setParsedImportBkRows] = useState<Partial<GuruBK>[]>([]);
  const [importBkMode, setImportBkMode] = useState<'append' | 'replace'>('append');
  const [importBkFileName, setImportBkFileName] = useState<string>('');
  const [importBkError, setImportBkError] = useState<string | null>(null);

  // Import preview state for KKK
  const [kkkImportModalOpen, setKkkImportModalOpen] = useState(false);
  const [parsedImportKkkRows, setParsedImportKkkRows] = useState<Partial<KKK>[]>([]);
  const [importKkkMode, setImportKkkMode] = useState<'append' | 'replace'>('append');
  const [importKkkFileName, setImportKkkFileName] = useState<string>('');
  const [importKkkError, setImportKkkError] = useState<string | null>(null);

  // Import preview state for Tim Kesiswaan
  const [kesiswaanImportModalOpen, setKesiswaanImportModalOpen] = useState(false);
  const [parsedImportKesiswaanRows, setParsedImportKesiswaanRows] = useState<Partial<TimKesiswaan>[]>([]);
  const [importKesiswaanMode, setImportKesiswaanMode] = useState<'append' | 'replace'>('append');
  const [importKesiswaanFileName, setImportKesiswaanFileName] = useState<string>('');
  const [importKesiswaanError, setImportKesiswaanError] = useState<string | null>(null);

  // Student Form
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
  const bkFileInputRef = useRef<HTMLInputElement>(null);
  const kkkFileInputRef = useRef<HTMLInputElement>(null);
  const kesiswaanFileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  // ========================
  // SISWA FILTERING & CRUD
  // ========================
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

  const handleCommitImport = () => {
    if (parsedImportRows.length === 0) return;

    let updated: Student[] = [];
    if (importMode === 'replace') {
      updated = parsedImportRows as Student[];
    } else {
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
    if (!formData.name || !formData.nis || !formData.className) {
      alert('Nama, NIS, dan Kelas wajib diisi.');
      return;
    }

    let updated: Student[];
    if (editingStudent) {
      updated = students.map((s) =>
        s.id === editingStudent.id ? { ...formData, id: editingStudent.id } : s
      );
      onToast(`Data siswa ${formData.name} berhasil diperbarui.`);
    } else {
      const newStd: Student = {
        ...formData,
        id: `std-${Date.now()}`,
      };
      updated = [newStd, ...students];
      onToast(`Siswa ${formData.name} berhasil ditambahkan ke master data.`);
    }

    onUpdateStudents(updated);
    setStudentModalOpen(false);
  };

  const handleDeleteStudent = (student: Student) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${student.name} (${student.nis})?`)) {
      const updated = students.filter((s) => s.id !== student.id);
      onUpdateStudents(updated);
      onToast(`Siswa ${student.name} telah dihapus dari sistem.`);
    }
  };

  // ========================
  // GURU BK CRUD & EXPORT
  // ========================
  const filteredGuruBK = guruBK.filter((b) => {
    if (!bkSearch.trim()) return true;
    const q = bkSearch.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.nip.includes(q) ||
      b.roleTitle.toLowerCase().includes(q) ||
      (b.specialization && b.specialization.toLowerCase().includes(q))
    );
  });

  const handleOpenAddBk = () => {
    setEditingBk(null);
    setBkForm({
      nip: '',
      name: '',
      phone: '628',
      roleTitle: 'Guru BK Tingkat X',
      specialization: '',
      email: '',
      status: 'Aktif',
    });
    setBkModalOpen(true);
  };

  const handleOpenEditBk = (bk: GuruBK) => {
    setEditingBk(bk);
    setBkForm({
      nip: bk.nip,
      name: bk.name,
      phone: bk.phone,
      roleTitle: bk.roleTitle,
      specialization: bk.specialization || '',
      email: bk.email || '',
      status: bk.status,
    });
    setBkModalOpen(true);
  };

  const handleSaveBk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bkForm.name || !bkForm.nip) {
      alert('Nama dan NIP wajib diisi.');
      return;
    }
    let updated: GuruBK[];
    if (editingBk) {
      updated = guruBK.map((b) => (b.id === editingBk.id ? { ...bkForm, id: editingBk.id } : b));
      onToast(`Data Guru BK ${bkForm.name} berhasil diperbarui.`);
    } else {
      const newBk: GuruBK = { ...bkForm, id: `bk-${Date.now()}` };
      updated = [...guruBK, newBk];
      onToast(`Guru BK ${bkForm.name} berhasil ditambahkan.`);
    }
    onUpdateGuruBK?.(updated);
    setBkModalOpen(false);
  };

  const handleDeleteBk = (bk: GuruBK) => {
    if (confirm(`Hapus data Guru BK ${bk.name}?`)) {
      const updated = guruBK.filter((b) => b.id !== bk.id);
      onUpdateGuruBK?.(updated);
      onToast(`Guru BK ${bk.name} berhasil dihapus.`);
    }
  };

  const handleExportGuruBK = () => {
    const exportRows = filteredGuruBK.map((b, idx) => ({
      No: idx + 1,
      NIP: b.nip,
      Nama_Lengkap: b.name,
      Penugasan_Tingkat: b.roleTitle,
      Spesialisasi_Bidang: b.specialization || '-',
      No_WhatsApp: b.phone,
      Email: b.email || '-',
      Status: b.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Guru_BK');
    XLSX.writeFile(wb, `Master_Guru_BK_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Data Master Guru BK berhasil diekspor.');
  };

  // Template & Import for Guru BK
  const handleDownloadTemplateBK = () => {
    const templateData = [
      {
        NIP: '198005122005011005',
        Nama_Lengkap: 'Dra. Hj. Siti Romlah, M.Pd.',
        Penugasan: 'Koordinator Guru BK',
        Spesialisasi: 'Konseling Karir & Perguruan Tinggi',
        No_WhatsApp: '6281234567111',
        Email: 'siti.romlah@smkn1jember.sch.id',
        Status: 'Aktif',
      },
      {
        NIP: '198402152008012004',
        Nama_Lengkap: 'Ahmad Fauzi, S.Pd., Kons.',
        Penugasan: 'Guru BK Tingkat X (Fase E)',
        Spesialisasi: 'Kedisiplinan & Masalah Perilaku',
        No_WhatsApp: '6281234567222',
        Email: 'ahmad.fauzi@smkn1jember.sch.id',
        Status: 'Aktif',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Guru_BK');
    XLSX.writeFile(wb, 'Template_Import_Guru_BK_PATROL_SMESA.xlsx');
    onToast('Template Excel Guru BK berhasil diunduh.');
  };

  const handleFileUploadBK = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportBkFileName(file.name);
    setImportBkError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setImportBkError('File kosong atau format tidak sesuai.');
          return;
        }

        const parsed: Partial<GuruBK>[] = rawJson.map((row, idx) => {
          const nip = String(row['NIP'] || row['nip'] || row['Nomor Induk'] || '').trim();
          const name = String(row['Nama_Lengkap'] || row['Nama'] || row['nama'] || row['Nama Guru'] || '').trim();
          const roleTitle = String(row['Penugasan'] || row['Jabatan'] || row['roleTitle'] || row['Tingkat'] || 'Guru BK').trim();
          const specialization = String(row['Spesialisasi'] || row['Bidang'] || row['specialization'] || '').trim();
          let phone = String(row['No_WhatsApp'] || row['No WA'] || row['Telepon'] || row['phone'] || '628').trim();
          if (phone.startsWith('0')) phone = '62' + phone.slice(1);
          const email = String(row['Email'] || row['email'] || '').trim();
          const rawStatus = String(row['Status'] || row['status'] || 'Aktif').trim();
          const status = rawStatus.toLowerCase().includes('cuti') ? 'Cuti' : 'Aktif';

          return {
            id: `bk-imp-${Date.now()}-${idx}`,
            nip: nip || `19800000000000${String(1000 + idx)}`,
            name: name || `Guru BK Baru ${idx + 1}`,
            roleTitle: roleTitle || 'Guru BK',
            specialization,
            phone: phone || '628123456789',
            email,
            status,
          };
        });

        setParsedImportBkRows(parsed);
      } catch (err) {
        console.error('Error parsing excel Guru BK', err);
        setImportBkError('Gagal membaca file Excel/CSV. Pastikan format file valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImportBK = () => {
    if (parsedImportBkRows.length === 0) return;

    let updated: GuruBK[] = [];
    if (importBkMode === 'replace') {
      updated = parsedImportBkRows as GuruBK[];
    } else {
      const existingNip = new Set(guruBK.map((b) => b.nip));
      const newItems = (parsedImportBkRows as GuruBK[]).filter((b) => !existingNip.has(b.nip));
      updated = [...guruBK, ...newItems];
    }

    onUpdateGuruBK?.(updated);
    onToast(`Berhasil mengimpor ${parsedImportBkRows.length} data Guru BK.`);
    setBkImportModalOpen(false);
    setParsedImportBkRows([]);
    setImportBkFileName('');
  };

  // ========================
  // KKK CRUD & EXPORT
  // ========================
  const filteredKKK = kkkList.filter((k) => {
    if (!kkkSearch.trim()) return true;
    const q = kkkSearch.toLowerCase();
    return (
      k.name.toLowerCase().includes(q) ||
      k.nip.includes(q) ||
      k.majorName.toLowerCase().includes(q) ||
      k.majorId.toLowerCase().includes(q)
    );
  });

  const handleOpenAddKkk = () => {
    setEditingKkk(null);
    setKkkForm({
      nip: '',
      name: '',
      majorId: 'RPL',
      majorName: MAJORS.find((m) => m.id === 'RPL')?.name || 'RPL',
      phone: '628',
      officeRoom: 'Ruang KKK & Lab',
      email: '',
      status: 'Aktif',
    });
    setKkkModalOpen(true);
  };

  const handleOpenEditKkk = (kkk: KKK) => {
    setEditingKkk(kkk);
    setKkkForm({
      nip: kkk.nip,
      name: kkk.name,
      majorId: kkk.majorId,
      majorName: kkk.majorName,
      phone: kkk.phone,
      officeRoom: kkk.officeRoom || '',
      email: kkk.email || '',
      status: kkk.status,
    });
    setKkkModalOpen(true);
  };

  const handleSaveKkk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kkkForm.name) {
      alert('Nama Kepala Konsentrasi Keahlian wajib diisi.');
      return;
    }
    const matchedMajor = MAJORS.find((m) => m.id === kkkForm.majorId);
    const resolvedForm = {
      ...kkkForm,
      majorName: matchedMajor ? matchedMajor.name : kkkForm.majorName,
    };

    let updated: KKK[];
    if (editingKkk) {
      updated = kkkList.map((k) => (k.id === editingKkk.id ? { ...resolvedForm, id: editingKkk.id } : k));
      onToast(`Data KKK ${resolvedForm.name} berhasil diperbarui.`);
    } else {
      const newKkk: KKK = { ...resolvedForm, id: `kkk-${Date.now()}` };
      updated = [...kkkList, newKkk];
      onToast(`Ketua Konsentrasi Keahlian ${resolvedForm.name} berhasil ditambahkan.`);
    }
    onUpdateKKK?.(updated);
    setKkkModalOpen(false);
  };

  const handleDeleteKkk = (kkk: KKK) => {
    if (confirm(`Hapus data KKK ${kkk.name}?`)) {
      const updated = kkkList.filter((k) => k.id !== kkk.id);
      onUpdateKKK?.(updated);
      onToast(`Data KKK ${kkk.name} berhasil dihapus.`);
    }
  };

  const handleExportKKK = () => {
    const exportRows = filteredKKK.map((k, idx) => ({
      No: idx + 1,
      NIP: k.nip,
      Nama_Lengkap: k.name,
      Konsentrasi_Keahlian: k.majorName,
      Kode_Jurusan: k.majorId,
      Ruang_Kantor_Lab: k.officeRoom || '-',
      No_WhatsApp: k.phone,
      Email: k.email || '-',
      Status: k.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_KKK');
    XLSX.writeFile(wb, `Master_KKK_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Data Master KKK berhasil diekspor.');
  };

  // Template & Import for KKK
  const handleDownloadTemplateKKK = () => {
    const templateData = [
      {
        NIP: '197803122003121002',
        Nama_Lengkap: 'Ir. Bambang Supriyadi, M.T.',
        Kode_Jurusan: 'RPL',
        Konsentrasi_Keahlian: 'Pengembangan Perangkat Lunak & Gim (PPLG / RPL)',
        Ruang_Kantor_Lab: 'Ruang KKK PPLG & Bengkel Software Lt. 2',
        No_WhatsApp: '6281234567201',
        Email: 'bambang.pplg@smkn1jember.sch.id',
        Status: 'Aktif',
      },
      {
        NIP: '198107242006042011',
        Nama_Lengkap: 'Dra. Endang Susilowati, M.M.',
        Kode_Jurusan: 'AKL',
        Konsentrasi_Keahlian: 'Akuntansi & Keuangan Lembaga (AKL)',
        Ruang_Kantor_Lab: 'Ruang KKK AKL / Bank Mini SMESA',
        No_WhatsApp: '6281234567202',
        Email: 'endang.akl@smkn1jember.sch.id',
        Status: 'Aktif',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_KKK');
    XLSX.writeFile(wb, 'Template_Import_KKK_PATROL_SMESA.xlsx');
    onToast('Template Excel KKK berhasil diunduh.');
  };

  const handleFileUploadKKK = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportKkkFileName(file.name);
    setImportKkkError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setImportKkkError('File kosong atau format tidak sesuai.');
          return;
        }

        const parsed: Partial<KKK>[] = rawJson.map((row, idx) => {
          const nip = String(row['NIP'] || row['nip'] || '').trim();
          const name = String(row['Nama_Lengkap'] || row['Nama'] || row['nama'] || '').trim();
          const rawMajor = String(row['Kode_Jurusan'] || row['Jurusan'] || row['Konsentrasi_Keahlian'] || 'RPL').toUpperCase();
          
          let majorId: MajorId = 'RPL';
          if (['RPL', 'PPLG'].some((k) => rawMajor.includes(k))) majorId = 'RPL';
          else if (['AKL', 'AKUNTANSI'].some((k) => rawMajor.includes(k))) majorId = 'AKL';
          else if (['MPLB', 'OTKP', 'PERKANTORAN'].some((k) => rawMajor.includes(k))) majorId = 'MPLB';
          else if (['BD', 'BDP', 'PEMASARAN', 'BISNIS'].some((k) => rawMajor.includes(k))) majorId = 'BD';
          else if (['DKV', 'DESAIN'].some((k) => rawMajor.includes(k))) majorId = 'DKV';
          else if (['KL', 'KULINER', 'BOGA'].some((k) => rawMajor.includes(k))) majorId = 'KL';
          else if (['HTL', 'HOTEL', 'PERHOTELAN'].some((k) => rawMajor.includes(k))) majorId = 'HTL';

          const matchedMajor = MAJORS.find((m) => m.id === majorId);
          const majorName = String(row['Konsentrasi_Keahlian'] || matchedMajor?.name || majorId).trim();
          const officeRoom = String(row['Ruang_Kantor_Lab'] || row['Ruang'] || row['Lab'] || '').trim();

          let phone = String(row['No_WhatsApp'] || row['No WA'] || row['Telepon'] || row['phone'] || '628').trim();
          if (phone.startsWith('0')) phone = '62' + phone.slice(1);
          const email = String(row['Email'] || row['email'] || '').trim();
          const rawStatus = String(row['Status'] || row['status'] || 'Aktif').trim();
          const status = rawStatus.toLowerCase().includes('cuti') ? 'Cuti' : 'Aktif';

          return {
            id: `kkk-imp-${Date.now()}-${idx}`,
            nip: nip || `19780000000000${String(1000 + idx)}`,
            name: name || `Kepala Konsentrasi Keahlian ${idx + 1}`,
            majorId,
            majorName,
            officeRoom,
            phone: phone || '628123456789',
            email,
            status,
          };
        });

        setParsedImportKkkRows(parsed);
      } catch (err) {
        console.error('Error parsing excel KKK', err);
        setImportKkkError('Gagal membaca file Excel/CSV. Pastikan format file valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImportKKK = () => {
    if (parsedImportKkkRows.length === 0) return;

    let updated: KKK[] = [];
    if (importKkkMode === 'replace') {
      updated = parsedImportKkkRows as KKK[];
    } else {
      const existingMajor = new Set(kkkList.map((k) => k.majorId));
      const newItems = (parsedImportKkkRows as KKK[]).filter((k) => !existingMajor.has(k.majorId));
      updated = [...kkkList, ...newItems];
    }

    onUpdateKKK?.(updated);
    onToast(`Berhasil mengimpor ${parsedImportKkkRows.length} data Ketua Konsentrasi Keahlian (KKK).`);
    setKkkImportModalOpen(false);
    setParsedImportKkkRows([]);
    setImportKkkFileName('');
  };

  // ========================
  // TIM KESISWAAN CRUD & EXPORT
  // ========================
  const filteredTimKesiswaan = timKesiswaan.filter((t) => {
    if (!kesiswaanSearch.trim()) return true;
    const q = kesiswaanSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.nip.includes(q) ||
      t.position.toLowerCase().includes(q)
    );
  });

  const handleOpenAddKesiswaan = () => {
    setEditingKesiswaan(null);
    setKesiswaanForm({
      nip: '',
      name: '',
      position: 'Staf Kedisiplinan & Piket Gerbang',
      phone: '628',
      email: '',
      status: 'Aktif',
    });
    setKesiswaanModalOpen(true);
  };

  const handleOpenEditKesiswaan = (t: TimKesiswaan) => {
    setEditingKesiswaan(t);
    setKesiswaanForm({
      nip: t.nip,
      name: t.name,
      position: t.position,
      phone: t.phone,
      email: t.email || '',
      status: t.status,
    });
    setKesiswaanModalOpen(true);
  };

  const handleSaveKesiswaan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kesiswaanForm.name || !kesiswaanForm.position) {
      alert('Nama dan Jabatan wajib diisi.');
      return;
    }
    let updated: TimKesiswaan[];
    if (editingKesiswaan) {
      updated = timKesiswaan.map((t) => (t.id === editingKesiswaan.id ? { ...kesiswaanForm, id: editingKesiswaan.id } : t));
      onToast(`Data Tim Kesiswaan ${kesiswaanForm.name} berhasil diperbarui.`);
    } else {
      const newT: TimKesiswaan = { ...kesiswaanForm, id: `kes-${Date.now()}` };
      updated = [...timKesiswaan, newT];
      onToast(`Anggota Tim Kesiswaan ${kesiswaanForm.name} berhasil ditambahkan.`);
    }
    onUpdateTimKesiswaan?.(updated);
    setKesiswaanModalOpen(false);
  };

  const handleDeleteKesiswaan = (t: TimKesiswaan) => {
    if (confirm(`Hapus anggota Tim Kesiswaan ${t.name}?`)) {
      const updated = timKesiswaan.filter((item) => item.id !== t.id);
      onUpdateTimKesiswaan?.(updated);
      onToast(`Data ${t.name} berhasil dihapus.`);
    }
  };

  const handleExportTimKesiswaan = () => {
    const exportRows = filteredTimKesiswaan.map((t, idx) => ({
      No: idx + 1,
      NIP: t.nip,
      Nama_Lengkap: t.name,
      Jabatan_Tugas: t.position,
      No_WhatsApp: t.phone,
      Email: t.email || '-',
      Status: t.status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Tim_Kesiswaan');
    XLSX.writeFile(wb, `Master_Tim_Kesiswaan_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Data Master Tim Kesiswaan berhasil diekspor.');
  };

  // Template & Import for Tim Kesiswaan
  const handleDownloadTemplateKesiswaan = () => {
    const templateData = [
      {
        NIP: '197509182000031003',
        Nama_Lengkap: 'Drs. Moh. Zaini, M.Pd.',
        Jabatan_Tugas: 'Waka Kesiswaan',
        No_WhatsApp: '6281234567001',
        Email: 'zaini.kesiswaan@smkn1jember.sch.id',
        Status: 'Aktif',
      },
      {
        NIP: '198304122009021006',
        Nama_Lengkap: 'Hendra Setiawan, S.Pd.',
        Jabatan_Tugas: 'Koordinator Ketertiban, Disiplin & Piket',
        No_WhatsApp: '6281234567002',
        Email: 'hendra.tatib@smkn1jember.sch.id',
        Status: 'Aktif',
      },
      {
        NIP: '198811052011012015',
        Nama_Lengkap: 'Rina Kartikasari, S.Pd.',
        Jabatan_Tugas: 'Pembina OSIS & Ekstrakurikuler',
        No_WhatsApp: '6281234567003',
        Email: 'rina.osis@smkn1jember.sch.id',
        Status: 'Aktif',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Tim_Kesiswaan');
    XLSX.writeFile(wb, 'Template_Import_Tim_Kesiswaan_PATROL_SMESA.xlsx');
    onToast('Template Excel Tim Kesiswaan berhasil diunduh.');
  };

  const handleFileUploadKesiswaan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportKesiswaanFileName(file.name);
    setImportKesiswaanError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setImportKesiswaanError('File kosong atau format tidak sesuai.');
          return;
        }

        const parsed: Partial<TimKesiswaan>[] = rawJson.map((row, idx) => {
          const nip = String(row['NIP'] || row['nip'] || '').trim();
          const name = String(row['Nama_Lengkap'] || row['Nama'] || row['nama'] || '').trim();
          const position = String(row['Jabatan_Tugas'] || row['Jabatan'] || row['position'] || 'Staf Tim Kesiswaan').trim();

          let phone = String(row['No_WhatsApp'] || row['No WA'] || row['Telepon'] || row['phone'] || '628').trim();
          if (phone.startsWith('0')) phone = '62' + phone.slice(1);
          const email = String(row['Email'] || row['email'] || '').trim();
          const rawStatus = String(row['Status'] || row['status'] || 'Aktif').trim();
          const status = rawStatus.toLowerCase().includes('cuti') ? 'Cuti' : 'Aktif';

          return {
            id: `kes-imp-${Date.now()}-${idx}`,
            nip: nip || `19850000000000${String(1000 + idx)}`,
            name: name || `Anggota Kesiswaan ${idx + 1}`,
            position,
            phone: phone || '628123456789',
            email,
            status,
          };
        });

        setParsedImportKesiswaanRows(parsed);
      } catch (err) {
        console.error('Error parsing excel Tim Kesiswaan', err);
        setImportKesiswaanError('Gagal membaca file Excel/CSV. Pastikan format file valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImportKesiswaan = () => {
    if (parsedImportKesiswaanRows.length === 0) return;

    let updated: TimKesiswaan[] = [];
    if (importKesiswaanMode === 'replace') {
      updated = parsedImportKesiswaanRows as TimKesiswaan[];
    } else {
      const existingNip = new Set(timKesiswaan.map((t) => t.nip));
      const newItems = (parsedImportKesiswaanRows as TimKesiswaan[]).filter((t) => !existingNip.has(t.nip));
      updated = [...timKesiswaan, ...newItems];
    }

    onUpdateTimKesiswaan?.(updated);
    onToast(`Berhasil mengimpor ${parsedImportKesiswaanRows.length} data personel Tim Kesiswaan.`);
    setKesiswaanImportModalOpen(false);
    setParsedImportKesiswaanRows([]);
    setImportKesiswaanFileName('');
  };

  // Restore file picker handler
  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onRestoreData?.(file);
    if (backupInputRef.current) backupInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Database Management Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            <span>Basis Data Terpadu SMKN 1 Jember</span>
            <span>•</span>
            <span className="text-slate-500 dark:text-slate-400">Akses Kesiswaan &amp; Admin</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Master Data &amp; Tata Kelola Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Kelola Master Data Siswa, Guru BK, Ketua Konsentrasi Keahlian (KKK), dan Tim Kesiswaan terpusat.
          </p>
        </div>

        {/* Global Database Operations Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Backup Button */}
          <button
            onClick={onBackupData}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Unduh backup data lengkap (JSON)"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Backup Data</span>
          </button>

          {/* Restore Button */}
          <input
            ref={backupInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreFileSelected}
            className="hidden"
          />
          <button
            onClick={() => backupInputRef.current?.click()}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Pulihkan data dari file backup JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Pulihkan Data</span>
          </button>

          {/* Reset Violations Only Button */}
          <button
            onClick={() => setConfirmResetViolationsOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-950/70 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Reset riwayat keterlambatan saja, master siswa dan guru tetap aman"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Reset Pelanggaran</span>
          </button>

          {/* Wipe All Data Button */}
          <button
            onClick={() => {
              setWipeConfirmInput('');
              setConfirmWipeOpen(true);
            }}
            className="px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-950/70 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Hapus semua data sistem"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Hapus Semua Data</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('siswa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'siswa'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Master Siswa ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('guru_bk')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'guru_bk'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Master Guru BK ({guruBK.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('kkk')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'kkk'
              ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Master KKK ({kkkList.length} Jurusan)</span>
        </button>

        <button
          onClick={() => setActiveTab('tim_kesiswaan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'tim_kesiswaan'
              ? 'border-blue-600 text-blue-700 dark:text-blue-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Master Tim Kesiswaan ({timKesiswaan.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MASTER DATA SISWA                                 */}
      {/* ======================================================== */}
      {activeTab === 'siswa' && (
        <div className="space-y-4">
          {/* Action Toolbar for Siswa */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama, NIS, Kelas, Orang Tua..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
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
                className="py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Kelas ({uniqueClasses.length})</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>

              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Unduh Format Contoh Excel"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Format Excel</span>
              </button>

              <button
                onClick={() => setImportModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={handleExportStudents}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Ekspor</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Siswa Baru</span>
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Daftar Siswa Terdaftar ({filteredStudents.length} siswa)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Menampilkan data aktif
              </span>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                Tidak ada data siswa yang cocok dengan kriteria pencarian atau filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-750">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">NIS / NISN</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">L/P</th>
                      <th className="py-2.5 px-3">Kelas &amp; Jurusan</th>
                      <th className="py-2.5 px-3">Orang Tua / Wali</th>
                      <th className="py-2.5 px-3">No WhatsApp Ortu</th>
                      <th className="py-2.5 px-3">Wali Kelas</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredStudents.map((std, idx) => (
                      <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-slate-400 dark:text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono">
                          <div className="font-semibold text-slate-900 dark:text-white">{std.nis}</div>
                          <div className="text-[10px] text-slate-400">{std.nisn || '-'}</div>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {std.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              std.gender === 'L'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : 'bg-pink-50 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300'
                            }`}
                          >
                            {std.gender}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{std.className}</span>
                          <span className="text-[10px] text-slate-400 ml-1">({std.majorId})</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {std.parentName}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <a
                            href={`https://wa.me/${std.parentPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{std.parentPhone}</span>
                          </a>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {std.waliKelas}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(std)}
                              className="p-1.5 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
                              title="Edit Data Siswa"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(std)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MASTER GURU BK                                    */}
      {/* ======================================================== */}
      {activeTab === 'guru_bk' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={bkSearch}
                onChange={(e) => setBkSearch(e.target.value)}
                placeholder="Cari Guru BK, NIP, Tingkat..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadTemplateBK}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Unduh Format Contoh Excel Master Guru BK"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Format Excel</span>
              </button>

              <button
                onClick={() => setBkImportModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Import data Guru BK dari file Excel"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={handleExportGuruBK}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Ekspor Excel</span>
              </button>
              <button
                onClick={handleOpenAddBk}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Guru BK</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Daftar Konselor &amp; Guru Bimbingan Konseling ({filteredGuruBK.length} Personel)
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                Unit BK SMKN 1 Jember
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-750">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NIP</th>
                    <th className="py-2.5 px-3">Nama Lengkap &amp; Gelar</th>
                    <th className="py-2.5 px-3">Penugasan / Koordinator</th>
                    <th className="py-2.5 px-3">Bidang Spesialisasi</th>
                    <th className="py-2.5 px-3">Kontak WhatsApp</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredGuruBK.map((bk, idx) => (
                    <tr key={bk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-white font-medium">{bk.nip}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {bk.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
                          {bk.roleTitle}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{bk.specialization || '-'}</td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <a
                          href={`https://wa.me/${bk.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{bk.phone}</span>
                        </a>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold text-[10px]">
                          {bk.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditBk(bk)}
                            className="p-1.5 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
                            title="Edit Guru BK"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBk(bk)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                            title="Hapus Guru BK"
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
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MASTER KKK (KETUA KONSENTRASI KEAHLIAN)           */}
      {/* ======================================================== */}
      {activeTab === 'kkk' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={kkkSearch}
                onChange={(e) => setKkkSearch(e.target.value)}
                placeholder="Cari KKK, Program Keahlian, NIP..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadTemplateKKK}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Unduh Format Contoh Excel Master KKK"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Format Excel</span>
              </button>

              <button
                onClick={() => setKkkImportModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Import data Ketua Konsentrasi Keahlian dari file Excel"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={handleExportKKK}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Ekspor Excel</span>
              </button>
              <button
                onClick={handleOpenAddKkk}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah KKK</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Daftar Ketua Konsentrasi Keahlian / Kaprodi ({filteredKKK.length} Jurusan Kejuruan)
              </span>
              <span className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">
                Kepala Program Keahlian
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-750">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Jurusan</th>
                    <th className="py-2.5 px-3">Nama KKK &amp; Gelar</th>
                    <th className="py-2.5 px-3">NIP</th>
                    <th className="py-2.5 px-3">Ruang / Bengkel / Studio</th>
                    <th className="py-2.5 px-3">Kontak WhatsApp</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredKKK.map((kkk, idx) => (
                    <tr key={kkk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-[10px] mr-1.5">
                          {kkk.majorId}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {kkk.majorName}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {kkk.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400">{kkk.nip}</td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">{kkk.officeRoom || '-'}</td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <a
                          href={`https://wa.me/${kkk.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{kkk.phone}</span>
                        </a>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold text-[10px]">
                          {kkk.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditKkk(kkk)}
                            className="p-1.5 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
                            title="Edit Data KKK"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteKkk(kkk)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                            title="Hapus Data KKK"
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
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: MASTER TIM KESISWAAN                              */}
      {/* ======================================================== */}
      {activeTab === 'tim_kesiswaan' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={kesiswaanSearch}
                onChange={(e) => setKesiswaanSearch(e.target.value)}
                placeholder="Cari Nama, NIP, Jabatan..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadTemplateKesiswaan}
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Unduh Format Contoh Excel Master Tim Kesiswaan"
              >
                <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Format Excel</span>
              </button>

              <button
                onClick={() => setKesiswaanImportModalOpen(true)}
                className="px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                title="Import data personel Tim Kesiswaan dari file Excel"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Excel</span>
              </button>

              <button
                onClick={handleExportTimKesiswaan}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Ekspor Excel</span>
              </button>
              <button
                onClick={handleOpenAddKesiswaan}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Tim Kesiswaan</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Personel Tim Kesiswaan, Pembina OSIS &amp; Tatib ({filteredTimKesiswaan.length} Personel)
              </span>
              <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">
                Bidang Pembinaan &amp; Disiplin
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-750">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">NIP</th>
                    <th className="py-2.5 px-3">Nama Lengkap &amp; Gelar</th>
                    <th className="py-2.5 px-3">Jabatan / Penugasan</th>
                    <th className="py-2.5 px-3">Kontak WhatsApp</th>
                    <th className="py-2.5 px-3">Email Resmi</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredTimKesiswaan.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-slate-400 dark:text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-900 dark:text-white font-medium">{item.nip}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {item.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 text-[11px]">
                          {item.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                        <a
                          href={`https://wa.me/${item.phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{item.phone}</span>
                        </a>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {item.email || '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-bold text-[10px]">
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditKesiswaan(item)}
                            className="p-1.5 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors"
                            title="Edit Tim Kesiswaan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteKesiswaan(item)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                            title="Hapus Tim Kesiswaan"
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
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: IMPORT SISWA DARI EXCEL                         */}
      {/* ======================================================== */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-800 dark:text-slate-200">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Format File Excel (.xlsx / .csv):</div>
                  <p className="text-[11px] leading-relaxed">
                    Kolom: <strong>NIS</strong>, <strong>NISN</strong>, <strong>Nama</strong>, <strong>Kelas</strong>, <strong>Jurusan</strong> (RPL/AKL/MPLB/BD/DKV/KL/HTL), <strong>Nama_Orang_Tua</strong>, <strong>No_WA_Orang_Tua</strong>, dan <strong>Wali_Kelas</strong>.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="text-blue-700 dark:text-blue-400 underline font-semibold text-[11px]"
                  >
                    Klik di sini untuk mengunduh template contoh.
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedImportRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Preview Data ({parsedImportRows.length} baris terbaca):
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                        />
                        <span>Tambahkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                        />
                        <span className="text-red-600 font-semibold">Ganti Seluruh Data</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">NIS</th>
                          <th className="py-1.5 px-2">Nama</th>
                          <th className="py-1.5 px-2">Kelas</th>
                          <th className="py-1.5 px-2">Jurusan</th>
                          <th className="py-1.5 px-2">No WA Ortu</th>
                          <th className="py-1.5 px-2">Wali Kelas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedImportRows.slice(0, 8).map((r, i) => (
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
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs"
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

      {/* ======================================================== */}
      {/* MODAL 2: TAMBAH / EDIT SISWA                             */}
      {/* ======================================================== */}
      {studentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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

            <form onSubmit={handleSaveStudent} className="p-5 space-y-3.5 text-xs text-slate-800 dark:text-slate-200 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">NIS (Nomor Induk)</label>
                  <input
                    type="text"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    placeholder="Contoh: 23241001"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">NISN</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    placeholder="Contoh: 0065412891"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="Nama sesuai raport / KK"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jurusan</label>
                  <select
                    value={formData.majorId}
                    onChange={(e) => setFormData({ ...formData, majorId: e.target.value as MajorId })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    {MAJORS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tingkat</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Rombel / Kelas Lengkap</label>
                  <input
                    type="text"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    placeholder="Contoh: X RPL 1"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Wali Kelas</label>
                  <input
                    type="text"
                    value={formData.waliKelas}
                    onChange={(e) => setFormData({ ...formData, waliKelas: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    placeholder="Nama Wali Kelas & Gelar"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    placeholder="Nama Ayah / Ibu"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">No. WhatsApp Ortu</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    placeholder="628123456789"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStudentModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambahkan Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: TAMBAH / EDIT GURU BK                           */}
      {/* ======================================================== */}
      {bkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingBk ? 'Edit Guru Bimbingan Konseling' : 'Tambah Guru BK Baru'}
              </h3>
              <button onClick={() => setBkModalOpen(false)} className="text-emerald-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBk} className="p-5 space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div>
                <label className="block font-semibold mb-1">NIP Pegawai</label>
                <input
                  type="text"
                  value={bkForm.nip}
                  onChange={(e) => setBkForm({ ...bkForm, nip: e.target.value })}
                  placeholder="19700315 199512 2 001"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  value={bkForm.name}
                  onChange={(e) => setBkForm({ ...bkForm, name: e.target.value })}
                  placeholder="Dra. Hj. Nur Hasanah, M.Kons."
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Penugasan / Koordinator</label>
                <input
                  type="text"
                  value={bkForm.roleTitle}
                  onChange={(e) => setBkForm({ ...bkForm, roleTitle: e.target.value })}
                  placeholder="Contoh: Guru BK Tingkat X / Koordinator BK"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Spesialisasi / Fokus Bimbingan</label>
                <input
                  type="text"
                  value={bkForm.specialization}
                  onChange={(e) => setBkForm({ ...bkForm, specialization: e.target.value })}
                  placeholder="Konseling Karir, Disiplin Karakter, Remaja..."
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={bkForm.phone}
                    onChange={(e) => setBkForm({ ...bkForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Keaktifan</label>
                  <select
                    value={bkForm.status}
                    onChange={(e) => setBkForm({ ...bkForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Cuti">Cuti</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Sekolah (Opsional)</label>
                <input
                  type="email"
                  value={bkForm.email}
                  onChange={(e) => setBkForm({ ...bkForm, email: e.target.value })}
                  placeholder="nama.bk@smkn1jember.sch.id"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBkModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan Data BK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: TAMBAH / EDIT KKK                               */}
      {/* ======================================================== */}
      {kkkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingKkk ? 'Edit Ketua Konsentrasi Keahlian (KKK)' : 'Tambah KKK Baru'}
              </h3>
              <button onClick={() => setKkkModalOpen(false)} className="text-purple-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKkk} className="p-5 space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div>
                <label className="block font-semibold mb-1">Jurusan / Program Keahlian</label>
                <select
                  value={kkkForm.majorId}
                  onChange={(e) => setKkkForm({ ...kkkForm, majorId: e.target.value as MajorId })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-semibold"
                >
                  {MAJORS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  value={kkkForm.name}
                  onChange={(e) => setKkkForm({ ...kkkForm, name: e.target.value })}
                  placeholder="Ir. Budi Santoso, S.Kom., M.T."
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">NIP Pegawai</label>
                <input
                  type="text"
                  value={kkkForm.nip}
                  onChange={(e) => setKkkForm({ ...kkkForm, nip: e.target.value })}
                  placeholder="19740510 200212 1 004"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Ruang Kantor / Studio / Bengkel</label>
                <input
                  type="text"
                  value={kkkForm.officeRoom}
                  onChange={(e) => setKkkForm({ ...kkkForm, officeRoom: e.target.value })}
                  placeholder="Ruang KKK RPL & Lab RPL Lt. 2"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={kkkForm.phone}
                    onChange={(e) => setKkkForm({ ...kkkForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Keaktifan</label>
                  <select
                    value={kkkForm.status}
                    onChange={(e) => setKkkForm({ ...kkkForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setKkkModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan Data KKK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: TAMBAH / EDIT TIM KESISWAAN                     */}
      {/* ======================================================== */}
      {kesiswaanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-800 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingKesiswaan ? 'Edit Personel Tim Kesiswaan' : 'Tambah Anggota Tim Kesiswaan'}
              </h3>
              <button onClick={() => setKesiswaanModalOpen(false)} className="text-blue-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKesiswaan} className="p-5 space-y-3 text-xs text-slate-800 dark:text-slate-200">
              <div>
                <label className="block font-semibold mb-1">NIP Pegawai</label>
                <input
                  type="text"
                  value={kesiswaanForm.nip}
                  onChange={(e) => setKesiswaanForm({ ...kesiswaanForm, nip: e.target.value })}
                  placeholder="19780410 200604 1 012"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  value={kesiswaanForm.name}
                  onChange={(e) => setKesiswaanForm({ ...kesiswaanForm, name: e.target.value })}
                  placeholder="Hendra Kusuma, S.Pd."
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Jabatan / Penugasan Khusus</label>
                <input
                  type="text"
                  value={kesiswaanForm.position}
                  onChange={(e) => setKesiswaanForm({ ...kesiswaanForm, position: e.target.value })}
                  placeholder="Koordinator Ketertiban, Disiplin & Piket Gerbang"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    value={kesiswaanForm.phone}
                    onChange={(e) => setKesiswaanForm({ ...kesiswaanForm, phone: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Status Keaktifan</label>
                  <select
                    value={kesiswaanForm.status}
                    onChange={(e) => setKesiswaanForm({ ...kesiswaanForm, status: e.target.value as any })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Resmi (Opsional)</label>
                <input
                  type="email"
                  value={kesiswaanForm.email}
                  onChange={(e) => setKesiswaanForm({ ...kesiswaanForm, email: e.target.value })}
                  placeholder="hendra.kesiswaan@smkn1jember.sch.id"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setKesiswaanModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Simpan Tim Kesiswaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG KONFIRMASI: RESET DATA PELANGGARAN                */}
      {/* ======================================================== */}
      {confirmResetViolationsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-600 text-white px-5 py-4 flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Konfirmasi Reset Data Pelanggaran Siswa</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Tindakan ini akan <strong>mengosongkan seluruh riwayat keterlambatan siswa</strong> dan catatan pembinaan di semester ini.
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300 text-[11px]">
                ✓ <strong>Master Data Siswa, Guru BK, KKK, dan Pengaturan Tetap Utuh &amp; Aman</strong>. Hanya riwayat operasional keterlambatan yang dibersihkan.
              </div>
              <p className="text-[11px] text-slate-500">
                Disarankan mengunduh cadangan (Backup Data) terlebih dahulu jika riwayat lama masih diperlukan untuk arsip akhir semester.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmResetViolationsOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setConfirmResetViolationsOpen(false);
                  onResetViolations?.();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Ya, Reset Riwayat Pelanggaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DIALOG KONFIRMASI: HAPUS SEMUA DATA                     */}
      {/* ======================================================== */}
      {confirmWipeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-red-300 dark:border-red-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-700 text-white px-5 py-4 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Peringatan Kritis: Hapus Seluruh Data</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed text-red-900 dark:text-red-300 font-semibold">
                Tindakan ini akan mengosongkan seluruh data operasional (keterlambatan, konseling, dan daftar siswa) untuk memulai dari awal bersih!
              </p>
              <p className="text-[11px] text-slate-500">
                Ketik kata <strong>HAPUS</strong> di bawah ini untuk mengonfirmasi bahwa Anda memahami konsekuensi ini:
              </p>
              <input
                type="text"
                value={wipeConfirmInput}
                onChange={(e) => setWipeConfirmInput(e.target.value)}
                placeholder="Ketik 'HAPUS'"
                className="w-full p-2 border border-red-300 dark:border-red-700 rounded-lg font-mono text-center bg-white dark:bg-slate-800 uppercase tracking-widest text-sm"
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmWipeOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                disabled={wipeConfirmInput.trim().toUpperCase() !== 'HAPUS'}
                onClick={() => {
                  setConfirmWipeOpen(false);
                  onWipeAllData?.();
                }}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-40 text-white font-semibold rounded-lg shadow-xs"
              >
                Hapus Semua Data Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPORT GURU BK DARI EXCEL                        */}
      {/* ======================================================== */}
      {bkImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-sm">Import Master Guru BK dari Excel / CSV</h3>
              </div>
              <button
                onClick={() => {
                  setBkImportModalOpen(false);
                  setParsedImportBkRows([]);
                  setImportBkFileName('');
                  setImportBkError(null);
                }}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-800 dark:text-slate-200">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Format File Excel Guru BK (.xlsx / .csv):</div>
                  <p className="text-[11px] leading-relaxed">
                    Kolom yang didukung: <strong>NIP</strong>, <strong>Nama_Lengkap</strong>, <strong>Penugasan</strong> (contoh: Koordinator Guru BK, Guru BK Tingkat X), <strong>Spesialisasi</strong>, <strong>No_WhatsApp</strong>, <strong>Email</strong>, dan <strong>Status</strong> (Aktif/Cuti).
                  </p>
                  <button
                    onClick={handleDownloadTemplateBK}
                    className="text-emerald-700 dark:text-emerald-400 underline font-semibold text-[11px]"
                  >
                    Klik di sini untuk mengunduh template contoh Excel Guru BK.
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih file Excel Guru BK (.xlsx, .xls) atau CSV dari komputer
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {importBkFileName ? `File terpilih: ${importBkFileName}` : 'Klik tombol di bawah untuk memilih file'}
                </p>
                <input
                  ref={bkFileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadBK}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bkFileInputRef.current?.click()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Pilih File Excel Guru BK
                </button>
              </div>

              {importBkError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importBkError}</span>
                </div>
              )}

              {parsedImportBkRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Preview Data ({parsedImportBkRows.length} Guru BK terbaca):
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importBkMode"
                          checked={importBkMode === 'append'}
                          onChange={() => setImportBkMode('append')}
                        />
                        <span>Tambahkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importBkMode"
                          checked={importBkMode === 'replace'}
                          onChange={() => setImportBkMode('replace')}
                        />
                        <span className="text-red-600 font-semibold">Ganti Seluruh Data BK</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">NIP</th>
                          <th className="py-1.5 px-2">Nama Lengkap</th>
                          <th className="py-1.5 px-2">Penugasan</th>
                          <th className="py-1.5 px-2">Spesialisasi</th>
                          <th className="py-1.5 px-2">No WA</th>
                          <th className="py-1.5 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedImportBkRows.slice(0, 8).map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 px-2 font-mono">{r.nip}</td>
                            <td className="py-1 px-2 font-medium">{r.name}</td>
                            <td className="py-1 px-2">{r.roleTitle}</td>
                            <td className="py-1 px-2">{r.specialization || '-'}</td>
                            <td className="py-1 px-2 font-mono">{r.phone}</td>
                            <td className="py-1 px-2">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setBkImportModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedImportBkRows.length === 0}
                onClick={handleCommitImportBK}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simpan {parsedImportBkRows.length} Guru BK ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPORT KKK DARI EXCEL                             */}
      {/* ======================================================== */}
      {kkkImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-sm">Import Master KKK dari Excel / CSV</h3>
              </div>
              <button
                onClick={() => {
                  setKkkImportModalOpen(false);
                  setParsedImportKkkRows([]);
                  setImportKkkFileName('');
                  setImportKkkError(null);
                }}
                className="text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-800 dark:text-slate-200">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-purple-900 dark:text-purple-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Format File Excel KKK (.xlsx / .csv):</div>
                  <p className="text-[11px] leading-relaxed">
                    Kolom yang didukung: <strong>NIP</strong>, <strong>Nama_Lengkap</strong>, <strong>Kode_Jurusan</strong> (RPL/AKL/MPLB/BD/DKV/KL/HTL), <strong>Konsentrasi_Keahlian</strong>, <strong>Ruang_Kantor_Lab</strong>, <strong>No_WhatsApp</strong>, <strong>Email</strong>, dan <strong>Status</strong>.
                  </p>
                  <button
                    onClick={handleDownloadTemplateKKK}
                    className="text-purple-700 dark:text-purple-400 underline font-semibold text-[11px]"
                  >
                    Klik di sini untuk mengunduh template contoh Excel KKK.
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-purple-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih file Excel KKK (.xlsx, .xls) atau CSV dari komputer
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {importKkkFileName ? `File terpilih: ${importKkkFileName}` : 'Klik tombol di bawah untuk memilih file'}
                </p>
                <input
                  ref={kkkFileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadKKK}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => kkkFileInputRef.current?.click()}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Pilih File Excel KKK
                </button>
              </div>

              {importKkkError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importKkkError}</span>
                </div>
              )}

              {parsedImportKkkRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Preview Data ({parsedImportKkkRows.length} KKK terbaca):
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importKkkMode"
                          checked={importKkkMode === 'append'}
                          onChange={() => setImportKkkMode('append')}
                        />
                        <span>Tambahkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importKkkMode"
                          checked={importKkkMode === 'replace'}
                          onChange={() => setImportKkkMode('replace')}
                        />
                        <span className="text-red-600 font-semibold">Ganti Seluruh Data KKK</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">Kode</th>
                          <th className="py-1.5 px-2">Konsentrasi Keahlian</th>
                          <th className="py-1.5 px-2">Nama KKK</th>
                          <th className="py-1.5 px-2">NIP</th>
                          <th className="py-1.5 px-2">Ruang / Lab</th>
                          <th className="py-1.5 px-2">No WA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedImportKkkRows.slice(0, 8).map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 px-2 font-mono font-bold text-purple-700 dark:text-purple-400">{r.majorId}</td>
                            <td className="py-1 px-2">{r.majorName}</td>
                            <td className="py-1 px-2 font-medium">{r.name}</td>
                            <td className="py-1 px-2 font-mono">{r.nip}</td>
                            <td className="py-1 px-2">{r.officeRoom || '-'}</td>
                            <td className="py-1 px-2 font-mono">{r.phone}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setKkkImportModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedImportKkkRows.length === 0}
                onClick={handleCommitImportKKK}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simpan {parsedImportKkkRows.length} KKK ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPORT TIM KESISWAAN DARI EXCEL                   */}
      {/* ======================================================== */}
      {kesiswaanImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-blue-800 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
                <h3 className="font-bold text-sm">Import Master Tim Kesiswaan dari Excel / CSV</h3>
              </div>
              <button
                onClick={() => {
                  setKesiswaanImportModalOpen(false);
                  setParsedImportKesiswaanRows([]);
                  setImportKesiswaanFileName('');
                  setImportKesiswaanError(null);
                }}
                className="text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-800 dark:text-slate-200">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-semibold">Format File Excel Tim Kesiswaan (.xlsx / .csv):</div>
                  <p className="text-[11px] leading-relaxed">
                    Kolom yang didukung: <strong>NIP</strong>, <strong>Nama_Lengkap</strong>, <strong>Jabatan_Tugas</strong> (contoh: Waka Kesiswaan, Koordinator Ketertiban, Disiplin &amp; Piket, Pembina OSIS), <strong>No_WhatsApp</strong>, <strong>Email</strong>, dan <strong>Status</strong>.
                  </p>
                  <button
                    onClick={handleDownloadTemplateKesiswaan}
                    className="text-blue-700 dark:text-blue-400 underline font-semibold text-[11px]"
                  >
                    Klik di sini untuk mengunduh template contoh Excel Tim Kesiswaan.
                  </button>
                </div>
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih file Excel Tim Kesiswaan (.xlsx, .xls) atau CSV dari komputer
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  {importKesiswaanFileName ? `File terpilih: ${importKesiswaanFileName}` : 'Klik tombol di bawah untuk memilih file'}
                </p>
                <input
                  ref={kesiswaanFileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadKesiswaan}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => kesiswaanFileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Pilih File Excel Tim Kesiswaan
                </button>
              </div>

              {importKesiswaanError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importKesiswaanError}</span>
                </div>
              )}

              {parsedImportKesiswaanRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Preview Data ({parsedImportKesiswaanRows.length} Tim Kesiswaan terbaca):
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importKesiswaanMode"
                          checked={importKesiswaanMode === 'append'}
                          onChange={() => setImportKesiswaanMode('append')}
                        />
                        <span>Tambahkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importKesiswaanMode"
                          checked={importKesiswaanMode === 'replace'}
                          onChange={() => setImportKesiswaanMode('replace')}
                        />
                        <span className="text-red-600 font-semibold">Ganti Seluruh Data Tim</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">NIP</th>
                          <th className="py-1.5 px-2">Nama Lengkap</th>
                          <th className="py-1.5 px-2">Jabatan / Penugasan</th>
                          <th className="py-1.5 px-2">No WA</th>
                          <th className="py-1.5 px-2">Email</th>
                          <th className="py-1.5 px-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedImportKesiswaanRows.slice(0, 8).map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 px-2 font-mono">{r.nip}</td>
                            <td className="py-1 px-2 font-medium">{r.name}</td>
                            <td className="py-1 px-2">{r.position}</td>
                            <td className="py-1 px-2 font-mono">{r.phone}</td>
                            <td className="py-1 px-2 font-mono">{r.email || '-'}</td>
                            <td className="py-1 px-2">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setKesiswaanImportModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedImportKesiswaanRows.length === 0}
                onClick={handleCommitImportKesiswaan}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simpan {parsedImportKesiswaanRows.length} Tim Kesiswaan ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
