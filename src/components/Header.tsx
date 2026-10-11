import React, { useState, useEffect } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { AppRole, UserSession, AppSettings, Major } from '../types/patrol';
import { subscribeSyncStatus, CloudSyncStatus } from '../utils/firebaseSync';
import { 
  LayoutDashboard, 
  UserPlus, 
  BarChart3, 
  ShieldAlert, 
  FileSpreadsheet, 
  Database,
  Settings,
  ChevronDown, 
  Menu, 
  X,
  Sliders,
  Check,
  LogOut,
  User,
  Sun,
  Moon,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeRole: AppRole;
  onChangeRole: (role: AppRole) => void;
  onOpenQuickRecord: () => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
  settings?: AppSettings;
  majors?: Major[];
  selectedMajorFilter?: string;
  onChangeMajorFilter?: (majorId: string) => void;
  selectedClassFilter?: string;
  onChangeClassFilter?: (className: string) => void;
  availableClasses?: string[];
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  activeRole,
  onChangeRole,
  onOpenQuickRecord,
  userSession,
  onLogout,
  settings,
  majors = [],
  selectedMajorFilter,
  onChangeMajorFilter,
  selectedClassFilter,
  onChangeClassFilter,
  availableClasses = [],
  theme = 'light',
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isConnected: true,
    isSyncing: false,
    lastSync: null,
    error: null,
  });

  useEffect(() => {
    const unsub = subscribeSyncStatus((s) => setSyncStatus(s));
    return unsub;
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<AppRole, { title: string; subtitle: string }> = {
    kesiswaan: { title: 'Tim Kesiswaan', subtitle: 'Pusat Kedisiplinan' },
    kepsek: { title: 'Kepala Sekolah', subtitle: 'Monitoring Eksekutif' },
    kkk: { title: 'Ketua Konsentrasi (KKK)', subtitle: 'Kaprodi Jurusan' },
    bk: { title: 'Guru BK', subtitle: 'Bimbingan Konseling' },
    walikelas: { title: 'Wali Kelas / Guru Wali', subtitle: 'Pembinaan Rombel' },
    piket: { title: 'Petugas Piket Gerbang', subtitle: 'Terminal Input Cepat' },
  };

  // Master Data & Pengaturan hanya ada di akun kesiswaan / admin
  const isKesiswaanOrAdmin = activeRole === 'kesiswaan';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pencatatan', label: 'Pencatatan', icon: UserPlus },
    { id: 'analisis', label: 'Statistik', icon: BarChart3 },
    { id: 'pembinaan', label: 'Pembinaan', icon: ShieldAlert },
    { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
    ...(isKesiswaanOrAdmin
      ? [
          { id: 'master', label: 'Master Data', icon: Database },
          { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
        ]
      : []),
  ];

  const schoolNameDisplay = settings?.schoolName || 'SMK NEGERI 1 JEMBER';
  const taglineDisplay = settings?.tagline || 'Catat Cepat • Data Akurat • Pembinaan Tepat';
  const gateClosingDisplay = settings?.gateClosingTime || '07:00';
  const appShortDisplay = settings?.appShortName || 'PATROL SMESA';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Top Banner Bar with School Identity & Tagline */}
      <div className="bg-slate-900 text-slate-200 px-4 sm:px-6 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white">{schoolNameDisplay}</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-amber-400 font-medium hidden sm:inline">
            {taglineDisplay}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="font-mono tabular-nums text-slate-200 bg-slate-800 px-2 py-0.5 rounded">
            {currentTime}
          </span>
          <span className="hidden md:inline">Batas Masuk: {gateClosingDisplay} WIB</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <SchoolLogo size={36} src={settings?.logoUrl} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                {appShortDisplay.split(' ')[0] || 'PATROL'}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/50 dark:border-blue-800/60 px-1.5 py-0.5 rounded">
                {appShortDisplay.split(' ').slice(1).join(' ') || 'SMESA'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none hidden sm:block">
              {settings?.appName ? settings.appName.split('(')[0].trim() : 'Pencatatan & Tracing Keterlambatan'}
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 text-sm font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/50 dark:border-blue-900/50'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Role Switcher, Theme Switcher & Action CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Cloud Database Sync Status Indicator */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all ${
              syncStatus.isSyncing
                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                : syncStatus.isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-850 text-amber-700 dark:text-amber-300'
            }`}
            title={
              syncStatus.isSyncing
                ? 'Sedang menyinkronkan data dengan database cloud...'
                : syncStatus.isConnected
                ? 'Database Cloud Terhubung: Penyimpanan otomatis & realtime aktif'
                : 'Database Offline: Perubahan disimpan di perangkat'
            }
          >
            {syncStatus.isSyncing ? (
              <RefreshCw className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
            ) : syncStatus.isConnected ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <CloudOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            )}
            <span className="font-semibold whitespace-nowrap">
              {syncStatus.isSyncing
                ? 'Sinkronisasi...'
                : syncStatus.isConnected
                ? 'Cloud Realtime'
                : 'Mode Offline'}
            </span>
          </div>

          {/* Global Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              type="button"
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center"
              title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
              aria-label="Ganti Tema Tampilan"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>
          )}

          {/* Role Switcher Popover */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Informasi Akun & Peran"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                {userSession?.name ? userSession.name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-none truncate max-w-[140px]">
                  {userSession?.name || roleLabels[activeRole].title}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate max-w-[140px]">
                  {userSession?.title || roleLabels[activeRole].subtitle}
                </div>
              </div>
              <span className="sm:hidden text-xs font-semibold">{userSession?.username || roleLabels[activeRole].title.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                  {userSession && (
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Akun Masuk Saat Ini:</div>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">{userSession.name}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">@{userSession.username}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{userSession.title}</div>
                    </div>
                  )}

                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Beralih Peran Tampilan:
                  </div>
                  {(Object.keys(roleLabels) as AppRole[]).map((rKey) => {
                    const isCurrent = activeRole === rKey;
                    return (
                      <button
                        key={rKey}
                        onClick={() => {
                          onChangeRole(rKey);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                          isCurrent ? 'bg-blue-50/70 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-medium' : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{roleLabels[rKey].title}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{roleLabels[rKey].subtitle}</div>
                        </div>
                        {isCurrent && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}

                  {onLogout && (
                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 mt-1">
                      <button
                        onClick={() => {
                          setRoleDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors font-medium text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar &amp; Ganti Akun</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Quick Record CTA */}
          <button
            onClick={onOpenQuickRecord}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Catat Terlambat</span>
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Role-Specific Context Bar (For KKK & Wali Kelas filters) */}
      {(activeRole === 'kkk' || activeRole === 'walikelas') && (
        <div className="bg-blue-50/60 dark:bg-slate-800/80 border-t border-blue-100 dark:border-slate-800 px-4 sm:px-6 py-2 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-medium">
            <Sliders className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
            <span>
              {activeRole === 'kkk' 
                ? 'Mode Kepala Konsentrasi Keahlian (Fokus Jurusan Anda):' 
                : 'Mode Wali Kelas (Fokus Rombongan Belajar Anda):'}
            </span>
          </div>
          {activeRole === 'kkk' && onChangeMajorFilter && (
            <div className="flex items-center gap-2">
              <label htmlFor="major-filter" className="text-slate-600 dark:text-slate-300">Jurusan:</label>
              <select
                id="major-filter"
                value={selectedMajorFilter || 'ALL'}
                onChange={(e) => onChangeMajorFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Jurusan</option>
                {majors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {activeRole === 'walikelas' && onChangeClassFilter && (
            <div className="flex items-center gap-2">
              <label htmlFor="class-filter" className="text-slate-600 dark:text-slate-300">Kelas Binaan:</label>
              <select
                id="class-filter"
                value={selectedClassFilter || 'ALL'}
                onChange={(e) => onChangeClassFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="ALL">Semua Kelas</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Theme Toggle in Mobile Menu */}
          {onToggleTheme && (
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 py-2 text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Tema Aplikasi:</span>
              <button
                onClick={onToggleTheme}
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mode Gelap</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mode Terang</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
