import React, { useState, useRef } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { AppRole, UserSession, AppSettings, UserAccount } from '../types/patrol';
import { getStoredAccounts, saveStoredAccounts } from '../utils/storage';
import { saveAccountCloud, subscribeSyncStatus, CloudSyncStatus } from '../utils/firebaseSync';
import { 
  ShieldAlert, 
  GraduationCap, 
  HeartHandshake, 
  Building2, 
  Users, 
  ArrowRight, 
  Lock, 
  UserCheck, 
  Clock,
  Sun,
  Moon,
  Eye,
  EyeOff,
  KeyRound,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Search,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
  accounts?: UserAccount[];
  settings?: AppSettings;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  accounts = [], 
  settings, 
  theme = 'dark', 
  onToggleTheme 
}) => {
  const activeAccounts = accounts && accounts.length > 0 ? accounts : getStoredAccounts();

  // Role Category Filter
  const [roleFilter, setRoleFilter] = useState<'all' | AppRole>('all');
  const [accountSearch, setAccountSearch] = useState('');

  // Form Inputs (Empty by default for secure manual authentication)
  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isConnected: true,
    isSyncing: false,
    lastSync: null,
    error: null,
  });

  React.useEffect(() => {
    const unsub = subscribeSyncStatus((s) => setSyncStatus(s));
    return unsub;
  }, []);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  const schoolNameDisplay = settings?.schoolName || 'SMK NEGERI 1 JEMBER';
  const taglineDisplay = settings?.tagline || 'Catat Cepat • Data Akurat • Pembinaan Tepat';
  const gateClosingDisplay = settings?.gateClosingTime || '07:00';
  const appShortDisplay = settings?.appShortName || 'PATROL SMESA';

  // Filtered Accounts
  const filteredAccounts = activeAccounts.filter((acc) => {
    if (roleFilter !== 'all' && acc.role !== roleFilter) return false;
    if (accountSearch.trim()) {
      const q = accountSearch.toLowerCase();
      const match =
        acc.name.toLowerCase().includes(q) ||
        acc.username.toLowerCase().includes(q) ||
        (acc.nip && acc.nip.includes(q)) ||
        acc.roleTitle.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getRoleBadgeInfo = (role: AppRole) => {
    switch (role) {
      case 'kesiswaan':
        return {
          title: 'TIM Kesiswaan (Admin)',
          bg: 'bg-blue-900/40 text-blue-300 border-blue-600/40',
          icon: ShieldAlert,
          color: 'text-blue-400',
        };
      case 'kepsek':
        return {
          title: 'Kepala Sekolah',
          bg: 'bg-amber-900/40 text-amber-300 border-amber-600/40',
          icon: Building2,
          color: 'text-amber-400',
        };
      case 'bk':
        return {
          title: 'GURU BK',
          bg: 'bg-purple-900/40 text-purple-300 border-purple-600/40',
          icon: HeartHandshake,
          color: 'text-purple-400',
        };
      case 'kkk':
        return {
          title: 'KKK (Kaprodi)',
          bg: 'bg-emerald-900/40 text-emerald-300 border-emerald-600/40',
          icon: GraduationCap,
          color: 'text-emerald-400',
        };
      case 'piket':
        return {
          title: 'Petugas Piket',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: Users,
          color: 'text-slate-400',
        };
      default:
        return {
          title: 'Pegawai',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: UserCheck,
          color: 'text-slate-400',
        };
    }
  };

  // Select account puts username into input but REQUIRES password entry
  const handleSelectAccount = (acc: UserAccount) => {
    setSelectedAccountId(acc.id);
    setIdentifierInput(acc.username);
    setPasswordInput(''); // Strictly empty, user must enter their password
    setErrorMessage(null);
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 50);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const q = identifierInput.trim().toLowerCase();
    if (!q) {
      setErrorMessage('Silakan masukkan Username atau NIP.');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMessage('Silakan masukkan kata sandi (password) akun Anda.');
      return;
    }

    const matched = activeAccounts.find((a) => {
      const uMatch = a.username.toLowerCase() === q;
      const emailMatch = a.email && a.email.toLowerCase() === q;
      const nipMatch = a.nip && a.nip.replace(/\s+/g, '') === q.replace(/\s+/g, '');
      return uMatch || emailMatch || nipMatch;
    });

    if (!matched) {
      setErrorMessage(
        'Akun tidak terdaftar. Pastikan Username atau NIP sesuai dengan data akun yang dibuat oleh Admin Tim Kesiswaan.'
      );
      return;
    }

    if (matched.status === 'Nonaktif') {
      setErrorMessage(
        `Akun "${matched.username}" (${matched.name}) berstatus NONAKTIF. Hubungi Administrator Tim Kesiswaan untuk mengaktifkan kembali.`
      );
      return;
    }

    if (matched.password !== passwordInput.trim()) {
      setErrorMessage(
        'Kata sandi salah. Silakan periksa kembali kata sandi akun Anda demi keamanan.'
      );
      return;
    }

    // Update lastLogin
    const nowIso = new Date().toISOString();
    const updatedAccounts = activeAccounts.map((a) =>
      a.id === matched.id ? { ...a, lastLogin: nowIso } : a
    );
    saveStoredAccounts(updatedAccounts);
    saveAccountCloud({ ...matched, lastLogin: nowIso }).catch((err) => {
      console.warn('Could not sync lastLogin to cloud:', err);
    });

    onLoginSuccess({
      accountId: matched.id,
      username: matched.username,
      role: matched.role,
      name: matched.name,
      title: matched.roleTitle,
      email: matched.email || `${matched.username}@smkn1jember.sch.id`,
      phone: matched.phone,
      majorId: matched.majorId,
      nip: matched.nip,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Bar Identity */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between text-xs py-2 text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{schoolNameDisplay}</span>
          <span>·</span>
          <span>{appShortDisplay}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Toleransi Gerbang: {gateClosingDisplay} WIB</span>
          </div>
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              type="button"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Login Container */}
      <div className="max-w-6xl w-full mx-auto my-auto py-6">
        <div className="bg-slate-800/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-700/80 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <SchoolLogo size={72} src={settings?.logoUrl} />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {appShortDisplay.split(' ')[0] || 'PATROL'}{' '}
                  <span className="text-blue-400">
                    {appShortDisplay.split(' ').slice(1).join(' ') || 'SMESA'}
                  </span>
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                  Pencatatan &amp; Tracing Keterlambatan
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  syncStatus.isConnected 
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800' 
                    : 'bg-amber-950/70 text-amber-300 border-amber-800'
                }`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>Cloud Database Realtime</span>
                </span>
              </div>
              <p className="text-amber-400 text-xs sm:text-sm font-semibold tracking-wide">
                “{taglineDisplay}”
              </p>
              <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
                Pintu masuk resmi aplikasi berbasis verifikasi akun dan kata sandi terdaftar (Tim Kesiswaan, KKK / Kaprodi, Guru BK, dan Kepala Sekolah).
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Pilihan Akun Terdaftar (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    <span>Daftar Akun Terdaftar ({activeAccounts.length})</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Pilih akun Anda untuk memuat Username, lalu masukkan kata sandi Anda untuk login aman
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-52">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Cari akun / NIP..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    roleFilter === 'all'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Semua ({activeAccounts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('kesiswaan')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    roleFilter === 'kesiswaan'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tim Kesiswaan ({activeAccounts.filter((a) => a.role === 'kesiswaan').length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('kkk')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    roleFilter === 'kkk'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  KKK ({activeAccounts.filter((a) => a.role === 'kkk').length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('bk')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    roleFilter === 'bk'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Guru BK ({activeAccounts.filter((a) => a.role === 'bk').length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('kepsek')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    roleFilter === 'kepsek'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Kepsek ({activeAccounts.filter((a) => a.role === 'kepsek').length})
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('piket')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    roleFilter === 'piket'
                      ? 'bg-slate-700 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Piket ({activeAccounts.filter((a) => a.role === 'piket').length})
                </button>
              </div>

              {/* Accounts Cards List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredAccounts.length === 0 ? (
                  <div className="col-span-2 text-center py-10 bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400 text-xs">
                    Tidak ada akun yang cocok dengan pencarian / filter ini.
                  </div>
                ) : (
                  filteredAccounts.map((acc) => {
                    const badge = getRoleBadgeInfo(acc.role);
                    const Icon = badge.icon;
                    const isSelected = selectedAccountId === acc.id;

                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleSelectAccount(acc)}
                        className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left flex flex-col justify-between space-y-2.5 ${
                          isSelected
                            ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-950/50'
                            : 'bg-slate-900/70 border-slate-700/60 hover:border-slate-600 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg}`}>
                            <Icon className="w-3 h-3 shrink-0" />
                            <span>{badge.title}</span>
                          </span>

                          {isSelected ? (
                            <span className="text-[10px] font-semibold text-blue-300 bg-blue-900/60 border border-blue-500/50 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-400" />
                              <span>Terpilih</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 rounded hover:text-slate-200 transition-colors">
                              Pilih Akun
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-xs text-white line-clamp-1">{acc.name}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{acc.roleTitle}</div>
                          {acc.majorId && (
                            <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 border border-indigo-700/40">
                              Jurusan: {acc.majorId}
                            </span>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <div>
                            Username: <strong className="text-slate-200">{acc.username}</strong>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${acc.status === 'Aktif' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className={acc.status === 'Aktif' ? 'text-emerald-400' : 'text-red-400'}>{acc.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notice Box for Admin Management */}
              <div className="p-3 bg-slate-900/80 border border-slate-700/80 rounded-xl flex items-start gap-2.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-white">Pendaftaran &amp; Kelola Akun oleh Admin:</strong> Akun dan kata sandi baru untuk Tim Kesiswaan, KKK (Kaprodi), Guru BK, dan Kepala Sekolah dikelola secara terpusat oleh Admin melalui menu <strong>Master Data &gt; Master Akun Pengguna</strong>.
                </div>
              </div>
            </div>

            {/* Right Column: Form Login (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-xl border border-slate-700/80 flex flex-col justify-between space-y-4">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>Autentikasi Akun</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Masukkan Username / NIP dan Kata Sandi terdaftar
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-lg text-red-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username / NIP / Email
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={identifierInput}
                      onChange={(e) => {
                        setIdentifierInput(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Masukkan Username atau NIP..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      ref={passwordInputRef}
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setErrorMessage(null);
                      }}
                      placeholder="Masukkan kata sandi akun..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                      title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Selected Account Info */}
                {selectedAccountId && (
                  <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-750 text-[11px] text-slate-300 space-y-0.5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Akun Terpilih:</div>
                    <div className="font-bold text-white">
                      {activeAccounts.find((a) => a.id === selectedAccountId)?.name || identifierInput}
                    </div>
                    <div className="text-blue-300">
                      {activeAccounts.find((a) => a.id === selectedAccountId)?.roleTitle || 'Akun Pengguna'}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk ke Aplikasi PATROL</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Security Advisory Notice */}
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Keamanan Akses Terpusat</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Fitur masuk langsung tanpa verifikasi telah dinonaktifkan demi perlindungan data. Setiap pengguna wajib memasukkan kata sandi terdaftar yang diberikan oleh Administrator Tim Kesiswaan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-3 font-medium">
        @2026 SMK Negeri 1 Jember Jl. Jambu No.17 Patrang - Jember
      </div>
    </div>
  );
};
