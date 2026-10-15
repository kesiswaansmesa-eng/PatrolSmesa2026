/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LateRecord, 
  Student, 
  CounselingEntry, 
  AppRole,
  UserSession,
  GuruBK,
  KKK,
  TimKesiswaan,
  Major,
  SchoolClass,
  UserAccount
} from './types/patrol';
import { 
  getStoredRecords, 
  saveStoredRecords, 
  getStoredStudents, 
  saveStoredStudents, 
  getStoredCounseling, 
  saveStoredCounseling, 
  getStoredRole, 
  saveStoredRole, 
  getStoredSession,
  saveStoredSession,
  getStoredSettings,
  saveStoredSettings,
  getStoredTheme,
  saveStoredTheme,
  ThemeMode,
  resetAllData,
  getStoredGuruBK,
  saveStoredGuruBK,
  getStoredKKK,
  saveStoredKKK,
  getStoredTimKesiswaan,
  saveStoredTimKesiswaan,
  getStoredMajors,
  saveStoredMajors,
  getStoredClasses,
  saveStoredClasses,
  getStoredAccounts,
  saveStoredAccounts,
  resetViolationsOnly,
  wipeAllSystemData,
  exportSystemBackup,
  restoreSystemBackup,
  DatabaseProvider,
  getStoredBackendProvider,
  saveStoredBackendProvider
} from './utils/storage';
import { 
  seedInitialDataIfEmpty,
  initAndBootstrapCloudData,
  startRealtimeSync,
  saveRecordCloud,
  saveRecordsBatchCloud,
  deleteRecordCloud,
  saveStudentsBatchCloud,
  deleteStudentCloud,
  saveCounselingCloud,
  saveCounselingBatchCloud,
  saveAccountCloud,
  saveAccountsBatchCloud,
  deleteAccountCloud,
  saveMasterGuruBKCloud,
  saveGuruBKBatchCloud,
  deleteMasterGuruBKCloud,
  saveMasterKKKCloud,
  saveKKKBatchCloud,
  deleteMasterKKKCloud,
  saveMasterTimKesiswaanCloud,
  saveTimKesiswaanBatchCloud,
  deleteMasterTimKesiswaanCloud,
  saveMasterMajorCloud,
  saveMajorsBatchCloud,
  deleteMasterMajorCloud,
  saveMasterClassCloud,
  saveClassesBatchCloud,
  deleteMasterClassCloud,
  saveSettingsCloud,
  restoreFullDatabaseToCloud,
  resetViolationsCloud,
  wipeAllCloudData,
  forceResetToSampleDataCloud
} from './utils/firebaseSync';
import {
  saveRecordSupabase,
  deleteRecordSupabase,
  saveRecordsBatchSupabase,
  saveStudentsBatchSupabase,
  deleteStudentSupabase,
  saveClassesBatchSupabase,
  deleteClassSupabase,
  saveMajorsBatchSupabase,
  deleteMajorSupabase,
  saveGuruBKBatchSupabase,
  deleteGuruBKSupabase,
  saveKKKBatchSupabase,
  deleteKKKSupabase,
  saveTimKesiswaanBatchSupabase,
  deleteTimKesiswaanSupabase,
  saveAccountsBatchSupabase,
  deleteAccountSupabase,
  saveSettingsSupabase,
  saveCounselingSupabase,
  deleteCounselingSupabase,
  initAndBootstrapSupabaseData,
  startSupabaseRealtimeSync,
  forceResetToSampleDataSupabase,
  resetViolationsSupabase
} from './utils/supabaseSync';
import { checkSupabaseTablesStatus, getSupabaseConfig } from './lib/supabase';
import { testConnection } from './lib/firebase';
import { AppSettings, DEFAULT_SETTINGS } from './types/patrol';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PencatatanView } from './components/PencatatanView';
import { AnalyticsView } from './components/AnalyticsView';
import { PembinaanView } from './components/PembinaanView';
import { LaporanView } from './components/LaporanView';
import { MasterDataView } from './components/MasterDataView';
import { SettingsView } from './components/SettingsView';
import { GateLoggerModal } from './components/GateLoggerModal';
import { PrintSuratModal } from './components/PrintSuratModal';
import { SchoolLogo } from './components/SchoolLogo';
import { RotateCcw, ShieldCheck, Sparkles, LogOut } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [records, setRecords] = useState<LateRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [counselingEntries, setCounselingEntries] = useState<CounselingEntry[]>([]);
  const [guruBK, setGuruBK] = useState<GuruBK[]>([]);
  const [kkkList, setKKKList] = useState<KKK[]>([]);
  const [timKesiswaan, setTimKesiswaan] = useState<TimKesiswaan[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [schoolClasses, setSchoolClasses] = useState<SchoolClass[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [activeRole, setActiveRole] = useState<AppRole>('kesiswaan');
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>('light');

  // Filters for KKK & Wali Kelas roles
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<string>('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');

  // Backend database provider: defaults to 'supabase' as requested
  const [backendProvider, setBackendProvider] = useState<DatabaseProvider>(getStoredBackendProvider());
  const [supabaseTablesPending, setSupabaseTablesPending] = useState(false);

  // Modals state
  const [quickRecordModalOpen, setQuickRecordModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printTargetStudent, setPrintTargetStudent] = useState<Student | null>(null);
  const [printTargetRecord, setPrintTargetRecord] = useState<LateRecord | null>(null);
  const [printMode, setPrintMode] = useState<'panggilan' | 'pernyataan'>('panggilan');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data, settings, session, and theme from local storage
  useEffect(() => {
    setRecords(getStoredRecords());
    setStudents(getStoredStudents());
    setCounselingEntries(getStoredCounseling());
    setGuruBK(getStoredGuruBK());
    setKKKList(getStoredKKK());
    setTimKesiswaan(getStoredTimKesiswaan());
    setMajors(getStoredMajors());
    setSchoolClasses(getStoredClasses());
    setAccounts(getStoredAccounts());
    setSettings(getStoredSettings());

    const initialTheme = getStoredTheme();
    setTheme(initialTheme);
    saveStoredTheme(initialTheme);

    const savedSession = getStoredSession();
    if (savedSession) {
      setUserSession(savedSession);
      setActiveRole(savedSession.role);
    } else {
      setUserSession(null);
      setActiveRole(getStoredRole());
    }

    // Check if Supabase tables exist
    checkSupabaseTablesStatus().then((status) => {
      setSupabaseTablesPending(!status.allExist);
    }).catch(console.warn);
  }, []);

  // Realtime Sync Effect based on backendProvider ('supabase' | 'firebase')
  useEffect(() => {
    if (backendProvider === 'supabase') {
      // Bootstrap Supabase if empty
      initAndBootstrapSupabaseData({
        records: getStoredRecords(),
        students: getStoredStudents(),
        counseling: getStoredCounseling(),
        guruBK: getStoredGuruBK(),
        kkk: getStoredKKK(),
        timKesiswaan: getStoredTimKesiswaan(),
        majors: getStoredMajors(),
        classes: getStoredClasses(),
        accounts: getStoredAccounts(),
        settings: getStoredSettings(),
      }).then((res) => {
        if (res === 'tables_missing') {
          setSupabaseTablesPending(true);
        } else if (res === 'seeded_from_local') {
          setSupabaseTablesPending(false);
          triggerToast('Data SMKN 1 Jember berhasil diunggah ke database Supabase (PatrolSmesa)!');
        } else if (res === 'already_seeded') {
          setSupabaseTablesPending(false);
        }
      }).catch((err) => {
        console.warn('Initial Supabase connection notice:', err);
      });

      // Start Supabase Realtime synchronization
      const stopSync = startSupabaseRealtimeSync({
        onRecordsChange: (cloudRecords) => {
          setRecords(cloudRecords);
          saveStoredRecords(cloudRecords);
        },
        onStudentsChange: (cloudStudents) => {
          setStudents(cloudStudents);
          saveStoredStudents(cloudStudents);
        },
        onCounselingChange: (cloudCounseling) => {
          setCounselingEntries(cloudCounseling);
          saveStoredCounseling(cloudCounseling);
        },
        onGuruBKChange: (cloudGuru) => {
          setGuruBK(cloudGuru);
          saveStoredGuruBK(cloudGuru);
        },
        onKKKChange: (cloudKKK) => {
          setKKKList(cloudKKK);
          saveStoredKKK(cloudKKK);
        },
        onTimKesiswaanChange: (cloudTim) => {
          setTimKesiswaan(cloudTim);
          saveStoredTimKesiswaan(cloudTim);
        },
        onMajorsChange: (cloudMajors) => {
          setMajors(cloudMajors);
          saveStoredMajors(cloudMajors);
        },
        onClassesChange: (cloudClasses) => {
          setSchoolClasses(cloudClasses);
          saveStoredClasses(cloudClasses);
        },
        onAccountsChange: (cloudAccounts) => {
          setAccounts(cloudAccounts);
          saveStoredAccounts(cloudAccounts);
        },
        onSettingsChange: (cloudSettings) => {
          setSettings(cloudSettings);
          saveStoredSettings(cloudSettings);
        },
      });

      return () => {
        stopSync();
      };
    } else if (backendProvider === 'firebase') {
      // Test cloud database connection & bootstrap Firebase if empty
      initAndBootstrapCloudData({
        records: getStoredRecords(),
        students: getStoredStudents(),
        counseling: getStoredCounseling(),
        guruBK: getStoredGuruBK(),
        kkk: getStoredKKK(),
        timKesiswaan: getStoredTimKesiswaan(),
        majors: getStoredMajors(),
        classes: getStoredClasses(),
        accounts: getStoredAccounts(),
        settings: getStoredSettings(),
      }).then((res) => {
        if (res === 'seeded_from_local') {
          triggerToast('Data dari browser ini otomatis diunggah & tersimpan permanen di Firebase!');
        }
      }).catch((err) => {
        console.warn('Initial Firebase connection notice:', err);
      });

      // Start Realtime synchronization with Cloud Firestore
      const stopSync = startRealtimeSync({
        onRecordsChange: (cloudRecords) => {
          setRecords(cloudRecords);
          saveStoredRecords(cloudRecords);
        },
        onStudentsChange: (cloudStudents) => {
          setStudents(cloudStudents);
          saveStoredStudents(cloudStudents);
        },
        onCounselingChange: (cloudCounseling) => {
          setCounselingEntries(cloudCounseling);
          saveStoredCounseling(cloudCounseling);
        },
        onGuruBKChange: (cloudGuru) => {
          setGuruBK(cloudGuru);
          saveStoredGuruBK(cloudGuru);
        },
        onKKKChange: (cloudKKK) => {
          setKKKList(cloudKKK);
          saveStoredKKK(cloudKKK);
        },
        onTimKesiswaanChange: (cloudTim) => {
          setTimKesiswaan(cloudTim);
          saveStoredTimKesiswaan(cloudTim);
        },
        onMajorsChange: (cloudMajors) => {
          setMajors(cloudMajors);
          saveStoredMajors(cloudMajors);
        },
        onClassesChange: (cloudClasses) => {
          setSchoolClasses(cloudClasses);
          saveStoredClasses(cloudClasses);
        },
        onAccountsChange: (cloudAccounts) => {
          setAccounts(cloudAccounts);
          saveStoredAccounts(cloudAccounts);
        },
        onSettingsChange: (cloudSettings) => {
          setSettings(cloudSettings);
          saveStoredSettings(cloudSettings);
        },
      });

      return () => {
        stopSync();
      };
    }
  }, [backendProvider]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
    triggerToast(nextTheme === 'dark' ? 'Mode Gelap (Dark Mode) aktif' : 'Mode Terang (Light Mode) aktif');
  };

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    saveStoredTheme(newTheme);
    triggerToast(newTheme === 'dark' ? 'Mode Gelap (Dark Mode) aktif' : 'Mode Terang (Light Mode) aktif');
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setActiveRole(session.role);
    saveStoredSession(session);

    if (session.role === 'bk') {
      setCurrentTab('pembinaan');
    } else if (session.role === 'piket') {
      setCurrentTab('pencatatan');
      setQuickRecordModalOpen(true);
    } else {
      setCurrentTab('dashboard');
    }

    triggerToast(`Berhasil masuk sebagai ${session.title} (${session.name})`);
  };

  const handleLogout = () => {
    saveStoredSession(null);
    setUserSession(null);
    triggerToast('Anda telah keluar dari sistem.');
  };

  const handleRoleChange = (role: AppRole) => {
    setActiveRole(role);
    saveStoredRole(role);

    if (userSession) {
      const updatedSession = { ...userSession, role };
      setUserSession(updatedSession);
      saveStoredSession(updatedSession);
    }

    // Role restriction: Master Data dan Pengaturan hanya ada di akun kesiswaan / admin
    if (role !== 'kesiswaan' && (currentTab === 'master' || currentTab === 'pengaturan')) {
      setCurrentTab('dashboard');
    }

    // If role is piket, open quick logger or switch to pencatatan
    if (role === 'piket') {
      setCurrentTab('pencatatan');
      setQuickRecordModalOpen(true);
    } else if (role === 'bk') {
      setCurrentTab('pembinaan');
    }
    triggerToast(`Beralih ke mode: ${role.toUpperCase()}`);
  };

  const handleSwitchBackendProvider = (newProvider: DatabaseProvider) => {
    setBackendProvider(newProvider);
    saveStoredBackendProvider(newProvider);
    if (newProvider === 'supabase') {
      checkSupabaseTablesStatus().then((res) => {
        setSupabaseTablesPending(!res.allExist);
      });
    }
  };

  // Add new late record
  const handleSaveRecord = (recordData: Omit<LateRecord, 'id' | 'createdAt'>) => {
    const newRecord: LateRecord = {
      ...recordData,
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    saveStoredRecords(updated);

    if (backendProvider === 'supabase') {
      saveRecordSupabase(newRecord).then(() => {
        triggerToast(`Pelanggaran ${recordData.studentName} tersimpan di Supabase.`);
      }).catch((err) => {
        console.warn('Supabase save warning (cached locally):', err);
      });
    } else if (backendProvider === 'firebase') {
      saveRecordCloud(newRecord).then(() => {
        triggerToast(`Pelanggaran ${recordData.studentName} tersimpan di Firebase.`);
      }).catch((err) => {
        console.warn('Cloud save warning (cached locally):', err);
      });
    }
    triggerToast(`Data keterlambatan ${recordData.studentName} berhasil dicatat.`);
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveStoredRecords(updated);
    if (backendProvider === 'supabase') {
      deleteRecordSupabase(id).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      deleteRecordCloud(id).catch(console.warn);
    }
    triggerToast('Catatan keterlambatan berhasil dihapus.');
  };

  // Import batch records
  const handleImportRecords = (newRecords: LateRecord[], mode: 'append' | 'replace' = 'append') => {
    let updated: LateRecord[] = [];
    if (mode === 'replace') {
      updated = newRecords;
    } else {
      const existingIds = new Set(records.map((r) => r.id));
      const filtered = newRecords.filter((r) => !existingIds.has(r.id));
      updated = [...filtered, ...records];
    }
    setRecords(updated);
    saveStoredRecords(updated);

    if (backendProvider === 'supabase') {
      saveRecordsBatchSupabase(newRecords).then(() => {
        triggerToast(`Berhasil merekam ${newRecords.length} data pelanggaran langsung ke database Supabase!`);
      }).catch((err) => {
        console.warn('Batch Supabase save records warning:', err);
        triggerToast(`Data tersimpan lokal, proses sinkronisasi database Supabase sedang berjalan.`);
      });
    } else if (backendProvider === 'firebase') {
      saveRecordsBatchCloud(newRecords).then(() => {
        triggerToast(`Berhasil merekam ${newRecords.length} data pelanggaran langsung ke database Firebase!`);
      }).catch((err) => {
        console.warn('Batch cloud save records warning:', err);
        triggerToast(`Data tersimpan lokal, proses sinkronisasi database Firebase sedang berjalan.`);
      });
    }
  };

  // Update counseling status
  const handleUpdateStatus = (
    id: string,
    status: 'Belum Dibina' | 'Sedang Dibina' | 'Selesai Pembinaan'
  ) => {
    const updated = records.map((r) =>
      r.id === id ? { ...r, counselingStatus: status } : r
    );
    setRecords(updated);
    saveStoredRecords(updated);
    const target = updated.find((r) => r.id === id);
    if (target) {
      if (backendProvider === 'supabase') {
        saveRecordSupabase(target).catch(console.warn);
      } else if (backendProvider === 'firebase') {
        saveRecordCloud(target).catch(console.warn);
      }
    }
    triggerToast(`Status pembinaan diperbarui: ${status}`);
  };

  // Add counseling entry
  const handleAddCounselingEntry = (entryData: Omit<CounselingEntry, 'id'>) => {
    const newEntry: CounselingEntry = {
      ...entryData,
      id: `csl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newEntry, ...counselingEntries];
    setCounselingEntries(updated);
    saveStoredCounseling(updated);

    if (backendProvider === 'supabase') {
      saveCounselingSupabase(newEntry).then(() => {
        triggerToast(`Sesi konseling ${entryData.studentName} tersimpan di Supabase.`);
      }).catch((err) => {
        console.warn('Supabase counseling save warning:', err);
      });
    } else if (backendProvider === 'firebase') {
      saveCounselingCloud(newEntry).then(() => {
        triggerToast(`Sesi konseling ${entryData.studentName} tersimpan di Firebase.`);
      }).catch((err) => {
        console.warn('Cloud counseling save warning:', err);
      });
    }
    triggerToast(`Sesi konseling untuk ${entryData.studentName} berhasil dicatat.`);
  };

  // Print Call Letter triggers
  const handlePrintCallLetter = (record: LateRecord, student: Student) => {
    setPrintTargetRecord(record);
    setPrintTargetStudent(student);
    setPrintMode('panggilan');
    setPrintModalOpen(true);
  };

  const handlePrintCommitmentLetter = (student: Student, count: number) => {
    setPrintTargetStudent(student);
    setPrintTargetRecord(null);
    setPrintMode('pernyataan');
    setPrintModalOpen(true);
  };

  // Reset demo data to official SMKN 1 Jember sample database
  const handleResetSampleData = async () => {
    if (
      confirm(
        'Kembalikan seluruh data ke contoh awal SMKN 1 Jember? Seluruh data siswa, rombel kelas, guru BK, dan riwayat pelanggaran contoh akan dimuat ulang.'
      )
    ) {
      try {
        resetAllData();
        saveStoredSettings(DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
        setRecords(getStoredRecords());
        setStudents(getStoredStudents());
        setCounselingEntries(getStoredCounseling());
        setGuruBK(getStoredGuruBK());
        setKKKList(getStoredKKK());
        setTimKesiswaan(getStoredTimKesiswaan());
        setMajors(getStoredMajors());
        setSchoolClasses(getStoredClasses());
        setAccounts(getStoredAccounts());
        
        if (backendProvider === 'supabase') {
          triggerToast('Sedang memuat ulang data contoh SMKN 1 Jember ke Supabase...');
          const res = await forceResetToSampleDataSupabase();
          if (res.success) {
            setSupabaseTablesPending(false);
            triggerToast('✓ Berhasil! Data contoh SMKN 1 Jember telah dimuat ulang ke database Supabase PatrolSmesa.');
          } else {
            triggerToast(`Supabase: ${res.message}`);
          }
        } else if (backendProvider === 'firebase') {
          triggerToast('Sedang memuat ulang data contoh SMKN 1 Jember ke Cloud Firebase...');
          await forceResetToSampleDataCloud();
          triggerToast('✓ Berhasil! Data contoh SMKN 1 Jember telah dimuat ulang ke database Firebase.');
        } else {
          triggerToast('✓ Data contoh SMKN 1 Jember berhasil dimuat ulang ke memori lokal.');
        }
      } catch (e) {
        console.warn('Sync cloud sample data notice:', e);
        triggerToast('Data contoh telah direset ke lokal.');
      }
    }
  };

  // Update master handlers
  const handleUpdateStudents = (newStudents: Student[]) => {
    const newIds = new Set(newStudents.map((s) => s.id));
    const removedStudents = students.filter((s) => !newIds.has(s.id));
    setStudents(newStudents);
    saveStoredStudents(newStudents);

    if (backendProvider === 'supabase') {
      removedStudents.forEach((s) => deleteStudentSupabase(s.id).catch(console.warn));
      saveStudentsBatchSupabase(newStudents).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      removedStudents.forEach((s) => deleteStudentCloud(s.id).catch(console.warn));
      saveStudentsBatchCloud(newStudents).catch(console.warn);
    }
  };

  const handleUpdateMajors = (newList: Major[]) => {
    const newIds = new Set(newList.map((m) => m.id));
    const removed = majors.filter((m) => !newIds.has(m.id));
    setMajors(newList);
    saveStoredMajors(newList);

    if (backendProvider === 'supabase') {
      removed.forEach((m) => deleteMajorSupabase(m.id).catch(console.warn));
      saveMajorsBatchSupabase(newList).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      removed.forEach((m) => deleteMasterMajorCloud(m.id).catch(console.warn));
      saveMajorsBatchCloud(newList).catch(console.warn);
    }
  };

  const handleUpdateClasses = (newList: SchoolClass[]) => {
    const newIds = new Set(newList.map((c) => c.id));
    const removed = schoolClasses.filter((c) => !newIds.has(c.id));
    setSchoolClasses(newList);
    saveStoredClasses(newList);

    if (backendProvider === 'supabase') {
      removed.forEach((c) => deleteClassSupabase(c.id).catch(console.warn));
      saveClassesBatchSupabase(newList).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      removed.forEach((c) => deleteMasterClassCloud(c.id).catch(console.warn));
      saveClassesBatchCloud(newList).catch(console.warn);
    }
  };

  const handleUpdateGuruBK = (newList: GuruBK[]) => {
    const newIds = new Set(newList.map((g) => g.id));
    const removed = guruBK.filter((g) => !newIds.has(g.id));
    setGuruBK(newList);
    saveStoredGuruBK(newList);

    if (backendProvider === 'supabase') {
      removed.forEach((g) => deleteGuruBKSupabase(g.id).catch(console.warn));
      saveGuruBKBatchSupabase(newList).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      removed.forEach((g) => deleteMasterGuruBKCloud(g.id).catch(console.warn));
      saveGuruBKBatchCloud(newList).catch(console.warn);
    }
  };

  const handleUpdateKKK = (newList: KKK[]) => {
    const newIds = new Set(newList.map((k) => k.id));
    const removed = kkkList.filter((k) => !newIds.has(k.id));
    setKKKList(newList);
    saveStoredKKK(newList);

    if (backendProvider === 'supabase') {
      removed.forEach((k) => deleteKKKSupabase(k.id).catch(console.warn));
      saveKKKBatchSupabase(newList).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      removed.forEach((k) => deleteMasterKKKCloud(k.id).catch(console.warn));
      saveKKKBatchCloud(newList).catch(console.warn);
    }
  };

  const handleUpdateTimKesiswaan = (newList: TimKesiswaan[]) => {
    const newIds = new Set(newList.map((t) => t.id));
    const removed = timKesiswaan.filter((t) => !newIds.has(t.id));
    setTimKesiswaan(newList);
    saveStoredTimKesiswaan(newList);

    if (backendProvider === 'supabase') {
      removed.forEach((t) => deleteTimKesiswaanSupabase(t.id).catch(console.warn));
      saveTimKesiswaanBatchSupabase(newList).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      removed.forEach((t) => deleteMasterTimKesiswaanCloud(t.id).catch(console.warn));
      saveTimKesiswaanBatchCloud(newList).catch(console.warn);
    }
  };

  const handleUpdateAccounts = (newList: UserAccount[]) => {
    const newIds = new Set(newList.map((a) => a.id));
    const removed = accounts.filter((a) => !newIds.has(a.id));
    setAccounts(newList);
    saveStoredAccounts(newList);

    if (backendProvider === 'supabase') {
      removed.forEach((a) => deleteAccountSupabase(a.id).catch(console.warn));
      saveAccountsBatchSupabase(newList).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      removed.forEach((a) => deleteAccountCloud(a.id).catch(console.warn));
      saveAccountsBatchCloud(newList).catch(console.warn);
    }
  };

  // Reset Violations only
  const handleResetViolations = () => {
    resetViolationsOnly();
    setRecords([]);
    setCounselingEntries([]);
    if (backendProvider === 'supabase') {
      resetViolationsSupabase().catch(console.warn);
    } else if (backendProvider === 'firebase') {
      resetViolationsCloud().catch(console.warn);
    }
    triggerToast('Seluruh riwayat pelanggaran dan pembinaan siswa berhasil direset.');
  };

  // Wipe All Data
  const handleWipeAllData = () => {
    wipeAllSystemData();
    setRecords([]);
    setCounselingEntries([]);
    setStudents([]);
    setSchoolClasses([]);
    if (backendProvider === 'supabase') {
      resetViolationsSupabase().catch(console.warn);
    } else if (backendProvider === 'firebase') {
      wipeAllCloudData().catch(console.warn);
    }
    triggerToast('Basis data operasional berhasil dihapus bersih.');
  };

  // Backup Data (JSON)
  const handleBackupData = () => {
    exportSystemBackup();
    triggerToast('File backup data (JSON) berhasil diunduh ke PC.');
  };

  // Restore Data (JSON)
  const handleRestoreData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const ok = restoreSystemBackup(parsed);
        if (ok) {
          setRecords(getStoredRecords());
          setStudents(getStoredStudents());
          setCounselingEntries(getStoredCounseling());
          setGuruBK(getStoredGuruBK());
          setKKKList(getStoredKKK());
          setTimKesiswaan(getStoredTimKesiswaan());
          setMajors(getStoredMajors());
          setSchoolClasses(getStoredClasses());
          setAccounts(getStoredAccounts());
          setSettings(getStoredSettings());

          if (backendProvider === 'supabase') {
            triggerToast('Merekam seluruh data pemulihan ke database Supabase...');
            try {
              if (parsed.majors) await saveMajorsBatchSupabase(parsed.majors);
              if (parsed.classes) await saveClassesBatchSupabase(parsed.classes);
              if (parsed.students) await saveStudentsBatchSupabase(parsed.students);
              if (parsed.records) await saveRecordsBatchSupabase(parsed.records);
              triggerToast('Pemulihan sukses: Seluruh data otomatis terekam di Supabase!');
            } catch (supaErr) {
              console.error('Kendala Supabase restore:', supaErr);
              triggerToast('Data tersimpan lokal, proses sinkronisasi Supabase tertunda.');
            }
          } else if (backendProvider === 'firebase') {
            triggerToast('Merekam seluruh data pemulihan ke database Firebase...');
            try {
              await restoreFullDatabaseToCloud(parsed);
              triggerToast('Pemulihan sukses: Seluruh data otomatis terekam permanen di Firebase!');
            } catch (cloudErr) {
              console.error('Kendala sinkronisasi Firebase saat restore:', cloudErr);
              triggerToast('Data tersimpan lokal, proses sinkronisasi database Firebase sedang berjalan.');
            }
          }
        } else {
          triggerToast('Gagal memulihkan: Format backup tidak dikenali.');
        }
      } catch (err) {
        triggerToast('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Sinkronisasi manual seluruh data lokal ke Database Cloud
  const handleSyncAllToCloud = async () => {
    if (backendProvider === 'supabase') {
      triggerToast('Menyinkronkan seluruh master data & riwayat ke Supabase PatrolSmesa...');
      try {
        await saveMajorsBatchSupabase(majors);
        await saveClassesBatchSupabase(schoolClasses);
        await saveStudentsBatchSupabase(students);
        await saveRecordsBatchSupabase(records);
        await saveGuruBKBatchSupabase(guruBK);
        await saveKKKBatchSupabase(kkkList);
        await saveTimKesiswaanBatchSupabase(timKesiswaan);
        await saveAccountsBatchSupabase(accounts);
        await saveSettingsSupabase(settings);
        setSupabaseTablesPending(false);
        triggerToast('✓ Berhasil menyinkronkan seluruh data ke database Supabase PatrolSmesa!');
      } catch (err: any) {
        console.error('Gagal sinkronisasi Supabase:', err);
        triggerToast('Gagal merekam ke Supabase: ' + (err?.message || 'Periksa status tabel'));
      }
    } else {
      triggerToast('Merekam seluruh data lokal ke database Firebase...');
      try {
        await restoreFullDatabaseToCloud({
          records,
          students,
          counseling: counselingEntries,
          guruBK,
          kkk: kkkList,
          timKesiswaan,
          majors,
          classes: schoolClasses,
          accounts,
          settings,
        });
        triggerToast('Seluruh data transaksi & master berhasil terekam ke database Firebase!');
      } catch (err) {
        console.error('Gagal sinkronisasi data ke Firebase:', err);
        triggerToast('Gagal merekam ke Firebase. Periksa koneksi internet/status database.');
      }
    }
  };

  // Save settings handler
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    if (backendProvider === 'supabase') {
      saveSettingsSupabase(newSettings).catch(console.warn);
    } else if (backendProvider === 'firebase') {
      saveSettingsCloud(newSettings).catch(console.warn);
    }
  };

  // If user is not logged in, show the official Login Page
  if (!userSession) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        accounts={accounts}
        settings={settings} 
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  // Extract unique classes for Wali Kelas filter dropdown
  const availableClasses = schoolClasses.length > 0
    ? Array.from(new Set(schoolClasses.map((c) => c.name))).sort()
    : Array.from(new Set(students.map((s) => s.className))).sort();

  // Calculate student violation count for print modal
  const violationCountForModal = printTargetStudent
    ? records.filter((r) => r.studentId === printTargetStudent.id).length
    : 3;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 dark:bg-slate-800/95 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 border border-slate-700 dark:border-slate-600 animate-in slide-in-from-bottom-2 duration-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeRole={activeRole}
        onChangeRole={handleRoleChange}
        onOpenQuickRecord={() => setQuickRecordModalOpen(true)}
        userSession={userSession}
        onLogout={handleLogout}
        settings={settings}
        majors={majors}
        selectedMajorFilter={selectedMajorFilter}
        onChangeMajorFilter={setSelectedMajorFilter}
        selectedClassFilter={selectedClassFilter}
        onChangeClassFilter={setSelectedClassFilter}
        availableClasses={availableClasses}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSyncAllToCloud={handleSyncAllToCloud}
        backendProvider={backendProvider}
      />

      {/* Supabase PostgreSQL Tables Pending Creation Warning Banner */}
      {backendProvider === 'supabase' && supabaseTablesPending && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-white/20 rounded-lg text-sm shrink-0">⚠️</span>
            <div>
              <span className="font-bold">Proyek Supabase PatrolSmesa Terhubung:</span>
              <span className="ml-1 opacity-90">
                10 Tabel database PostgreSQL belum dibuat di Supabase Anda. Salin Skema SQL lalu jalankan di Supabase SQL Editor agar seluruh tabel aktif seketika!
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentTab('pengaturan')}
              className="px-3 py-1 bg-white text-amber-900 font-bold rounded-lg hover:bg-amber-50 transition-colors shadow-xs cursor-pointer text-xs"
            >
              Buka Skema &amp; Pengaturan
            </button>
            <a
              href="https://supabase.com/dashboard/project/dxdtifpfqisjdqykyymz/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-amber-950/60 hover:bg-amber-950 text-white font-medium rounded-lg transition-colors border border-amber-400/40 text-xs"
            >
              SQL Editor Supabase ↗
            </a>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            records={records}
            students={students}
            majors={majors}
            activeRole={activeRole}
            onOpenQuickRecord={() => setQuickRecordModalOpen(true)}
            onNavigateToTab={setCurrentTab}
            onPrintCallLetter={handlePrintCallLetter}
            selectedMajorFilter={selectedMajorFilter}
            selectedClassFilter={selectedClassFilter}
          />
        )}

        {currentTab === 'pencatatan' && (
          <PencatatanView
            records={records}
            students={students}
            majors={majors}
            classes={schoolClasses}
            onOpenQuickRecord={() => setQuickRecordModalOpen(true)}
            onDeleteRecord={handleDeleteRecord}
            onUpdateStatus={handleUpdateStatus}
            onPrintCallLetter={handlePrintCallLetter}
            onImportRecords={handleImportRecords}
          />
        )}

        {currentTab === 'analisis' && (
          <AnalyticsView records={records} students={students} majors={majors} />
        )}

        {currentTab === 'pembinaan' && (
          <PembinaanView
            records={records}
            students={students}
            counselingEntries={counselingEntries}
            guruBK={guruBK}
            timKesiswaan={timKesiswaan}
            classes={schoolClasses}
            onAddCounselingEntry={handleAddCounselingEntry}
            onPrintCallLetter={handlePrintCallLetter}
            onPrintCommitmentLetter={handlePrintCommitmentLetter}
          />
        )}

        {currentTab === 'laporan' && (
          <LaporanView records={records} students={students} majors={majors} settings={settings} />
        )}

        {currentTab === 'master' && (
          activeRole === 'kesiswaan' ? (
            <MasterDataView
              students={students}
              onUpdateStudents={handleUpdateStudents}
              majors={majors}
              onUpdateMajors={handleUpdateMajors}
              classes={schoolClasses}
              onUpdateClasses={handleUpdateClasses}
              guruBK={guruBK}
              onUpdateGuruBK={handleUpdateGuruBK}
              kkkList={kkkList}
              onUpdateKKK={handleUpdateKKK}
              timKesiswaan={timKesiswaan}
              onUpdateTimKesiswaan={handleUpdateTimKesiswaan}
              accounts={accounts}
              onUpdateAccounts={handleUpdateAccounts}
              onResetViolations={handleResetViolations}
              onWipeAllData={handleWipeAllData}
              onResetSampleData={handleResetSampleData}
              onBackupData={handleBackupData}
              onRestoreData={handleRestoreData}
              onToast={triggerToast}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-lg mx-auto text-center shadow-xs transition-colors my-12">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Akses Terbatas: Khusus Tim Kesiswaan / Admin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Menu Master Data Siswa, Kelas &amp; Jurusan, Guru BK, KKK &amp; Tim Kesiswaan hanya dapat dikelola oleh akun Tim Kesiswaan / Administrator demi menjaga keakuratan dan integritas basis data siswa {settings.schoolName}.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  onClick={() => handleRoleChange('kesiswaan')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Beralih ke Tim Kesiswaan
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'pengaturan' && (
          activeRole === 'kesiswaan' ? (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onToast={triggerToast}
              theme={theme}
              onSelectTheme={handleSelectTheme}
              onResetViolations={handleResetViolations}
              onWipeAllData={handleWipeAllData}
              onResetSampleData={handleResetSampleData}
              onBackupData={handleBackupData}
              onRestoreData={handleRestoreData}
              onSyncAllToCloud={handleSyncAllToCloud}
              backendProvider={backendProvider}
              onChangeBackendProvider={handleSwitchBackendProvider}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-lg mx-auto text-center shadow-xs transition-colors my-12">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Akses Terbatas: Khusus Tim Kesiswaan / Admin
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                Pengaturan konfigurasi sekolah, jam toleransi gerbang, dan identitas aplikasi hanya dapat dikelola oleh akun Tim Kesiswaan / Administrator.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  onClick={() => handleRoleChange('kesiswaan')}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Beralih ke Tim Kesiswaan
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Gate Logger Modal */}
      <GateLoggerModal
        isOpen={quickRecordModalOpen}
        onClose={() => setQuickRecordModalOpen(false)}
        students={students}
        existingRecords={records}
        onSaveRecord={handleSaveRecord}
        settings={settings}
        classes={schoolClasses}
      />

      {/* Printable Official Document Modal */}
      <PrintSuratModal
        isOpen={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        student={printTargetStudent}
        record={printTargetRecord}
        mode={printMode}
        violationCount={violationCountForModal}
        settings={settings}
      />

      {/* Footer */}
      <footer className="no-print bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-12 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SchoolLogo size={28} src={settings.logoUrl} />
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {settings.appName}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                @2026 SMK Negeri 1 Jember Jl. Jambu No.17 Patrang - Jember
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>Login sebagai: <strong className="text-slate-700 dark:text-slate-200">{userSession.name}</strong> ({userSession.title})</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
              title="Keluar dari akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Ganti Akun</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleResetSampleData}
              className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              title="Reset data contoh SMKN 1 Jember"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Sampel</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
