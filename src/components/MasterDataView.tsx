import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Student, MajorId, GuruBK, KKK, TimKesiswaan, SchoolClass, Major, GradeLevel, UserAccount, AppRole } from '../types/patrol';
import { MAJORS, INITIAL_CLASSES, INITIAL_ACCOUNTS } from '../data/initialData';
import { getStoredAccounts } from '../utils/storage';
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
  UserCheck,
  Layers,
  School,
  Tag,
  BookOpen,
  Palette,
  Check,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  UserCog,
  Copy,
  Sparkles
} from 'lucide-react';

interface MasterDataViewProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  majors?: Major[];
  onUpdateMajors?: (majors: Major[]) => void;
  classes?: SchoolClass[];
  onUpdateClasses?: (classes: SchoolClass[]) => void;
  guruBK?: GuruBK[];
  onUpdateGuruBK?: (list: GuruBK[]) => void;
  kkkList?: KKK[];
  onUpdateKKK?: (list: KKK[]) => void;
  timKesiswaan?: TimKesiswaan[];
  onUpdateTimKesiswaan?: (list: TimKesiswaan[]) => void;
  accounts?: UserAccount[];
  onUpdateAccounts?: (list: UserAccount[]) => void;
  onResetViolations?: () => void;
  onWipeAllData?: () => void;
  onResetSampleData?: () => void;
  onBackupData?: () => void;
  onRestoreData?: (file: File) => void;
  onToast: (msg: string) => void;
}

export type MasterTab = 'siswa' | 'kelas_jurusan' | 'guru_bk' | 'kkk' | 'tim_kesiswaan' | 'akun';

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  students,
  onUpdateStudents,
  majors = [],
  onUpdateMajors,
  classes = [],
  onUpdateClasses,
  guruBK = [],
  onUpdateGuruBK,
  kkkList = [],
  onUpdateKKK,
  timKesiswaan = [],
  onUpdateTimKesiswaan,
  accounts = [],
  onUpdateAccounts,
  onResetViolations,
  onWipeAllData,
  onResetSampleData,
  onBackupData,
  onRestoreData,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<MasterTab>('siswa');

  const currentMajors = majors;
  const currentClasses = classes;
  const currentAccounts = accounts;

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
  const [confirmResetSampleOpen, setConfirmResetSampleOpen] = useState(false);
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

  // Subtab for Master Kelas & Jurusan
  const [kjSubTab, setKjSubTab] = useState<'kelas' | 'jurusan'>('kelas');

  // Search & Filters for Kelas
  const [classSearch, setClassSearch] = useState('');
  const [classGradeFilter, setClassGradeFilter] = useState<string>('ALL');
  const [classMajorFilter, setClassMajorFilter] = useState<string>('ALL');

  // Search for Jurusan
  const [majorSearch, setMajorSearch] = useState('');

  // Modals state for Kelas
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [classForm, setClassForm] = useState<Omit<SchoolClass, 'id'>>({
    name: 'X RPL 1',
    grade: 'X',
    majorId: 'RPL',
    waliKelas: '',
    room: '',
  });

  // Modals state for Jurusan
  const [majorModalOpen, setMajorModalOpen] = useState(false);
  const [editingMajor, setEditingMajor] = useState<Major | null>(null);
  const [majorForm, setMajorForm] = useState<Major>({
    id: '',
    code: '',
    name: '',
    kaprodi: '',
    color: '#2563EB',
    description: '',
  });

  // Import preview state for Kelas
  const [classImportModalOpen, setClassImportModalOpen] = useState(false);
  const [parsedImportClassRows, setParsedImportClassRows] = useState<Partial<SchoolClass>[]>([]);
  const [importClassMode, setImportClassMode] = useState<'append' | 'replace'>('append');
  const [classImportFileName, setClassImportFileName] = useState<string>('');
  const [classImportError, setClassImportError] = useState<string | null>(null);

  // Import preview state for Jurusan
  const [majorImportModalOpen, setMajorImportModalOpen] = useState(false);
  const [parsedImportMajorRows, setParsedImportMajorRows] = useState<Partial<Major>[]>([]);
  const [importMajorMode, setImportMajorMode] = useState<'append' | 'replace'>('append');
  const [majorImportFileName, setMajorImportFileName] = useState<string>('');
  const [majorImportError, setMajorImportError] = useState<string | null>(null);

  // Search & Filters for Accounts
  const [accountSearch, setAccountSearch] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState<'ALL' | AppRole>('ALL');
  const [accountStatusFilter, setAccountStatusFilter] = useState<'ALL' | 'Aktif' | 'Nonaktif'>('ALL');

  // Modals state for Accounts
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [accountForm, setAccountForm] = useState<Omit<UserAccount, 'id' | 'createdAt'>>({
    username: '',
    password: '',
    name: '',
    nip: '',
    role: 'kesiswaan',
    roleTitle: 'Tim Kesiswaan / Staf Kedisiplinan',
    email: '',
    phone: '628',
    majorId: undefined,
    className: undefined,
    status: 'Aktif',
    notes: '',
  });

  // Modal Reset/Ganti Password
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [accountForPasswordReset, setAccountForPasswordReset] = useState<UserAccount | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Toggle see passwords in table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [showAccountFormPassword, setShowAccountFormPassword] = useState(false);

  // Student Form - Custom Class Name toggle
  const [useCustomClassName, setUseCustomClassName] = useState(false);

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
  const classFileInputRef = useRef<HTMLInputElement>(null);
  const majorFileInputRef = useRef<HTMLInputElement>(null);
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

  const uniqueClasses = currentClasses.length > 0
    ? Array.from(new Set(currentClasses.map((c) => c.name))).sort()
    : Array.from(new Set(students.map((s) => s.className))).sort();

  const availableClassesForFilter = currentClasses.length > 0
    ? (selectedMajor === 'ALL'
        ? uniqueClasses
        : Array.from(new Set(currentClasses.filter(c => c.majorId === selectedMajor).map(c => c.name))).sort())
    : uniqueClasses;

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
          
          // Match with Master Kelas automatically
          const matchedClass = currentClasses.find((c) => c.name.toLowerCase() === className.toLowerCase());

          let majorId: MajorId = matchedClass ? matchedClass.majorId : 'RPL';
          const rawMajor = String(row['Jurusan'] || row['major'] || '').toUpperCase();
          if (rawMajor) {
            const foundMaj = currentMajors.find((m) => m.id.toUpperCase() === rawMajor || m.code.toUpperCase() === rawMajor);
            if (foundMaj) majorId = foundMaj.id;
            else if (['RPL', 'PPLG'].some((k) => rawMajor.includes(k))) majorId = 'RPL';
            else if (['AKL', 'AKUNTANSI'].some((k) => rawMajor.includes(k))) majorId = 'AKL';
            else if (['MPLB', 'OTKP', 'PERKANTORAN'].some((k) => rawMajor.includes(k))) majorId = 'MPLB';
            else if (['BD', 'BDP', 'PEMASARAN', 'BISNIS'].some((k) => rawMajor.includes(k))) majorId = 'BD';
            else if (['DKV', 'DESAIN'].some((k) => rawMajor.includes(k))) majorId = 'DKV';
            else if (['KL', 'KULINER', 'BOGA'].some((k) => rawMajor.includes(k))) majorId = 'KL';
            else if (['HTL', 'HOTEL', 'PERHOTELAN'].some((k) => rawMajor.includes(k))) majorId = 'HTL';
          }

          const parentName = String(row['Nama_Orang_Tua'] || row['Orang Tua'] || row['Wali'] || '-').trim();
          let parentPhone = String(row['No_WA_Orang_Tua'] || row['No WA'] || row['No HP'] || row['Telepon'] || '628').trim();
          if (parentPhone.startsWith('0')) parentPhone = '62' + parentPhone.slice(1);

          let waliKelas = String(row['Wali_Kelas'] || row['Wali Kelas'] || '').trim();
          if (!waliKelas && matchedClass) {
            waliKelas = matchedClass.waliKelas;
          }
          if (!waliKelas) waliKelas = 'Wali Kelas';

          const grade: GradeLevel = matchedClass
            ? matchedClass.grade
            : className.toUpperCase().startsWith('XII')
            ? 'XII'
            : className.toUpperCase().startsWith('XI')
            ? 'XI'
            : 'X';

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
    setUseCustomClassName(false);
    const firstCls = currentClasses[0];
    setFormData({
      nis: '',
      nisn: '',
      name: '',
      gender: 'L',
      majorId: firstCls ? firstCls.majorId : 'RPL',
      grade: firstCls ? firstCls.grade : 'X',
      className: firstCls ? firstCls.name : 'X RPL 1',
      parentName: '',
      parentPhone: '628',
      waliKelas: firstCls ? firstCls.waliKelas : '',
    });
    setStudentModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    const isMasterClass = currentClasses.some((c) => c.name === student.className);
    setUseCustomClassName(!isMasterClass);
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

  const handleSelectClassInStudentForm = (targetClassName: string) => {
    const matched = currentClasses.find((c) => c.name === targetClassName);
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        className: matched.name,
        majorId: matched.majorId,
        grade: matched.grade,
        waliKelas: matched.waliKelas || prev.waliKelas,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        className: targetClassName,
      }));
    }
  };

  const handleSelectMajorInStudentForm = (newMajorId: MajorId) => {
    const matchingClasses = currentClasses.filter((c) => c.majorId === newMajorId);
    const sameGradeClass = matchingClasses.find((c) => c.grade === formData.grade) || matchingClasses[0];
    if (sameGradeClass && !useCustomClassName) {
      setFormData((prev) => ({
        ...prev,
        majorId: newMajorId,
        className: sameGradeClass.name,
        grade: sameGradeClass.grade,
        waliKelas: sameGradeClass.waliKelas || prev.waliKelas,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        majorId: newMajorId,
      }));
    }
  };

  // ========================
  // KELAS CRUD & EXCEL
  // ========================
  const filteredClasses = currentClasses.filter((c) => {
    if (classSearch.trim()) {
      const q = classSearch.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.waliKelas.toLowerCase().includes(q) ||
        (c.room && c.room.toLowerCase().includes(q)) ||
        c.majorId.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (classGradeFilter !== 'ALL' && c.grade !== classGradeFilter) return false;
    if (classMajorFilter !== 'ALL' && c.majorId !== classMajorFilter) return false;
    return true;
  });

  const handleOpenAddClassModal = () => {
    setEditingClass(null);
    const firstMaj = currentMajors[0];
    setClassForm({
      name: '',
      grade: 'X',
      majorId: firstMaj ? firstMaj.id : 'RPL',
      waliKelas: '',
      room: '',
    });
    setClassModalOpen(true);
  };

  const handleOpenEditClassModal = (cls: SchoolClass) => {
    setEditingClass(cls);
    setClassForm({
      name: cls.name,
      grade: cls.grade,
      majorId: cls.majorId,
      waliKelas: cls.waliKelas,
      room: cls.room || '',
    });
    setClassModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.name.trim()) {
      alert('Nama Rombel / Kelas wajib diisi.');
      return;
    }

    let updatedClasses: SchoolClass[];
    if (editingClass) {
      const oldName = editingClass.name;
      const newName = classForm.name.trim();
      updatedClasses = currentClasses.map((c) =>
        c.id === editingClass.id
          ? { ...classForm, name: newName, id: editingClass.id }
          : c
      );

      // If class name changed, cascade update student records enrolled in oldName
      if (oldName !== newName) {
        const updatedStudents = students.map((s) =>
          s.className === oldName
            ? { ...s, className: newName, majorId: classForm.majorId, grade: classForm.grade, waliKelas: classForm.waliKelas || s.waliKelas }
            : s
        );
        onUpdateStudents(updatedStudents);
      }
      onToast(`Data kelas ${newName} berhasil diperbarui.`);
    } else {
      const newCls: SchoolClass = {
        ...classForm,
        name: classForm.name.trim(),
        id: `cls-${Date.now()}`,
      };
      updatedClasses = [...currentClasses, newCls];
      onToast(`Kelas ${newCls.name} berhasil ditambahkan ke Master Data.`);
    }

    onUpdateClasses?.(updatedClasses);
    setClassModalOpen(false);
  };

  const handleDeleteClass = (cls: SchoolClass) => {
    const studentCountInClass = students.filter((s) => s.className === cls.name).length;
    let confirmMsg = `Hapus data master kelas ${cls.name}?`;
    if (studentCountInClass > 0) {
      confirmMsg = `PERINGATAN: Terdapat ${studentCountInClass} siswa aktif yang terdaftar di kelas ${cls.name}.\n\nJika kelas dihapus, siswa akan tetap ada di database tetapi tidak lagi terhubung ke master kelas.\n\nApakah Anda yakin ingin menghapus kelas ini?`;
    }
    if (confirm(confirmMsg)) {
      const updated = currentClasses.filter((c) => c.id !== cls.id);
      onUpdateClasses?.(updated);
      onToast(`Kelas ${cls.name} berhasil dihapus.`);
    }
  };

  const handleDownloadTemplateClass = () => {
    const templateData = [
      {
        Nama_Kelas: 'X RPL 3',
        Tingkat: 'X',
        Kode_Jurusan: 'RPL',
        Wali_Kelas: 'Ir. Danang Prasetyo, S.Kom.',
        Ruang_Kelas: 'Lab Software 3',
      },
      {
        Nama_Kelas: 'XI AKL 3',
        Tingkat: 'XI',
        Kode_Jurusan: 'AKL',
        Wali_Kelas: 'Dra. Endang Sulistiyani',
        Ruang_Kelas: 'Bank Mini 2',
      },
      {
        Nama_Kelas: 'XII DKV 3',
        Tingkat: 'XII',
        Kode_Jurusan: 'DKV',
        Wali_Kelas: 'Farhan Maulana, S.Ds.',
        Ruang_Kelas: 'Studio Cetak 2',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Master_Kelas');
    XLSX.writeFile(wb, 'Template_Import_Master_Kelas_SMKN1_Jember.xlsx');
    onToast('Template Excel Master Kelas berhasil diunduh.');
  };

  const handleFileUploadClass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setClassImportFileName(file.name);
    setClassImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setClassImportError('File kosong atau format tidak sesuai.');
          return;
        }

        const parsed: Partial<SchoolClass>[] = rawJson.map((row, idx) => {
          const name = String(row['Nama_Kelas'] || row['Nama'] || row['Kelas'] || row['Rombel'] || '').trim();
          let grade: GradeLevel = 'X';
          const rawGrade = String(row['Tingkat'] || row['grade'] || '').toUpperCase();
          if (rawGrade.includes('XII')) grade = 'XII';
          else if (rawGrade.includes('XI')) grade = 'XI';
          else if (name.toUpperCase().startsWith('XII')) grade = 'XII';
          else if (name.toUpperCase().startsWith('XI')) grade = 'XI';

          let majorId: MajorId = 'RPL';
          const rawMajor = String(row['Kode_Jurusan'] || row['Jurusan'] || row['major'] || '').toUpperCase();
          if (rawMajor) {
            const foundMaj = currentMajors.find(m => m.id.toUpperCase() === rawMajor || m.code.toUpperCase() === rawMajor);
            if (foundMaj) majorId = foundMaj.id;
          } else {
            const foundMaj = currentMajors.find(m => name.toUpperCase().includes(m.code.toUpperCase()));
            if (foundMaj) majorId = foundMaj.id;
          }

          const waliKelas = String(row['Wali_Kelas'] || row['Wali'] || '-').trim();
          const room = String(row['Ruang_Kelas'] || row['Ruangan'] || row['Lab'] || '').trim();

          return {
            id: `cls-imp-${Date.now()}-${idx}`,
            name,
            grade,
            majorId,
            waliKelas,
            room,
          };
        }).filter(r => Boolean(r.name));

        if (parsed.length === 0) {
          setClassImportError('Tidak ditemukan baris kelas yang valid (Nama_Kelas kosong).');
          return;
        }

        setParsedImportClassRows(parsed);
      } catch (err) {
        console.error('Error parsing excel master kelas', err);
        setClassImportError('Gagal membaca file Excel/CSV. Pastikan format file valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImportClass = () => {
    if (parsedImportClassRows.length === 0) return;

    let updated: SchoolClass[] = [];
    if (importClassMode === 'replace') {
      updated = parsedImportClassRows as SchoolClass[];
    } else {
      const existingNames = new Set(currentClasses.map((c) => c.name.toLowerCase()));
      const newItems = (parsedImportClassRows as SchoolClass[]).filter(
        (c) => !existingNames.has(c.name.toLowerCase())
      );
      updated = [...currentClasses, ...newItems];
    }

    onUpdateClasses?.(updated);
    onToast(`Berhasil mengimpor ${parsedImportClassRows.length} data rombel/kelas.`);
    setClassImportModalOpen(false);
    setParsedImportClassRows([]);
    setClassImportFileName('');
  };

  const handleExportClasses = () => {
    const exportRows = filteredClasses.map((c, idx) => {
      const studentCount = students.filter((s) => s.className === c.name).length;
      const maj = currentMajors.find((m) => m.id === c.majorId);
      return {
        No: idx + 1,
        Nama_Kelas: c.name,
        Tingkat: c.grade,
        Kode_Jurusan: c.majorId,
        Nama_Jurusan: maj ? maj.name : c.majorId,
        Wali_Kelas: c.waliKelas,
        Ruang_Kelas: c.room || '-',
        Jumlah_Siswa: studentCount,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Kelas');
    XLSX.writeFile(wb, `Master_Kelas_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Data master kelas berhasil diekspor ke Excel.');
  };

  // ========================
  // JURUSAN CRUD & EXCEL
  // ========================
  const filteredMajors = currentMajors.filter((m) => {
    if (majorSearch.trim()) {
      const q = majorSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.kaprodi.toLowerCase().includes(q) ||
        (m.description && m.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenAddMajorModal = () => {
    setEditingMajor(null);
    setMajorForm({
      id: '',
      code: '',
      name: '',
      kaprodi: '',
      color: '#2563EB',
      description: '',
    });
    setMajorModalOpen(true);
  };

  const handleOpenEditMajorModal = (maj: Major) => {
    setEditingMajor(maj);
    setMajorForm({
      id: maj.id,
      code: maj.code,
      name: maj.name,
      kaprodi: maj.kaprodi,
      color: maj.color,
      description: maj.description || '',
    });
    setMajorModalOpen(true);
  };

  const handleSaveMajor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!majorForm.code.trim() || !majorForm.name.trim()) {
      alert('Kode dan Nama Jurusan wajib diisi.');
      return;
    }

    const codeClean = majorForm.code.trim().toUpperCase();
    let updatedMajors: Major[];

    if (editingMajor) {
      updatedMajors = currentMajors.map((m) =>
        m.id === editingMajor.id
          ? { ...majorForm, id: editingMajor.id, code: codeClean }
          : m
      );
      onToast(`Program Keahlian ${majorForm.name} berhasil diperbarui.`);
    } else {
      const existing = currentMajors.find((m) => m.id === codeClean || m.code === codeClean);
      if (existing) {
        alert(`Kode jurusan "${codeClean}" sudah ada di database.`);
        return;
      }
      const newMaj: Major = {
        ...majorForm,
        id: codeClean,
        code: codeClean,
      };
      updatedMajors = [...currentMajors, newMaj];
      onToast(`Jurusan baru ${newMaj.name} (${newMaj.code}) berhasil ditambahkan.`);
    }

    onUpdateMajors?.(updatedMajors);
    setMajorModalOpen(false);
  };

  const handleDeleteMajor = (maj: Major) => {
    const classCount = currentClasses.filter((c) => c.majorId === maj.id).length;
    const studentCount = students.filter((s) => s.majorId === maj.id).length;
    let confirmMsg = `Hapus data master jurusan ${maj.code} - ${maj.name}?`;
    if (classCount > 0 || studentCount > 0) {
      confirmMsg = `PERINGATAN: Terdapat ${classCount} rombel dan ${studentCount} siswa terdaftar di jurusan ini.\n\nApakah Anda yakin ingin menghapus program keahlian ini?`;
    }
    if (confirm(confirmMsg)) {
      const updated = currentMajors.filter((m) => m.id !== maj.id);
      onUpdateMajors?.(updated);
      onToast(`Program Keahlian ${maj.code} berhasil dihapus.`);
    }
  };

  const handleDownloadTemplateMajor = () => {
    const templateData = [
      {
        Kode_Jurusan: 'TEI',
        Nama_Jurusan: 'Teknik Elektronika Industri',
        Kaprodi: 'Ir. Bambang Wijaya, M.T.',
        Warna: '#0284C7',
        Keterangan: 'Fokus otomasi robotika industri & microcontroller',
      },
      {
        Kode_Jurusan: 'TJKT',
        Nama_Jurusan: 'Teknik Jaringan Komputer dan Telekomunikasi',
        Kaprodi: 'Sulistyo Utomo, S.Kom.',
        Warna: '#4F46E5',
        Keterangan: 'Fokus cloud computing, routing & administrasi server',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Master_Jurusan');
    XLSX.writeFile(wb, 'Template_Import_Master_Jurusan_SMKN1_Jember.xlsx');
    onToast('Template Excel Master Jurusan berhasil diunduh.');
  };

  const handleFileUploadMajor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMajorImportFileName(file.name);
    setMajorImportError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (rawJson.length === 0) {
          setMajorImportError('File kosong atau format tidak sesuai.');
          return;
        }

        const parsed: Partial<Major>[] = rawJson.map((row) => {
          const code = String(row['Kode_Jurusan'] || row['Kode'] || row['code'] || '').trim().toUpperCase();
          const name = String(row['Nama_Jurusan'] || row['Nama'] || row['Program Keahlian'] || '').trim();
          const kaprodi = String(row['Kaprodi'] || row['Ketua Program'] || row['Kepala'] || '-').trim();
          const color = String(row['Warna'] || row['color'] || '#2563EB').trim();
          const description = String(row['Keterangan'] || row['Deskripsi'] || '').trim();

          return {
            id: code,
            code,
            name,
            kaprodi,
            color,
            description,
          };
        }).filter(m => Boolean(m.code && m.name));

        if (parsed.length === 0) {
          setMajorImportError('Tidak ditemukan baris jurusan valid (Kode_Jurusan & Nama_Jurusan wajib diisi).');
          return;
        }

        setParsedImportMajorRows(parsed);
      } catch (err) {
        console.error('Error parsing excel master jurusan', err);
        setMajorImportError('Gagal membaca file Excel/CSV. Pastikan format file valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImportMajor = () => {
    if (parsedImportMajorRows.length === 0) return;

    let updated: Major[] = [];
    if (importMajorMode === 'replace') {
      updated = parsedImportMajorRows as Major[];
    } else {
      const existingCodes = new Set(currentMajors.map((m) => m.code.toUpperCase()));
      const newItems = (parsedImportMajorRows as Major[]).filter(
        (m) => !existingCodes.has(m.code.toUpperCase())
      );
      updated = [...currentMajors, ...newItems];
    }

    onUpdateMajors?.(updated);
    onToast(`Berhasil mengimpor ${parsedImportMajorRows.length} data program keahlian/jurusan.`);
    setMajorImportModalOpen(false);
    setParsedImportMajorRows([]);
    setMajorImportFileName('');
  };

  const handleExportMajors = () => {
    const exportRows = filteredMajors.map((m, idx) => {
      const classCount = currentClasses.filter((c) => c.majorId === m.id).length;
      const studentCount = students.filter((s) => s.majorId === m.id).length;
      return {
        No: idx + 1,
        Kode_Jurusan: m.code,
        Nama_Program_Keahlian: m.name,
        Kaprodi: m.kaprodi,
        Warna_Label: m.color,
        Jumlah_Rombel: classCount,
        Jumlah_Siswa: studentCount,
        Keterangan: m.description || '-',
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Jurusan');
    XLSX.writeFile(wb, `Master_Jurusan_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Data master jurusan berhasil diekspor ke Excel.');
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

  // ========================
  // MASTER AKUN PENGGUNA CRUD & ACTIONS
  // ========================
  const filteredAccounts = currentAccounts.filter((acc) => {
    if (accountSearch.trim()) {
      const q = accountSearch.toLowerCase();
      const match =
        acc.name.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        (acc.nip && acc.nip.includes(q)) ||
        acc.roleTitle.toLowerCase().includes(q) ||
        (acc.email && acc.email.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (accountRoleFilter !== 'ALL' && acc.role !== accountRoleFilter) return false;
    if (accountStatusFilter !== 'ALL' && acc.status !== accountStatusFilter) return false;
    return true;
  });

  const handleTogglePasswordVisibility = (accId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [accId]: !prev[accId],
    }));
  };

  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setShowAccountFormPassword(false);
    setAccountForm({
      username: '',
      password: 'smesa' + Math.floor(100 + Math.random() * 900),
      name: '',
      nip: '',
      role: 'kesiswaan',
      roleTitle: 'Tim Kesiswaan / Staf Kedisiplinan',
      email: '',
      phone: '628',
      majorId: undefined,
      className: undefined,
      status: 'Aktif',
      notes: '',
    });
    setAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: UserAccount) => {
    setEditingAccount(acc);
    setShowAccountFormPassword(false);
    setAccountForm({
      username: acc.username,
      password: acc.password,
      name: acc.name,
      nip: acc.nip || '',
      role: acc.role,
      roleTitle: acc.roleTitle,
      email: acc.email || '',
      phone: acc.phone || '628',
      majorId: acc.majorId,
      className: acc.className,
      status: acc.status,
      notes: acc.notes || '',
    });
    setAccountModalOpen(true);
  };

  // Helper when admin picks existing personel to auto-link
  const handleAutoLinkPersonel = (type: 'kesiswaan' | 'kkk' | 'bk' | 'kepsek', id: string) => {
    if (type === 'bk') {
      const p = guruBK.find((g) => g.id === id);
      if (p) {
        const cleanName = p.name.split(',')[0].trim().toLowerCase().replace(/[^a-z]/g, '');
        setAccountForm((prev) => ({
          ...prev,
          role: 'bk',
          name: p.name,
          nip: p.nip,
          phone: p.phone,
          email: p.email || `${cleanName}.bk@smkn1jember.sch.id`,
          roleTitle: p.roleTitle || 'Guru Bimbingan Konseling',
          username: prev.username || `bk.${cleanName.slice(0, 10)}`,
        }));
      }
    } else if (type === 'kkk') {
      const p = kkkList.find((k) => k.id === id);
      if (p) {
        setAccountForm((prev) => ({
          ...prev,
          role: 'kkk',
          name: p.name,
          nip: p.nip,
          phone: p.phone,
          email: p.email || `kkk.${p.majorId.toLowerCase()}@smkn1jember.sch.id`,
          roleTitle: `KKK ${p.majorName}`,
          majorId: p.majorId,
          username: prev.username || `kkk.${p.majorId.toLowerCase()}`,
        }));
      }
    } else if (type === 'kesiswaan') {
      const p = timKesiswaan.find((t) => t.id === id);
      if (p) {
        const cleanName = p.name.split(',')[0].trim().toLowerCase().replace(/[^a-z]/g, '');
        setAccountForm((prev) => ({
          ...prev,
          role: 'kesiswaan',
          name: p.name,
          nip: p.nip,
          phone: p.phone,
          email: p.email || `${cleanName}@smkn1jember.sch.id`,
          roleTitle: p.position || 'Tim Kesiswaan SMKN 1 Jember',
          username: prev.username || cleanName.slice(0, 12),
        }));
      }
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = accountForm.username.trim().toLowerCase();
    if (!cleanUsername) {
      alert('Username wajib diisi.');
      return;
    }
    if (!/^[a-z0-9._-]+$/.test(cleanUsername)) {
      alert('Username hanya boleh memuat huruf kecil, angka, titik (.), strip (-), atau garis bawah (_).');
      return;
    }
    if (!accountForm.password.trim()) {
      alert('Password akun wajib diisi.');
      return;
    }
    if (!accountForm.name.trim()) {
      alert('Nama lengkap pengguna wajib diisi.');
      return;
    }

    // Check unique username
    const duplicate = currentAccounts.find(
      (a) => a.username.toLowerCase() === cleanUsername && (!editingAccount || a.id !== editingAccount.id)
    );
    if (duplicate) {
      alert(`Username "${cleanUsername}" sudah digunakan oleh akun lain (${duplicate.name}). Silakan gunakan username berbeda.`);
      return;
    }

    let updatedAccounts: UserAccount[];
    if (editingAccount) {
      updatedAccounts = currentAccounts.map((a) =>
        a.id === editingAccount.id
          ? {
              ...accountForm,
              id: editingAccount.id,
              username: cleanUsername,
              createdAt: editingAccount.createdAt,
              lastLogin: editingAccount.lastLogin,
            }
          : a
      );
      onToast(`Akun ${cleanUsername} (${accountForm.name}) berhasil diperbarui.`);
    } else {
      const newAcc: UserAccount = {
        ...accountForm,
        id: `usr-${Date.now()}`,
        username: cleanUsername,
        createdAt: new Date().toISOString(),
      };
      updatedAccounts = [...currentAccounts, newAcc];
      onToast(`Akun baru ${cleanUsername} berhasil dibuat dan siap digunakan untuk login.`);
    }

    onUpdateAccounts?.(updatedAccounts);
    setAccountModalOpen(false);
  };

  const handleToggleAccountStatus = (acc: UserAccount) => {
    const nextStatus: 'Aktif' | 'Nonaktif' = acc.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    if (acc.username === 'admin' && nextStatus === 'Nonaktif') {
      alert('Akun Super Admin "admin" tidak dapat dinonaktifkan demi keamanan sistem.');
      return;
    }
    const updated = currentAccounts.map((a) => (a.id === acc.id ? { ...a, status: nextStatus } : a));
    onUpdateAccounts?.(updated);
    onToast(`Status akun ${acc.username} diubah menjadi ${nextStatus.toUpperCase()}.`);
  };

  const handleDeleteAccount = (acc: UserAccount) => {
    if (acc.username === 'admin') {
      alert('Akun Super Admin "admin" tidak boleh dihapus.');
      return;
    }
    if (confirm(`Hapus akun pengguna "${acc.username}" (${acc.name} - ${acc.roleTitle})? Pengguna tidak akan dapat login lagi.`)) {
      const updated = currentAccounts.filter((a) => a.id !== acc.id);
      onUpdateAccounts?.(updated);
      onToast(`Akun ${acc.username} berhasil dihapus.`);
    }
  };

  const handleOpenResetPassword = (acc: UserAccount) => {
    setAccountForPasswordReset(acc);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowNewPassword(false);
    setResetPasswordModalOpen(true);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForPasswordReset) return;
    const newPass = newPasswordInput.trim();
    if (!newPass) {
      alert('Password baru tidak boleh kosong.');
      return;
    }
    if (confirmPasswordInput && newPass !== confirmPasswordInput.trim()) {
      alert('Konfirmasi kata sandi tidak cocok. Silakan ketik ulang.');
      return;
    }

    const updated = currentAccounts.map((a) =>
      a.id === accountForPasswordReset.id ? { ...a, password: newPass } : a
    );
    onUpdateAccounts?.(updated);
    onToast(`Password untuk akun "${accountForPasswordReset.username}" berhasil diubah menjadi: ${newPass}`);
    setResetPasswordModalOpen(false);
  };

  const handleExportAccounts = () => {
    const exportRows = filteredAccounts.map((a, idx) => ({
      No: idx + 1,
      Username: a.username,
      Password: a.password,
      Nama_Lengkap: a.name,
      NIP: a.nip || '-',
      Peran_Akses: a.role.toUpperCase(),
      Jabatan_Penugasan: a.roleTitle,
      Email: a.email || '-',
      No_WhatsApp: a.phone || '-',
      Jurusan_Terkait: a.majorId || '-',
      Status_Akun: a.status,
      Terakhir_Login: a.lastLogin ? new Date(a.lastLogin).toLocaleString('id-ID') : 'Belum pernah',
      Tanggal_Dibuat: new Date(a.createdAt).toLocaleString('id-ID'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Akun_Pengguna');
    XLSX.writeFile(wb, `Master_Data_Akun_Pengguna_PATROL_SMESA_${new Date().toISOString().split('T')[0]}.xlsx`);
    onToast('Data master akun pengguna berhasil diekspor ke Excel.');
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

          {/* Reset Sample Data Button (SMKN 1 Jember) */}
          <button
            onClick={() => setConfirmResetSampleOpen(true)}
            className="px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-950/70 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Muat ulang seluruh data contoh resmi SMKN 1 Jember"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Reset Data Sampel</span>
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
          onClick={() => setActiveTab('kelas_jurusan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'kelas_jurusan'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Master Kelas &amp; Jurusan ({currentClasses.length} Kls / {currentMajors.length} Jur)</span>
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

        <button
          onClick={() => setActiveTab('akun')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'akun'
              ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 shadow-xs'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <KeyRound className="w-4 h-4 text-indigo-500" />
          <span>Master Akun Pengguna ({currentAccounts.length})</span>
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
                onChange={(e) => {
                  setSelectedMajor(e.target.value);
                  setSelectedClass('ALL');
                }}
                className="py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Jurusan ({currentMajors.length})</option>
                {currentMajors.map((m) => (
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
                <option value="ALL">Semua Kelas ({availableClassesForFilter.length})</option>
                {availableClassesForFilter.map((cls) => (
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
      {/* TAB 2: MASTER KELAS & JURUSAN                            */}
      {/* ======================================================== */}
      {activeTab === 'kelas_jurusan' && (
        <div className="space-y-4">
          {/* Sub-tab Navigation and Global Statistics */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors">
            {/* Sub-tab pills */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg w-fit">
              <button
                onClick={() => setKjSubTab('kelas')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  kjSubTab === 'kelas'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Master Rombel / Kelas ({currentClasses.length})</span>
              </button>

              <button
                onClick={() => setKjSubTab('jurusan')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  kjSubTab === 'jurusan'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Master Program Keahlian / Jurusan ({currentMajors.length})</span>
              </button>
            </div>

            {/* Quick stats badges */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-full font-medium">
                Tingkat X: {currentClasses.filter((c) => c.grade === 'X').length} | XI: {currentClasses.filter((c) => c.grade === 'XI').length} | XII: {currentClasses.filter((c) => c.grade === 'XII').length} Kelas
              </span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-medium">
                {students.length} Siswa Terploting
              </span>
            </div>
          </div>

          {/* VIEW A: MASTER ROMBEL / KELAS */}
          {kjSubTab === 'kelas' && (
            <div className="space-y-4">
              {/* Toolbar Kelas */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
                <div className="w-full md:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    placeholder="Cari Rombel, Wali Kelas, Ruang..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <select
                    value={classGradeFilter}
                    onChange={(e) => setClassGradeFilter(e.target.value)}
                    className="py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">Semua Tingkat</option>
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>

                  <select
                    value={classMajorFilter}
                    onChange={(e) => setClassMajorFilter(e.target.value)}
                    className="py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <option value="ALL">Semua Jurusan</option>
                    {currentMajors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleDownloadTemplateClass}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Unduh Format Excel Master Kelas"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Format Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setClassImportError(null);
                      setParsedImportClassRows([]);
                      setClassImportModalOpen(true);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Impor Master Kelas dari Excel/CSV"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Excel</span>
                  </button>

                  <button
                    onClick={handleExportClasses}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Ekspor Seluruh Data Rombel ke Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ekspor Excel</span>
                  </button>

                  <button
                    onClick={handleOpenAddClassModal}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Kelas</span>
                  </button>
                </div>
              </div>

              {/* Table Kelas */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
                {filteredClasses.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Tidak ditemukan data rombel/kelas yang sesuai pencarian atau filter.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800 tracking-wider">
                        <tr>
                          <th className="py-3 px-3 w-12 text-center">No</th>
                          <th className="py-3 px-3">Nama Rombel / Kelas</th>
                          <th className="py-3 px-3">Tingkat</th>
                          <th className="py-3 px-3">Program Keahlian</th>
                          <th className="py-3 px-3">Wali Kelas</th>
                          <th className="py-3 px-3">Ruangan / Lab</th>
                          <th className="py-3 px-3 text-center">Jumlah Siswa</th>
                          <th className="py-3 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredClasses.map((cls, idx) => {
                          const maj = currentMajors.find((m) => m.id === cls.majorId);
                          const studentCount = students.filter((s) => s.className === cls.name).length;
                          return (
                            <tr
                              key={cls.id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-2.5 px-3 text-center text-slate-400 text-[11px] font-mono">
                                {idx + 1}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <School className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                  <span>{cls.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  cls.grade === 'X'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : cls.grade === 'XI'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                }`}>
                                  Kelas {cls.grade}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                                  style={{
                                    backgroundColor: maj ? `${maj.color}15` : '#2563EB15',
                                    color: maj ? maj.color : '#2563EB',
                                    border: `1px solid ${maj ? `${maj.color}35` : '#2563EB35'}`,
                                  }}
                                >
                                  <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ backgroundColor: maj ? maj.color : '#2563EB' }}
                                  />
                                  <span>{maj ? maj.code : cls.majorId}</span>
                                  <span className="text-slate-400 dark:text-slate-500 font-normal">
                                    • {maj ? maj.name.split('(')[0] : ''}
                                  </span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{cls.waliKelas || '-'}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap text-[11px]">
                                {cls.room || '-'}
                              </td>
                              <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  studentCount > 0
                                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}>
                                  {studentCount} Siswa
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenEditClassModal(cls)}
                                    className="p-1.5 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition-colors"
                                    title="Edit Rombel"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClass(cls)}
                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                                    title="Hapus Rombel"
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
            </div>
          )}

          {/* VIEW B: MASTER JURUSAN / PROGRAM KEAHLIAN */}
          {kjSubTab === 'jurusan' && (
            <div className="space-y-4">
              {/* Toolbar Jurusan */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
                <div className="w-full md:w-80 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={majorSearch}
                    onChange={(e) => setMajorSearch(e.target.value)}
                    placeholder="Cari Kode Jurusan, Nama, Kaprodi..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleDownloadTemplateMajor}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Unduh Format Excel Master Jurusan"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Format Excel</span>
                  </button>

                  <button
                    onClick={() => {
                      setMajorImportError(null);
                      setParsedImportMajorRows([]);
                      setMajorImportModalOpen(true);
                    }}
                    className="px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Impor Master Jurusan dari Excel/CSV"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Excel</span>
                  </button>

                  <button
                    onClick={handleExportMajors}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    title="Ekspor Seluruh Data Jurusan ke Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Ekspor Excel</span>
                  </button>

                  <button
                    onClick={handleOpenAddMajorModal}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Jurusan</span>
                  </button>
                </div>
              </div>

              {/* Table Jurusan */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
                {filteredMajors.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Tidak ditemukan data program keahlian yang sesuai pencarian.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-200 dark:border-slate-800 tracking-wider">
                        <tr>
                          <th className="py-3 px-3 w-12 text-center">No</th>
                          <th className="py-3 px-3">Kode Jurusan</th>
                          <th className="py-3 px-3">Nama Program Keahlian</th>
                          <th className="py-3 px-3">Kepala Program (Kaprodi)</th>
                          <th className="py-3 px-3 text-center">Total Rombel</th>
                          <th className="py-3 px-3 text-center">Total Siswa</th>
                          <th className="py-3 px-3">Fokus / Deskripsi Keahlian</th>
                          <th className="py-3 px-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredMajors.map((maj, idx) => {
                          const classCount = currentClasses.filter((c) => c.majorId === maj.id).length;
                          const studentCount = students.filter((s) => s.majorId === maj.id).length;
                          return (
                            <tr
                              key={maj.id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3 px-3 text-center text-slate-400 text-[11px] font-mono">
                                {idx + 1}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold"
                                  style={{
                                    backgroundColor: `${maj.color}15`,
                                    color: maj.color,
                                    border: `1px solid ${maj.color}40`,
                                  }}
                                >
                                  <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: maj.color }}
                                  />
                                  <span>{maj.code}</span>
                                </span>
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                                {maj.name}
                              </td>
                              <td className="py-3 px-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{maj.kaprodi || '-'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                  {classCount} Rombel
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                  {studentCount} Siswa
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px] max-w-xs truncate">
                                {maj.description || '-'}
                              </td>
                              <td className="py-3 px-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleOpenEditMajorModal(maj)}
                                    className="p-1.5 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition-colors"
                                    title="Edit Jurusan"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMajor(maj)}
                                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors"
                                    title="Hapus Jurusan"
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
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MASTER GURU BK                                    */}
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
      {/* TAB 5: MASTER AKUN PENGGUNA (USER MANAGEMENT)            */}
      {/* ======================================================== */}
      {activeTab === 'akun' && (
        <div className="space-y-4">
          {/* Top Quick Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Akun</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {currentAccounts.length}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {currentAccounts.filter((a) => a.status === 'Aktif').length} Aktif
              </span>
            </div>

            <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">Kesiswaan (Admin)</span>
              <div className="text-xl font-extrabold text-blue-900 dark:text-blue-100 mt-0.5">
                {currentAccounts.filter((a) => a.role === 'kesiswaan').length}
              </div>
              <span className="text-[10px] text-blue-600 dark:text-blue-400">Hak Akses Penuh</span>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block">Kepala Sekolah</span>
              <div className="text-xl font-extrabold text-amber-900 dark:text-amber-100 mt-0.5">
                {currentAccounts.filter((a) => a.role === 'kepsek').length}
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">Supervisi &amp; Eksekutif</span>
            </div>

            <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl p-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">Guru BK</span>
              <div className="text-xl font-extrabold text-purple-900 dark:text-purple-100 mt-0.5">
                {currentAccounts.filter((a) => a.role === 'bk').length}
              </div>
              <span className="text-[10px] text-purple-600 dark:text-purple-400">Konseling &amp; Panggilan</span>
            </div>

            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">KKK (Kaprodi)</span>
              <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-0.5">
                {currentAccounts.filter((a) => a.role === 'kkk').length}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Monitoring Jurusan</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Petugas Piket</span>
              <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                {currentAccounts.filter((a) => a.role === 'piket').length}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Gerbang &amp; Jam Hadir</span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between transition-colors">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                placeholder="Cari Username, Nama, NIP, Jabatan..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={accountRoleFilter}
                onChange={(e) => setAccountRoleFilter(e.target.value as any)}
                className="py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Peran ({currentAccounts.length})</option>
                <option value="kesiswaan">TIM Kesiswaan (Admin)</option>
                <option value="kepsek">Kepala Sekolah</option>
                <option value="bk">GURU BK</option>
                <option value="kkk">KKK (Ketua Konsentrasi)</option>
                <option value="piket">Petugas Piket Gerbang</option>
              </select>

              <select
                value={accountStatusFilter}
                onChange={(e) => setAccountStatusFilter(e.target.value as any)}
                className="py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>

              <button
                type="button"
                onClick={handleExportAccounts}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Ekspor seluruh data akun dan password ke Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Ekspor Excel</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddAccount}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Akun Baru (Admin)</span>
              </button>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Daftar Akun Pengguna &amp; Kredensial Akses ({filteredAccounts.length} Akun)
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Dibuat dan dikelola oleh Administrator Tim Kesiswaan untuk login ke aplikasi.
                </p>
              </div>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Keamanan &amp; Autentikasi Internal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-750">
                  <tr>
                    <th className="py-2.5 px-3">No</th>
                    <th className="py-2.5 px-3">Username</th>
                    <th className="py-2.5 px-3">Nama Pegawai &amp; NIP</th>
                    <th className="py-2.5 px-3">Peran (Hak Akses)</th>
                    <th className="py-2.5 px-3">Jabatan / Penugasan</th>
                    <th className="py-2.5 px-3">Password Akun</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Terakhir Login</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        Tidak ada akun yang sesuai dengan pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc, idx) => {
                      const isPasswordVisible = visiblePasswords[acc.id] || false;
                      const roleBadge = (() => {
                        switch (acc.role) {
                          case 'kesiswaan':
                            return { label: 'TIM KESISWAAN', bg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
                          case 'kepsek':
                            return { label: 'KEPALA SEKOLAH', bg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
                          case 'bk':
                            return { label: 'GURU BK', bg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
                          case 'kkk':
                            return { label: 'KKK (KAPRODI)', bg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
                          case 'piket':
                            return { label: 'PIKET GERBANG', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' };
                          default:
                            return { label: acc.role.toUpperCase(), bg: 'bg-slate-100 text-slate-700' };
                        }
                      })();

                      return (
                        <tr key={acc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-400 dark:text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/60">
                                {acc.username}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(acc.username);
                                  onToast(`Username "${acc.username}" disalin ke clipboard.`);
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                                title="Salin username"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="font-bold text-slate-900 dark:text-white">{acc.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">NIP: {acc.nip || '-'}</div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleBadge.bg}`}>
                              {roleBadge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="text-slate-800 dark:text-slate-200 font-medium">{acc.roleTitle}</div>
                            {acc.majorId && (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                                Jurusan: {acc.majorId}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">
                                {isPasswordVisible ? acc.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTogglePasswordVisibility(acc.id)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                title={isPasswordVisible ? 'Sembunyikan password' : 'Lihat password'}
                              >
                                {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleToggleAccountStatus(acc)}
                              className={`px-2 py-0.5 rounded font-bold text-[10px] transition-colors cursor-pointer ${
                                acc.status === 'Aktif'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                                  : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 hover:bg-red-200'
                              }`}
                              title="Klik untuk mengubah status akun"
                            >
                              {acc.status}
                            </button>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            {acc.lastLogin
                              ? new Date(acc.lastLogin).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Belum pernah'}
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenResetPassword(acc)}
                                className="p-1.5 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded transition-colors cursor-pointer"
                                title="Ganti / Reset Password"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditAccount(acc)}
                                className="p-1.5 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded transition-colors cursor-pointer"
                                title="Edit Akun"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAccount(acc)}
                                disabled={acc.username === 'admin'}
                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title={acc.username === 'admin' ? 'Akun Super Admin tidak boleh dihapus' : 'Hapus Akun'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
                  <label className="block font-semibold mb-1">Jurusan / Keahlian</label>
                  <select
                    value={formData.majorId}
                    onChange={(e) => handleSelectMajorInStudentForm(e.target.value as MajorId)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    {currentMajors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tingkat</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => {
                      const newGrade = e.target.value as GradeLevel;
                      // auto find class matching this grade and major
                      const matchedClass = currentClasses.find(
                        (c) => c.grade === newGrade && c.majorId === formData.majorId
                      );
                      setFormData({
                        ...formData,
                        grade: newGrade,
                        className: matchedClass && !useCustomClassName ? matchedClass.name : formData.className,
                        waliKelas: matchedClass && !useCustomClassName ? matchedClass.waliKelas : formData.waliKelas,
                      });
                    }}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
              </div>

              {/* Integrasi Pilihan Kelas dari Master Data */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold">
                      Pilihan Rombel / Kelas <span className="text-blue-600 dark:text-blue-400 font-normal">(Master Data)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setUseCustomClassName(!useCustomClassName)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {useCustomClassName ? '← Pilih dari Master' : 'Ketik Manual'}
                    </button>
                  </div>

                  {!useCustomClassName ? (
                    <select
                      value={formData.className}
                      onChange={(e) => handleSelectClassInStudentForm(e.target.value)}
                      className="w-full p-2 border border-blue-400 dark:border-blue-600 rounded-lg bg-blue-50/40 dark:bg-slate-800 font-semibold text-slate-900 dark:text-white"
                      required
                    >
                      <optgroup label={`Rombel Jurusan ${formData.majorId} (${currentClasses.filter((c) => c.majorId === formData.majorId).length} Kelas)`}>
                        {currentClasses
                          .filter((c) => c.majorId === formData.majorId)
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name} {c.waliKelas ? `— Wali: ${c.waliKelas}` : ''}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Rombel Jurusan Lainnya">
                        {currentClasses
                          .filter((c) => c.majorId !== formData.majorId)
                          .map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name} ({c.majorId})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                      placeholder="Contoh: X RPL 1 (Kustom)"
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Wali Kelas <span className="text-slate-400 font-normal">(Otomatis Terisi)</span>
                  </label>
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

              {/* Status banner integrasi otomatis */}
              {currentClasses.find((c) => c.name === formData.className) && (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Terintegrasi Master Data: Tingkat {formData.grade} • Jurusan {formData.majorId} • Wali: <strong>{formData.waliKelas || '-'}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    Auto-Sync
                  </span>
                </div>
              )}

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

      {/* Confirmation Dialog: Reset ke Data Sampel SMKN 1 Jember */}
      {confirmResetSampleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-purple-200 dark:border-purple-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-200" />
                <h3 className="font-bold text-sm">Muat Ulang Data Sampel SMKN 1 Jember</h3>
              </div>
              <button
                type="button"
                onClick={() => setConfirmResetSampleOpen(false)}
                className="text-purple-200 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Apakah Anda ingin mengembalikan seluruh master data dan pencatatan ke <strong>Dataset Contoh Resmi SMKN 1 Jember</strong>?
              </p>

              <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl p-3.5 space-y-2">
                <div className="font-semibold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Cakupan Data yang Dimuat Ulang:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-purple-950/80 dark:text-purple-300/80 text-[11px]">
                  <li><strong>Siswa Aktif:</strong> Siswa contoh di 7 Konsentrasi Keahlian (RPL, AKL, MPLB, BD, DKV, KL, HTL).</li>
                  <li><strong>Struktur Kelas:</strong> 30+ Rombel kelas X, XI, XII beserta Wali Kelas &amp; Ruangan.</li>
                  <li><strong>Personil Sekolah:</strong> 7 Kaprodi (KKK), Guru BK, dan Tim Kesiswaan SMKN 1 Jember.</li>
                  <li><strong>Riwayat Keterlambatan:</strong> Catatan pelanggaran gerbang pagi dan komitmen pembinaan BK contoh.</li>
                </ul>
              </div>

              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-blue-900 dark:text-blue-300 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>Data otomatis diperbarui di lokal dan disinkronkan ke Cloud Firebase.</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmResetSampleOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetSampleOpen(false);
                  onResetSampleData?.();
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ya, Muat Ulang Data Sampel</span>
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

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT KELAS                               */}
      {/* ======================================================== */}
      {classModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {editingClass ? `Edit Rombel: ${editingClass.name}` : 'Tambah Rombel / Kelas Baru'}
                </h3>
              </div>
              <button
                onClick={() => setClassModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-5 space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tingkat Kelas</label>
                  <select
                    value={classForm.grade}
                    onChange={(e) => {
                      const nextGrade = e.target.value as GradeLevel;
                      setClassForm((prev) => ({
                        ...prev,
                        grade: nextGrade,
                        name: prev.name ? `${nextGrade} ${prev.majorId} ${prev.name.split(' ').pop() || '1'}` : `${nextGrade} ${prev.majorId} 1`,
                      }));
                    }}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Program Keahlian</label>
                  <select
                    value={classForm.majorId}
                    onChange={(e) => {
                      const nextMajor = e.target.value;
                      setClassForm((prev) => ({
                        ...prev,
                        majorId: nextMajor,
                        name: prev.name ? `${prev.grade} ${nextMajor} ${prev.name.split(' ').pop() || '1'}` : `${prev.grade} ${nextMajor} 1`,
                      }));
                    }}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-semibold"
                  >
                    {currentMajors.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.name.split('(')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Rombel / Kelas</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-bold bg-white dark:bg-slate-800"
                  placeholder="Contoh: X RPL 1, XI AKL 2"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Format standar sekolah: [Tingkat] [Kode Jurusan] [Nomor Rombel]
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Wali Kelas</label>
                <input
                  type="text"
                  value={classForm.waliKelas}
                  onChange={(e) => setClassForm({ ...classForm, waliKelas: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="Contoh: Danang Prasetyo, S.Kom."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Ruang Kelas / Laboratorium / Studio (Opsional)</label>
                <input
                  type="text"
                  value={classForm.room || ''}
                  onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="Contoh: Lab Rekayasa 1, R. Teori 204"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClassModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Tambahkan Rombel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH / EDIT JURUSAN                             */}
      {/* ======================================================== */}
      {majorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {editingMajor ? `Edit Jurusan: ${editingMajor.code}` : 'Tambah Program Keahlian Baru'}
                </h3>
              </div>
              <button
                onClick={() => setMajorModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMajor} className="p-5 space-y-3.5 text-xs text-slate-800 dark:text-slate-200">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Kode Singkat</label>
                  <input
                    type="text"
                    value={majorForm.code}
                    onChange={(e) => setMajorForm({ ...majorForm, code: e.target.value.toUpperCase() })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold uppercase bg-white dark:bg-slate-800"
                    placeholder="RPL"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Nama Program Keahlian</label>
                  <input
                    type="text"
                    value={majorForm.name}
                    onChange={(e) => setMajorForm({ ...majorForm, name: e.target.value })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 font-medium"
                    placeholder="Contoh: Pengembangan Perangkat Lunak & Gim"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Kepala Program Keahlian (Kaprodi)</label>
                <input
                  type="text"
                  value={majorForm.kaprodi}
                  onChange={(e) => setMajorForm({ ...majorForm, kaprodi: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  placeholder="Contoh: Ir. Budi Santoso, S.Kom., M.T."
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Warna Badge / Identitas Visual</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={majorForm.color}
                    onChange={(e) => setMajorForm({ ...majorForm, color: e.target.value })}
                    className="w-9 h-8 p-0.5 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={majorForm.color}
                    onChange={(e) => setMajorForm({ ...majorForm, color: e.target.value })}
                    className="flex-1 p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-[11px] bg-white dark:bg-slate-800"
                    placeholder="#2563EB"
                  />
                  <div
                    className="px-2.5 py-1 rounded text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: majorForm.color }}
                  >
                    Preview
                  </div>
                </div>
                {/* Preset colors */}
                <div className="flex items-center gap-1.5 mt-2">
                  {['#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777', '#EA580C', '#0891B2', '#4F46E5'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setMajorForm({ ...majorForm, color: c })}
                      className="w-5 h-5 rounded-full border border-white dark:border-slate-800 shadow-xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Fokus Keahlian / Deskripsi (Opsional)</label>
                <textarea
                  value={majorForm.description || ''}
                  onChange={(e) => setMajorForm({ ...majorForm, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-[11px]"
                  placeholder="Fokus keahlian, kompetensi dasar, dan bengkel/studio praktik..."
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMajorModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingMajor ? 'Simpan Perubahan' : 'Tambahkan Jurusan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPORT MASTER KELAS DARI EXCEL                    */}
      {/* ======================================================== */}
      {classImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Import Master Data Rombel / Kelas dari Excel</h3>
              </div>
              <button
                onClick={() => setClassImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] space-y-1">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    Format Kolom Template Excel Master Kelas:
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-300 font-mono">
                    Nama_Kelas | Tingkat | Kode_Jurusan | Wali_Kelas | Ruang_Kelas
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadTemplateClass}
                    className="font-semibold text-indigo-700 dark:text-indigo-400 underline hover:text-indigo-900 mt-1 inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh Template Contoh Kelas (.xlsx)</span>
                  </button>
                </div>
              </div>

              <div>
                <input
                  ref={classFileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadClass}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => classFileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {classImportFileName ? classImportFileName : 'Pilih File Excel / CSV Master Kelas'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Klik di sini untuk menelusuri file dari komputer
                  </span>
                </button>
              </div>

              {classImportError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{classImportError}</span>
                </div>
              )}

              {parsedImportClassRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Preview Data ({parsedImportClassRows.length} Kelas terbaca):
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importClassMode"
                          checked={importClassMode === 'append'}
                          onChange={() => setImportClassMode('append')}
                        />
                        <span>Tambahkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importClassMode"
                          checked={importClassMode === 'replace'}
                          onChange={() => setImportClassMode('replace')}
                        />
                        <span className="text-red-600 font-semibold">Ganti Seluruh Data Kelas</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">Nama Kelas</th>
                          <th className="py-1.5 px-2">Tingkat</th>
                          <th className="py-1.5 px-2">Jurusan</th>
                          <th className="py-1.5 px-2">Wali Kelas</th>
                          <th className="py-1.5 px-2">Ruang / Lab</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedImportClassRows.slice(0, 8).map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 px-2 font-bold">{r.name}</td>
                            <td className="py-1 px-2">{r.grade}</td>
                            <td className="py-1 px-2 font-mono">{r.majorId}</td>
                            <td className="py-1 px-2">{r.waliKelas}</td>
                            <td className="py-1 px-2">{r.room || '-'}</td>
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
                onClick={() => setClassImportModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedImportClassRows.length === 0}
                onClick={handleCommitImportClass}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simpan {parsedImportClassRows.length} Kelas ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPORT MASTER JURUSAN DARI EXCEL                  */}
      {/* ======================================================== */}
      {majorImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">Import Master Data Program Keahlian / Jurusan dari Excel</h3>
              </div>
              <button
                onClick={() => setMajorImportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-[11px] space-y-1">
                  <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                    Format Kolom Template Excel Master Jurusan:
                  </p>
                  <p className="text-indigo-800 dark:text-indigo-300 font-mono">
                    Kode_Jurusan | Nama_Jurusan | Kaprodi | Warna | Keterangan
                  </p>
                  <button
                    type="button"
                    onClick={handleDownloadTemplateMajor}
                    className="font-semibold text-indigo-700 dark:text-indigo-400 underline hover:text-indigo-900 mt-1 inline-flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh Template Contoh Jurusan (.xlsx)</span>
                  </button>
                </div>
              </div>

              <div>
                <input
                  ref={majorFileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadMajor}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => majorFileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {majorImportFileName ? majorImportFileName : 'Pilih File Excel / CSV Master Jurusan'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Klik di sini untuk menelusuri file dari komputer
                  </span>
                </button>
              </div>

              {majorImportError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{majorImportError}</span>
                </div>
              )}

              {parsedImportMajorRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Preview Data ({parsedImportMajorRows.length} Jurusan terbaca):
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMajorMode"
                          checked={importMajorMode === 'append'}
                          onChange={() => setImportMajorMode('append')}
                        />
                        <span>Tambahkan (Append)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMajorMode"
                          checked={importMajorMode === 'replace'}
                          onChange={() => setImportMajorMode('replace')}
                        />
                        <span className="text-red-600 font-semibold">Ganti Seluruh Data Jurusan</span>
                      </label>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto max-h-48">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">Kode</th>
                          <th className="py-1.5 px-2">Nama Program Keahlian</th>
                          <th className="py-1.5 px-2">Kaprodi</th>
                          <th className="py-1.5 px-2">Warna</th>
                          <th className="py-1.5 px-2">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedImportMajorRows.slice(0, 8).map((r, i) => (
                          <tr key={i}>
                            <td className="py-1 px-2 font-mono font-bold">{r.code}</td>
                            <td className="py-1 px-2 font-medium">{r.name}</td>
                            <td className="py-1 px-2">{r.kaprodi}</td>
                            <td className="py-1 px-2">
                              <span
                                className="inline-block w-4 h-4 rounded-full border border-slate-300"
                                style={{ backgroundColor: r.color }}
                              />
                            </td>
                            <td className="py-1 px-2 text-slate-400">{r.description || '-'}</td>
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
                onClick={() => setMajorImportModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedImportMajorRows.length === 0}
                onClick={handleCommitImportMajor}
                className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <FileCheck className="w-4 h-4" />
                <span>Simpan {parsedImportMajorRows.length} Jurusan ke Database</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: TAMBAH / EDIT AKUN PENGGUNA (ADMIN)             */}
      {/* ======================================================== */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm">
                  {editingAccount ? `Edit Akun: ${editingAccount.username}` : 'Buat Akun Pengguna Baru (Admin)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-3.5 text-xs text-slate-800 dark:text-slate-200 max-h-[80vh] overflow-y-auto">
              {/* Role Selection & Quick Auto-link */}
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-indigo-950 dark:text-indigo-200">
                    Pilihan Peran / Hak Akses:
                  </label>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
                    Menentukan fitur yang dapat diakses
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    accountForm.role === 'kesiswaan'
                      ? 'bg-blue-600 text-white border-blue-600 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="kesiswaan"
                      checked={accountForm.role === 'kesiswaan'}
                      onChange={() => setAccountForm({ ...accountForm, role: 'kesiswaan', roleTitle: 'Tim Kesiswaan / Staf Kedisiplinan' })}
                      className="hidden"
                    />
                    <span>TIM Kesiswaan</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    accountForm.role === 'kkk'
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="kkk"
                      checked={accountForm.role === 'kkk'}
                      onChange={() => setAccountForm({ ...accountForm, role: 'kkk', roleTitle: 'Ketua Konsentrasi Keahlian (Kaprodi)', majorId: currentMajors[0]?.id || 'RPL' })}
                      className="hidden"
                    />
                    <span>KKK (Kaprodi)</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    accountForm.role === 'bk'
                      ? 'bg-purple-600 text-white border-purple-600 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="bk"
                      checked={accountForm.role === 'bk'}
                      onChange={() => setAccountForm({ ...accountForm, role: 'bk', roleTitle: 'Guru Bimbingan Konseling (BK)' })}
                      className="hidden"
                    />
                    <span>GURU BK</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    accountForm.role === 'kepsek'
                      ? 'bg-amber-600 text-white border-amber-600 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="kepsek"
                      checked={accountForm.role === 'kepsek'}
                      onChange={() => setAccountForm({ ...accountForm, role: 'kepsek', roleTitle: 'Kepala Sekolah SMKN 1 Jember' })}
                      className="hidden"
                    />
                    <span>Kepala Sekolah</span>
                  </label>

                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    accountForm.role === 'piket'
                      ? 'bg-slate-700 text-white border-slate-700 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="piket"
                      checked={accountForm.role === 'piket'}
                      onChange={() => setAccountForm({ ...accountForm, role: 'piket', roleTitle: 'Petugas Piket Gerbang Utama' })}
                      className="hidden"
                    />
                    <span>Petugas Piket</span>
                  </label>
                </div>

                {/* Optional Quick Link from Master Data */}
                {accountForm.role === 'bk' && guruBK.length > 0 && (
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40">
                    <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                      Tautkan Otomatis dari Master Guru BK:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAutoLinkPersonel('bk', e.target.value);
                      }}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="">-- Pilih Guru BK untuk Mengisi Otomatis --</option>
                      {guruBK.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.nip}) — {g.roleTitle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {accountForm.role === 'kkk' && kkkList.length > 0 && (
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40">
                    <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                      Tautkan Otomatis dari Master KKK:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAutoLinkPersonel('kkk', e.target.value);
                      }}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="">-- Pilih KKK untuk Mengisi Otomatis --</option>
                      {kkkList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name} ({k.majorId}) — {k.majorName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {accountForm.role === 'kesiswaan' && timKesiswaan.length > 0 && (
                  <div className="pt-2 border-t border-indigo-200/60 dark:border-indigo-900/40">
                    <label className="block text-[11px] font-semibold text-indigo-900 dark:text-indigo-300 mb-1">
                      Tautkan Otomatis dari Master Tim Kesiswaan:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleAutoLinkPersonel('kesiswaan', e.target.value);
                      }}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-xs"
                    >
                      <option value="">-- Pilih Personel Tim Kesiswaan --</option>
                      {timKesiswaan.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} — {t.position}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    Username / ID Login <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountForm.username}
                    onChange={(e) => setAccountForm({ ...accountForm, username: e.target.value.toLowerCase().trim() })}
                    placeholder="Contoh: bk.agus / kkk.rpl / admin"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Gunakan huruf kecil, angka, atau titik (tanpa spasi)
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold">
                      Password Akun <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAccountForm({ ...accountForm, password: 'smesa' + Math.floor(100 + Math.random() * 900) })}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Acak Sandi
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showAccountFormPassword ? 'text' : 'password'}
                      value={accountForm.password}
                      onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
                      placeholder="Masukkan kata sandi..."
                      className="w-full p-2 pr-9 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountFormPassword(!showAccountFormPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showAccountFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Dibuat oleh admin, dapat diubah sewaktu-waktu
                  </span>
                </div>
              </div>

              {/* Nama Lengkap & NIP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    Nama Lengkap &amp; Gelar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    placeholder="Contoh: Drs. H. Sri Handoko, M.Pd."
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">NIP Pegawai</label>
                  <input
                    type="text"
                    value={accountForm.nip}
                    onChange={(e) => setAccountForm({ ...accountForm, nip: e.target.value })}
                    placeholder="Contoh: 19780410 200604 1 012"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Jabatan & Jurusan (if KKK) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    Jabatan / Penugasan Khusus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountForm.roleTitle}
                    onChange={(e) => setAccountForm({ ...accountForm, roleTitle: e.target.value })}
                    placeholder="Contoh: Koordinator Guru BK"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                {accountForm.role === 'kkk' ? (
                  <div>
                    <label className="block font-semibold mb-1">Jurusan / Konsentrasi Keahlian</label>
                    <select
                      value={accountForm.majorId || 'RPL'}
                      onChange={(e) => setAccountForm({ ...accountForm, majorId: e.target.value as MajorId })}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    >
                      {currentMajors.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.code} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold mb-1">Status Akun</label>
                    <select
                      value={accountForm.status}
                      onChange={(e) => setAccountForm({ ...accountForm, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                    >
                      <option value="Aktif">Aktif (Dapat Login)</option>
                      <option value="Nonaktif">Nonaktif (Akses Ditolak)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Email & No WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Email Sekolah / Kontak</label>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                    placeholder="nama@smkn1jember.sch.id"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">No WhatsApp</label>
                  <input
                    type="text"
                    value={accountForm.phone}
                    onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })}
                    placeholder="628123456789"
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Catatan / Keterangan Hak Akses */}
              <div>
                <label className="block font-semibold mb-1">Catatan Tambahan Hak Akses</label>
                <input
                  type="text"
                  value={accountForm.notes || ''}
                  onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
                  placeholder="Contoh: Akun pendamping siswa kelas X dan penanganan temu ortu"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAccountModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAccount ? 'Simpan Perubahan Akun' : 'Daftarkan Akun Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 8: GANTI / RESET PASSWORD AKUN                     */}
      {/* ======================================================== */}
      {resetPasswordModalOpen && accountForPasswordReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm">Ganti Kata Sandi Akun</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="p-5 space-y-4 text-xs text-slate-800 dark:text-slate-200">
              {/* Account Card Profile */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Profil Akun Terpilih:</div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  {accountForPasswordReset.name}
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  <span>Username: <strong>{accountForPasswordReset.username}</strong></span>
                  <span>•</span>
                  <span>Peran: <strong className="uppercase text-indigo-600 dark:text-indigo-400">{accountForPasswordReset.role}</strong></span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold">
                    Kata Sandi Baru <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const gen = 'smesa' + Math.floor(100 + Math.random() * 900);
                      setNewPasswordInput(gen);
                      setConfirmPasswordInput(gen);
                    }}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Acak Sandi Otomatis
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Masukkan kata sandi baru..."
                    className="w-full p-2 pr-9 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Ulangi kata sandi baru..."
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono bg-white dark:bg-slate-800"
                />
              </div>

              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-[11px] text-amber-900 dark:text-amber-300">
                Setelah kata sandi disimpan oleh admin, pengguna dapat langsung menggunakannya pada halaman Akses Masuk login.
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Simpan Kata Sandi Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
