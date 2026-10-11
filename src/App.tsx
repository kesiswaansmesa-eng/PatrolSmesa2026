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
  restoreSystemBackup
} from './utils/storage';
import { 
  seedInitialDataIfEmpty,
  startRealtimeSync,
  saveRecordCloud,
  deleteRecordCloud,
  saveStudentsBatchCloud,
  saveCounselingCloud,
  saveAccountCloud,
  saveMasterGuruBKCloud,
  saveMasterKKKCloud,
  saveMasterTimKesiswaanCloud,
  saveMasterMajorCloud,
  saveMasterClassCloud,
  saveSettingsCloud
} from './utils/firebaseSync';
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
      // Default to null so user can experience the official Login Page
      setUserSession(null);
      setActiveRole(getStoredRole());
    }

    // Test cloud database connection and seed initial data if collections are empty
    testConnection().then(() => {
      seedInitialDataIfEmpty().catch((err) => {
        console.warn('Initial cloud seed notice:', err);
      });
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
  }, []);

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

  // Add new late record
  const handleSaveRecord = (recordData: Omit<LateRecord, 'id' | 'createdAt'>) => {
    const newRecord: LateRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newRecord, ...records];
    setRecords(updated);
    saveStoredRecords(updated);
    saveRecordCloud(newRecord).catch((err) => {
      console.warn('Cloud save warning (cached locally):', err);
    });
    triggerToast(`Data keterlambatan ${recordData.studentName} berhasil disimpan otomatis.`);
  };

  // Delete record
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    saveStoredRecords(updated);
    deleteRecordCloud(id).catch((err) => {
      console.warn('Cloud delete warning:', err);
    });
    triggerToast('Catatan keterlambatan berhasil dihapus.');
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
      saveRecordCloud(target).catch(console.warn);
    }
    triggerToast(`Status pembinaan diperbarui: ${status}`);
  };

  // Add counseling entry
  const handleAddCounselingEntry = (entryData: Omit<CounselingEntry, 'id'>) => {
    const newEntry: CounselingEntry = {
      ...entryData,
      id: `csl-${Date.now()}`,
    };
    const updated = [newEntry, ...counselingEntries];
    setCounselingEntries(updated);
    saveStoredCounseling(updated);
    saveCounselingCloud(newEntry).catch((err) => {
      console.warn('Cloud counseling save warning:', err);
    });
    triggerToast(`Sesi konseling untuk ${entryData.studentName} berhasil dicatat realtime.`);
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

  // Reset demo data
  const handleResetSampleData = () => {
    if (
      confirm(
        'Kembalikan seluruh data ke contoh awal SMKN 1 Jember? Data yang baru diinput akan direset.'
      )
    ) {
      resetAllData();
      setRecords(getStoredRecords());
      setStudents(getStoredStudents());
      setCounselingEntries(getStoredCounseling());
      setGuruBK(getStoredGuruBK());
      setKKKList(getStoredKKK());
      setTimKesiswaan(getStoredTimKesiswaan());
      setMajors(getStoredMajors());
      setSchoolClasses(getStoredClasses());
      setAccounts(getStoredAccounts());
      seedInitialDataIfEmpty().catch(console.warn);
      triggerToast('Data contoh SMKN 1 Jember berhasil dimuat ulang ke database.');
    }
  };

  // Update master handlers
  const handleUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    saveStoredStudents(newStudents);
    saveStudentsBatchCloud(newStudents).catch(console.warn);
  };

  const handleUpdateMajors = (newList: Major[]) => {
    setMajors(newList);
    saveStoredMajors(newList);
    newList.forEach((m) => saveMasterMajorCloud(m).catch(console.warn));
  };

  const handleUpdateClasses = (newList: SchoolClass[]) => {
    setSchoolClasses(newList);
    saveStoredClasses(newList);
    newList.forEach((c) => saveMasterClassCloud(c).catch(console.warn));
  };

  const handleUpdateGuruBK = (newList: GuruBK[]) => {
    setGuruBK(newList);
    saveStoredGuruBK(newList);
    newList.forEach((g) => saveMasterGuruBKCloud(g).catch(console.warn));
  };

  const handleUpdateKKK = (newList: KKK[]) => {
    setKKKList(newList);
    saveStoredKKK(newList);
    newList.forEach((k) => saveMasterKKKCloud(k).catch(console.warn));
  };

  const handleUpdateTimKesiswaan = (newList: TimKesiswaan[]) => {
    setTimKesiswaan(newList);
    saveStoredTimKesiswaan(newList);
    newList.forEach((t) => saveMasterTimKesiswaanCloud(t).catch(console.warn));
  };

  const handleUpdateAccounts = (newList: UserAccount[]) => {
    setAccounts(newList);
    saveStoredAccounts(newList);
    newList.forEach((a) => saveAccountCloud(a).catch(console.warn));
  };

  // Reset Violations only
  const handleResetViolations = () => {
    resetViolationsOnly();
    setRecords([]);
    setCounselingEntries([]);
    triggerToast('Seluruh riwayat pelanggaran dan pembinaan siswa berhasil direset.');
  };

  // Wipe All Data
  const handleWipeAllData = () => {
    wipeAllSystemData();
    setRecords([]);
    setCounselingEntries([]);
    setStudents([]);
    setSchoolClasses([]);
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
    reader.onload = (e) => {
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
          triggerToast('Basis data sistem berhasil dipulihkan dari file backup!');
        } else {
          triggerToast('Gagal memulihkan: Format backup tidak dikenali.');
        }
      } catch (err) {
        triggerToast('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Save settings handler
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
    saveSettingsCloud(newSettings).catch(console.warn);
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
        selectedMajorFilter={selectedMajorFilter}
        onChangeMajorFilter={setSelectedMajorFilter}
        selectedClassFilter={selectedClassFilter}
        onChangeClassFilter={setSelectedClassFilter}
        availableClasses={availableClasses}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentTab === 'dashboard' && (
          <DashboardView
            records={records}
            students={students}
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
          />
        )}

        {currentTab === 'analisis' && (
          <AnalyticsView records={records} students={students} />
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
          <LaporanView records={records} students={students} settings={settings} />
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
              onBackupData={handleBackupData}
              onRestoreData={handleRestoreData}
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
