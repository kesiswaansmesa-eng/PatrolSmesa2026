import React, { useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/patrol';
import { SchoolLogo } from './SchoolLogo';
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
  Palette
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onToast: (msg: string) => void;
  theme?: 'light' | 'dark';
  onSelectTheme?: (theme: 'light' | 'dark') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onToast,
  theme = 'light',
  onSelectTheme,
}) => {
  const [form, setForm] = useState<AppSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

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
    </div>
  );
};
