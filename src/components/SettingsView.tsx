import React, { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/patrol';
import { SchoolLogo } from './SchoolLogo';
import { subscribeSyncStatus, CloudSyncStatus, seedInitialDataIfEmpty } from '../utils/firebaseSync';
import { testConnection } from '../lib/firebase';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Building2, 
  Clock, 
  FileText, 
  School, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  Phone,
  Mail,
  Globe,
  Sun,
  Moon,
  Palette,
  Database,
  ArrowDownToLine,
  Upload,
  Trash2,
  ShieldAlert,
  Cloud,
  Server,
  Radio,
  RefreshCw
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onToast: (msg: string) => void;
  theme?: 'light' | 'dark';
  onSelectTheme?: (theme: 'light' | 'dark') => void;
  onResetViolations?: () => void;
  onWipeAllData?: () => void;
  onBackupData?: () => void;
  onRestoreData?: (file: File) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onToast,
  theme = 'light',
  onSelectTheme,
  onResetViolations,
  onWipeAllData,
  onBackupData,
  onRestoreData,
}) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [confirmResetViolations, setConfirmResetViolations] = useState(false);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wipeInput, setWipeInput] = useState('');
  const restoreFileRef = React.useRef<HTMLInputElement>(null);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({
    isConnected: true,
    isSyncing: false,
    lastSync: null,
    error: null,
  });
  const [isPinging, setIsPinging] = useState(false);

  React.useEffect(() => {
    const unsub = subscribeSyncStatus((s) => setSyncStatus(s));
    return unsub;
  }, []);

  const handlePingDatabase = async () => {
    setIsPinging(true);
    onToast('Menghubungi basis data cloud & memeriksa sinkronisasi realtime...');
    try {
      await testConnection();
      onToast('✓ Basis data Cloud terhubung stabil! Sinkronisasi realtime aktif.');
    } catch (e) {
      onToast('Peringatan: Periksa koneksi internet atau sesi cloud.');
    } finally {
      setIsPinging(false);
    }
  };

  const handleChange = (field: keyof AppSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setHasChanges(false);
    onToast('Konfigurasi aplikasi dan sekolah berhasil disimpan.');
  };

  const handleReset = () => {
    if (confirm('Kembalikan seluruh pengaturan ke konfigurasi default SMKN 1 Jember?')) {
      setForm(DEFAULT_SETTINGS);
      onSaveSettings(DEFAULT_SETTINGS);
      setHasChanges(false);
      onToast('Pengaturan telah direset ke default.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
            <span>Pusat Konfigurasi Sistem</span>
            <span>·</span>
            <span>Kesiswaan &amp; Tata Usaha</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Pengaturan Aplikasi &amp; Profil Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Sesuaikan tema tampilan, nama aplikasi, identitas sekolah, tahun ajaran aktif, batas jam gerbang, dan pejabat pengesahan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
              hasChanges ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {/* Global Theme Selection Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tema Tampilan Aplikasi (Global Light &amp; Dark Mode)
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Tersimpan permanen di LocalStorage
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Option */}
          <div
            onClick={() => onSelectTheme && onSelectTheme('light')}
            className={`cursor-pointer rounded-xl p-4 border transition-all flex items-start gap-3.5 ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Mode Terang (Light Mode)
                </span>
                {theme === 'light' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tampilan cerah berlatar putih/abu-abu bersih, ideal untuk siang hari dan pencetakan dokumen.
              </p>
            </div>
          </div>

          {/* Dark Mode Option */}
          <div
            onClick={() => onSelectTheme && onSelectTheme('dark')}
            className={`cursor-pointer rounded-xl p-4 border transition-all flex items-start gap-3.5 ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-950/50 ring-2 ring-blue-500/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 shadow-xs shrink-0">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Mode Gelap (Dark Mode)
                </span>
                {theme === 'dark' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-900/60 border border-blue-500/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Tampilan bernuansa gelap nyaman di mata, hemat energi, dan kontras tajam.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Database Integration Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Status Basis Data Cloud (Penyimpanan Otomatis &amp; Realtime)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                syncStatus.isConnected
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{syncStatus.isConnected ? 'Terhubung & Realtime Aktif' : 'Offline Mode (Local Cache)'}</span>
            </span>
            <button
              type="button"
              onClick={handlePingDatabase}
              disabled={isPinging}
              className="px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Memeriksa...' : 'Cek Status / Re-sync'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Penyimpanan Terpusat</div>
            <div className="font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Cloud Enterprise Firestore</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Data keterlambatan, akun, dan bimbingan tersimpan aman di server terpusat.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Sinkronisasi Antar Perangkat</div>
            <div className="font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Realtime Listener (onSnapshot)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Input dari gerbang piket langsung tampil seketika di dashboard kesiswaan &amp; guru BK.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Keandalan Offline-First</div>
            <div className="font-bold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Dual Persistence (Cache + Cloud)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Jika koneksi internet sekolah sempat terputus, aplikasi tetap berjalan lancar tanpa macet.
            </p>
          </div>
        </div>
      </div>

      {/* Database Management & Backup Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tata Kelola Basis Data (Backup, Pulihkan &amp; Pembersihan Data)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
            Keamanan Data Sekolah
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Gunakan utilitas di bawah ini untuk mengamankan data dengan mengekspor backup berkala ke komputer / Google Drive, mereset data riwayat keterlambatan di akhir semester, atau memulihkan data dari file cadangan.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Backup Button */}
          <button
            type="button"
            onClick={onBackupData}
            className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-900 dark:text-blue-300">
                Backup Data (JSON)
              </span>
              <ArrowDownToLine className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-blue-800/80 dark:text-blue-400/80">
              Unduh salinan lengkap database sistem ke lokal PC atau Google Drive.
            </p>
          </button>

          {/* Restore Button */}
          <input
            ref={restoreFileRef}
            type="file"
            accept=".json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onRestoreData?.(file);
                if (restoreFileRef.current) restoreFileRef.current.value = '';
              }
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => restoreFileRef.current?.click()}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Pulihkan Data
              </span>
              <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Muat kembali data dari file cadangan JSON yang telah disimpan sebelumnya.
            </p>
          </button>

          {/* Reset Violations Only */}
          <button
            type="button"
            onClick={() => setConfirmResetViolations(true)}
            className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300">
                Reset Pelanggaran
              </span>
              <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:rotate-45 transition-transform" />
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
              Kosongkan riwayat keterlambatan semester. Master data siswa &amp; guru tetap aman.
            </p>
          </button>

          {/* Wipe All Data */}
          <button
            type="button"
            onClick={() => {
              setWipeInput('');
              setConfirmWipe(true);
            }}
            className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/60 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/60 transition-all text-left space-y-1.5 group shadow-xs cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-red-900 dark:text-red-300">
                Hapus Semua Data
              </span>
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-red-800/80 dark:text-red-400/80">
              Pembersihan total sistem untuk inisialisasi ulang tahun ajaran baru.
            </p>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Form Sections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Nama Aplikasi & Branding */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                1. Konfigurasi Nama Aplikasi &amp; Tagline
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Panjang Aplikasi
                </label>
                <input
                  type="text"
                  value={form.appName}
                  onChange={(e) => handleChange('appName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Ditampilkan di judul halaman &amp; dokumen resmi
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pendek / Brand Singkatan
                </label>
                <input
                  type="text"
                  value={form.appShortName}
                  onChange={(e) => handleChange('appShortName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Ditampilkan di top bar navbar (e.g. PATROL SMESA)
                </span>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline / Slogan Aplikasi
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Prinsip kerja aplikasi (e.g. Catat Cepat • Data Akurat • Pembinaan Tepat)
              </span>
            </div>

            <div className="text-xs pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1">
                URL Logo Resmi Sekolah / Aplikasi
              </label>
              <div className="flex items-center gap-3">
                <SchoolLogo size={42} src={form.logoUrl} className="p-1 border border-slate-200 rounded-lg bg-slate-50 shrink-0" />
                <div className="flex-1">
                  <input
                    type="url"
                    value={form.logoUrl || ''}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://iili.io/nMvNPFs.md.png"
                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Logo resmi SMKN 1 Jember telah disetel secara bawaan.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Nama Sekolah, Tahun Ajaran, & Jam Masuk */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <School className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                2. Identitas Sekolah &amp; Tahun Ajaran Aktif
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={(e) => handleChange('schoolName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tahun Ajaran Aktif
                </label>
                <input
                  type="text"
                  value={form.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  placeholder="2025/2026"
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Semester Aktif
                </label>
                <select
                  value={form.activeSemester}
                  onChange={(e) => handleChange('activeSemester', e.target.value as 'Ganjil' | 'Genap')}
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Batas Waktu Masuk Gerbang (WIB)
                </label>
                <input
                  type="time"
                  value={form.gateClosingTime}
                  onChange={(e) => handleChange('gateClosingTime', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Siswa yang tiba setelah waktu ini akan dihitung menit keterlambatannya
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Kontak & Alamat Sekolah (Untuk Kop Surat) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">
                3. Alamat &amp; Kontak Resmi (Kop Dokumen)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap Sekolah
                </label>
                <input
                  type="text"
                  value={form.schoolAddress}
                  onChange={(e) => handleChange('schoolAddress', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Telepon
                </label>
                <input
                  type="text"
                  value={form.schoolPhone}
                  onChange={(e) => handleChange('schoolPhone', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email Kesiswaan
                </label>
                <input
                  type="email"
                  value={form.schoolEmail}
                  onChange={(e) => handleChange('schoolEmail', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Website Sekolah
                </label>
                <input
                  type="text"
                  value={form.schoolWebsite}
                  onChange={(e) => handleChange('schoolWebsite', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 4: Pejabat Pengesahan */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                4. Pejabat Pengesahan (Tanda Tangan Surat Resmi &amp; Laporan)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={form.principalName}
                  onChange={(e) => handleChange('principalName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={form.principalNip}
                  onChange={(e) => handleChange('principalNip', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Waka Kesiswaan
                </label>
                <input
                  type="text"
                  value={form.vicePrincipalName}
                  onChange={(e) => handleChange('vicePrincipalName', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  NIP Waka Kesiswaan
                </label>
                <input
                  type="text"
                  value={form.vicePrincipalNip}
                  onChange={(e) => handleChange('vicePrincipalNip', e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): Live Preview */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Live Preview Kop &amp; Identitas
              </h3>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
                Realtime
              </span>
            </div>

            {/* Preview Banner Header */}
            <div className="p-3 bg-slate-900 rounded-lg text-white space-y-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                Preview Top Bar:
              </div>
              <div className="text-xs font-bold text-white">{form.schoolName}</div>
              <div className="text-[11px] text-amber-400 font-medium">{form.tagline}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                Batas Masuk: {form.gateClosingTime} WIB
              </div>
            </div>

            {/* Preview Kop Surat */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-center text-slate-900">
              <div className="text-[9px] text-slate-400 uppercase font-semibold text-left">
                Preview Kop Surat Dokumen Resmi:
              </div>
              <SchoolLogo size={48} src={form.logoUrl} className="mx-auto" />
              <div className="text-[10px] font-bold uppercase text-slate-700 leading-tight">
                PEMERINTAH PROVINSI JAWA TIMUR<br />
                DINAS PENDIDIKAN
              </div>
              <div className="text-xs font-black uppercase text-slate-950 leading-tight">
                {form.schoolName}
              </div>
              <div className="text-[9px] text-slate-600 leading-tight">
                {form.schoolAddress} • Telp: {form.schoolPhone}
              </div>
              <div className="text-[9px] text-slate-500 font-mono">
                {form.schoolWebsite} • {form.schoolEmail}
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-700 flex justify-between font-medium">
                <span>Tahun: {form.academicYear}</span>
                <span>Semester: {form.activeSemester}</span>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={!hasChanges}
              className={`w-full py-2.5 rounded-lg text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-xs ${
                hasChanges ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Simpan Konfigurasi</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Dialog: Reset Violations */}
      {confirmResetViolations && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-amber-600 text-white px-5 py-4 flex items-center gap-2.5">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Konfirmasi Reset Data Pelanggaran Siswa</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed">
                Tindakan ini akan <strong>mengosongkan seluruh catatan keterlambatan</strong> dan riwayat pembinaan di semester ini.
              </p>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-900 dark:text-emerald-300 text-[11px]">
                ✓ Master Data Siswa, Guru BK, KKK, dan Pengaturan Profil Sekolah tetap utuh &amp; aman.
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmResetViolations(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmResetViolations(false);
                  onResetViolations?.();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Ya, Reset Pelanggaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Wipe All Data */}
      {confirmWipe && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-red-300 dark:border-red-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-700 text-white px-5 py-4 flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm">Peringatan Kritis: Hapus Seluruh Data</h3>
            </div>
            <div className="p-5 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p className="leading-relaxed text-red-900 dark:text-red-300 font-semibold">
                Tindakan ini akan mengosongkan seluruh data operasional untuk memulai dari awal bersih!
              </p>
              <p className="text-[11px] text-slate-500">
                Ketik kata <strong>HAPUS</strong> di bawah ini untuk mengonfirmasi:
              </p>
              <input
                type="text"
                value={wipeInput}
                onChange={(e) => setWipeInput(e.target.value)}
                placeholder="Ketik 'HAPUS'"
                className="w-full p-2 border border-red-300 dark:border-red-700 rounded-lg font-mono text-center bg-white dark:bg-slate-800 uppercase tracking-widest text-sm"
              />
            </div>
            <div className="bg-slate-50 dark:bg-slate-850 px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfirmWipe(false)}
                className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={wipeInput.trim().toUpperCase() !== 'HAPUS'}
                onClick={() => {
                  setConfirmWipe(false);
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
    </div>
  );
};
