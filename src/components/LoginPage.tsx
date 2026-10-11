import React, { useState } from 'react';
import { SchoolLogo } from './SchoolLogo';
import { AppRole, UserSession, AppSettings } from '../types/patrol';
import { 
  ShieldAlert, 
  GraduationCap, 
  HeartHandshake, 
  Building2, 
  Users, 
  ArrowRight, 
  Lock, 
  Mail, 
  CheckCircle2,
  Clock,
  Sun,
  Moon
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
  settings?: AppSettings;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

interface RolePreset {
  role: AppRole;
  title: string;
  subtitle: string;
  name: string;
  email: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  desc: string;
}

const PRESET_ROLES: RolePreset[] = [
  {
    role: 'kesiswaan',
    title: 'Tim Kesiswaan',
    subtitle: 'Pusat Kedisiplinan & Piket',
    name: 'Hendra Setiawan, S.Pd.',
    email: 'kesiswaan@smkn1jember.sch.id',
    icon: ShieldAlert,
    color: 'blue',
    desc: 'Pencatatan gerbang harian, verifikasi sanksi edukatif, dan rekapitulasi kehadiran.',
  },
  {
    role: 'kkk',
    title: 'KKK (Ketua Konsentrasi)',
    subtitle: 'Kaprodi Jurusan SMESA',
    name: 'Ir. Budi Santoso, S.Kom., M.T.',
    email: 'kkk.rpl@smkn1jember.sch.id',
    icon: GraduationCap,
    color: 'emerald',
    desc: 'Monitoring keterlambatan siswa per jurusan (RPL, AKL, MPLB, BD, DKV, KL, HTL).',
  },
  {
    role: 'bk',
    title: 'Guru BK (Bimbingan Konseling)',
    subtitle: 'Konseling & Intervensi',
    name: 'Nur Hasanah, S.Pd., Kons.',
    email: 'bk@smkn1jember.sch.id',
    icon: HeartHandshake,
    color: 'purple',
    desc: 'Penanganan siswa zona orange (4-6x) & merah (≥7x), temu orang tua, dan komitmen.',
  },
  {
    role: 'kepsek',
    title: 'Kepala Sekolah',
    subtitle: 'Pengawasan Eksekutif',
    name: 'Drs. H. Sri Handoko, M.Pd.',
    email: 'kepsek@smkn1jember.sch.id',
    icon: Building2,
    color: 'amber',
    desc: 'Executive summary, indeks ketepatan waktu sekolah, dan bahan evaluasi kebijakan.',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onLoginSuccess, 
  settings, 
  theme = 'dark', 
  onToggleTheme 
}) => {
  const [selectedRole, setSelectedRole] = useState<AppRole>('kesiswaan');
  const [emailInput, setEmailInput] = useState('kesiswaan@smkn1jember.sch.id');
  const [passwordInput, setPasswordInput] = useState('smesa123');

  const schoolNameDisplay = settings?.schoolName || 'SMK NEGERI 1 JEMBER';
  const taglineDisplay = settings?.tagline || 'Catat Cepat • Data Akurat • Pembinaan Tepat';
  const gateClosingDisplay = settings?.gateClosingTime || '07:00';
  const appShortDisplay = settings?.appShortName || 'PATROL SMESA';

  const handleSelectPreset = (preset: RolePreset) => {
    setSelectedRole(preset.role);
    setEmailInput(preset.email);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preset = PRESET_ROLES.find((r) => r.role === selectedRole) || PRESET_ROLES[0];
    onLoginSuccess({
      role: preset.role,
      name: preset.name,
      title: preset.title,
      email: emailInput || preset.email,
    });
  };

  const handleQuickLogin = (preset: RolePreset) => {
    onLoginSuccess({
      role: preset.role,
      name: preset.name,
      title: preset.title,
      email: preset.email,
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
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Login Container */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
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
              </div>
              <p className="text-amber-400 text-xs sm:text-sm font-semibold tracking-wide">
                “{taglineDisplay}”
              </p>
              <p className="text-slate-400 text-xs max-w-xl">
                Portal autentikasi resmi Tim Kesiswaan, KKK (Kaprodi), Guru BK, dan Kepala Sekolah {schoolNameDisplay}.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Preset Role Cards (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Pilih Akses Peran Anda:
                </span>
                <span className="text-[11px] text-slate-400">
                  Klik kartu untuk login instan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_ROLES.map((preset) => {
                  const Icon = preset.icon;
                  const isSelected = selectedRole === preset.role;

                  return (
                    <div
                      key={preset.role}
                      onClick={() => handleSelectPreset(preset)}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/30'
                          : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-slate-800 text-blue-400 border border-slate-700">
                          <Icon className="w-5 h-5" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickLogin(preset);
                          }}
                          className="text-[11px] font-semibold text-blue-400 hover:text-white px-2 py-1 bg-blue-900/40 hover:bg-blue-600 rounded transition-colors"
                        >
                          Masuk Langsung →
                        </button>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-white">{preset.title}</div>
                        <div className="text-[11px] text-slate-400">{preset.subtitle}</div>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                          {preset.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Standard Disciplinary Warning Scale */}
              <div className="p-3.5 bg-slate-900/80 border border-slate-700/80 rounded-xl space-y-2 text-xs">
                <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                  Ketentuan Skala Warna Kedisiplinan:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded bg-emerald-950/50 border border-emerald-600/40 text-emerald-300">
                    <strong className="block font-bold">1 – 3x (Hijau)</strong>
                    <span className="text-[10px] text-emerald-400">Teguran & Sanksi Edukatif</span>
                  </div>
                  <div className="p-2 rounded bg-orange-950/50 border border-orange-600/40 text-orange-300">
                    <strong className="block font-bold">4 – 6x (Orange)</strong>
                    <span className="text-[10px] text-orange-400">Konseling BK & Wali Kelas</span>
                  </div>
                  <div className="p-2 rounded bg-red-950/50 border border-red-600/40 text-red-300">
                    <strong className="block font-bold">≥ 7x (Merah)</strong>
                    <span className="text-[10px] text-red-400">Panggilan Orang Tua Resmi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form Login (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 p-5 rounded-xl border border-slate-700/80 flex flex-col justify-between">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Form Masuk Akun</h3>
                  <p className="text-xs text-slate-400">
                    Gunakan kredensial akun terdaftar SMKN 1 Jember
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email / NIP Pengguna
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-slate-850 rounded-lg border border-slate-750 text-[11px] text-slate-400">
                  Peran Terpilih:{' '}
                  <strong className="text-blue-300 uppercase">
                    {PRESET_ROLES.find((r) => r.role === selectedRole)?.title}
                  </strong>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
                >
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
                Aplikasi Internal Kesiswaan SMK Negeri 1 Jember • v2.4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-2">
        © 2026 SMK Negeri 1 Jember • Jl. Danau Toba No. 16, Jember, Jawa Timur
      </div>
    </div>
  );
};
