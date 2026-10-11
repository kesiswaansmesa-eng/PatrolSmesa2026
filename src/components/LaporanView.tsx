import React, { useState, useRef } from 'react';
import { LateRecord, Student, AppSettings } from '../types/patrol';
import { MAJORS } from '../data/initialData';
import { formatIndonesianDate, downloadCSV } from '../utils/storage';
import { exportElementToPDF } from '../utils/pdfExport';
import { SchoolLogo } from './SchoolLogo';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Filter, 
  CheckCircle,
  Building2,
  Clock,
  Loader2,
  FileDown
} from 'lucide-react';

interface LaporanViewProps {
  records: LateRecord[];
  students: Student[];
  settings?: AppSettings;
}

type ReportType = 'harian' | 'mingguan' | 'bulanan' | 'semester';

export const LaporanView: React.FC<LaporanViewProps> = ({ records, students, settings }) => {
  const [reportType, setReportType] = useState<ReportType>('harian');
  const [targetDate, setTargetDate] = useState('2026-10-10');
  const [targetMonth, setTargetMonth] = useState('2026-10');
  const [targetSemester, setTargetSemester] = useState(
    settings ? `Semester ${settings.activeSemester} ${settings.academicYear}` : 'Ganjil 2025/2026'
  );
  const [filterMajor, setFilterMajor] = useState('ALL');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const schoolName = settings?.schoolName || 'SEKOLAH MENENGAH KEJURUAN NEGERI 1 JEMBER';
  const schoolAddress = settings?.schoolAddress || 'Jl. Jambu No.17 Patrang - Jember';
  const schoolPhone = settings?.schoolPhone || '(0331) 337486';
  const schoolEmail = settings?.schoolEmail || 'kesiswaansmesa@gmail.com';
  const schoolWebsite = settings?.schoolWebsite || 'smkn1jember.sch.id';
  const vicePrincipalName = settings?.vicePrincipalName || 'Drs. H. Mulyono, M.Pd.';
  const vicePrincipalNip = settings?.vicePrincipalNip || '19680512 199303 1 008';

  // Filter records based on selected report configuration
  const filteredRecords = records.filter((r) => {
    if (filterMajor !== 'ALL' && r.majorId !== filterMajor) return false;

    if (reportType === 'harian') {
      return r.date === targetDate;
    }
    if (reportType === 'mingguan') {
      // Within 7 days prior to targetDate
      const recTime = new Date(r.date).getTime();
      const targetTime = new Date(targetDate).getTime();
      const diffDays = (targetTime - recTime) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }
    if (reportType === 'bulanan') {
      return r.date.startsWith(targetMonth);
    }
    if (reportType === 'semester') {
      return r.semester === targetSemester;
    }
    return true;
  });

  const getReportFileName = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const period = reportType === 'harian' ? targetDate :
                   reportType === 'bulanan' ? targetMonth :
                   reportType === 'mingguan' ? `Mingguan_${targetDate}` :
                   targetSemester.replace(/[\/\s]/g, '_');
    return `Laporan_Keterlambatan_${reportType.toUpperCase()}_SMKN1_Jember_${period}_${timestamp}.pdf`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printContainerRef.current) return;
    setIsExportingPDF(true);
    try {
      const fileName = getReportFileName();
      await exportElementToPDF(printContainerRef.current, fileName, {
        orientation: 'p',
        title: `Laporan Keterlambatan Siswa SMKN 1 Jember (${reportType})`,
      });
    } catch (err) {
      console.error('Gagal mengunduh PDF:', err);
      // Fallback to print dialog
      window.print();
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = () => {
    downloadCSV(
      filteredRecords,
      `Laporan_${reportType}_SMKN1_Jember_${new Date().toISOString().split('T')[0]}.csv`
    );
  };

  const totalMenit = filteredRecords.reduce((acc, r) => acc + r.minutesLate, 0);
  const avgMenit = filteredRecords.length > 0 ? Math.round(totalMenit / filteredRecords.length) : 0;

  return (
    <div className="space-y-6">
      {/* Control Configuration Panel (Hidden when printing) */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Generator Laporan Resmi Keterlambatan Siswa
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak Berita Acara Harian, Rekapitulasi Mingguan, Bulanan, dan Semester berstandar Kop Sekolah SMKN 1 Jember
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh data dalam format CSV/Excel"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Unduh dokumen langsung sebagai file PDF ke PC/Google Drive"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyiapkan PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Simpan / Unduh PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="Buka dialog cetak printer browser / Simpan ke PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Dokumen</span>
            </button>
          </div>
        </div>

        {/* Report Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="harian">Laporan Harian (Berita Acara Piket)</option>
              <option value="mingguan">Laporan Mingguan (7 Hari Terakhir)</option>
              <option value="bulanan">Laporan Bulanan (Rekap Disiplin)</option>
              <option value="semester">Laporan Semester (Evaluasi Rapor)</option>
            </select>
          </div>

          {reportType === 'harian' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          {reportType === 'mingguan' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          {reportType === 'bulanan' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Bulan</label>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          {reportType === 'semester' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pilih Semester</label>
              <select
                value={targetSemester}
                onChange={(e) => setTargetSemester(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="Ganjil 2025/2026">Semester Ganjil 2025/2026</option>
                <option value="Genap 2025/2026">Semester Genap 2025/2026</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Filter Jurusan</label>
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            >
              <option value="ALL">Semua Konsentrasi Keahlian</option>
              {MAJORS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name.split('(')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Official Printable Document Container (A4 Printable Layout) */}
      <div 
        ref={printContainerRef}
        className="bg-white rounded-xl border border-slate-300 p-6 sm:p-10 shadow-sm text-slate-900 print:shadow-none print:border-none print:p-0 max-w-4xl mx-auto"
      >
        {/* Kop Surat Resmi SMKN 1 JEMBER */}
        <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 flex items-center justify-between gap-4">
          <SchoolLogo size={75} src={settings?.logoUrl} />
          <div className="text-center flex-1">
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-700">
              PEMERINTAH PROVINSI JAWA TIMUR
            </h4>
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-700">
              DINAS PENDIDIKAN
            </h4>
            <h4 className="text-xs font-bold tracking-wider uppercase text-slate-700">
              CABANG DINAS PENDIDIKAN WILAYAH JEMBER
            </h4>
            <h2 className="text-lg sm:text-xl font-extrabold uppercase text-slate-950 tracking-tight mt-0.5">
              {schoolName}
            </h2>
            <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
              {schoolAddress} • Telepon: {schoolPhone}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              Website: {schoolWebsite} • Email: {schoolEmail}
            </p>
          </div>
          <div className="w-[75px] hidden sm:block shrink-0" />
        </div>

        {/* Judul Laporan */}
        <div className="text-center mb-6">
          <h2 className="text-base font-bold uppercase underline tracking-wide">
            {reportType === 'harian' && 'BERITA ACARA KETERLAMBATAN SISWA HARIAN'}
            {reportType === 'mingguan' && 'REKAPITULASI KETERLAMBATAN SISWA MINGGUAN'}
            {reportType === 'bulanan' && 'LAPORAN REKAPITULASI KETERLAMBATAN BULANAN'}
            {reportType === 'semester' && 'LAPORAN EVALUASI KEDISIPLINAN SISWA SEMESTER'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {reportType === 'harian' && `Hari / Tanggal: ${formatIndonesianDate(targetDate)}`}
            {reportType === 'mingguan' && `Periode 7 Hari s/d ${formatIndonesianDate(targetDate)}`}
            {reportType === 'bulanan' && `Bulan Periode: ${targetMonth}`}
            {reportType === 'semester' && `Tahun Ajaran 2025/2026 (${targetSemester})`}
          </p>
        </div>

        {/* Ringkasan Angka Laporan */}
        <div className="grid grid-cols-3 gap-3 mb-5 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
          <div>
            <span className="text-slate-500 block">Total Siswa Terlambat:</span>
            <strong className="text-sm font-mono text-slate-900">{filteredRecords.length} Orang</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Total Menit Keterlambatan:</span>
            <strong className="text-sm font-mono text-slate-900">{totalMenit} Menit</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Rata-Rata Selisih Waktu:</span>
            <strong className="text-sm font-mono text-slate-900">{avgMenit} Menit / Siswa</strong>
          </div>
        </div>

        {/* Tabel Data Rekapitulasi */}
        <div className="border border-slate-900 rounded-sm overflow-hidden mb-8">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 font-bold text-slate-900">
                <th className="py-2 px-2 border-r border-slate-900 text-center w-8">No</th>
                <th className="py-2 px-2 border-r border-slate-900">Tanggal &amp; Jam</th>
                <th className="py-2 px-2 border-r border-slate-900">NIS</th>
                <th className="py-2 px-2 border-r border-slate-900">Nama Siswa</th>
                <th className="py-2 px-2 border-r border-slate-900">Kelas</th>
                <th className="py-2 px-2 border-r border-slate-900">Alasan</th>
                <th className="py-2 px-2 border-r border-slate-900">Sanksi Edukatif</th>
                <th className="py-2 px-2 text-center w-16">TTD Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500 italic">
                    Nihil. Tidak terdapat catatan keterlambatan pada periode ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, index) => (
                  <tr key={r.id}>
                    <td className="py-2 px-2 border-r border-slate-300 text-center font-mono">
                      {index + 1}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-300 whitespace-nowrap font-mono">
                      {r.date} ({r.time})
                    </td>
                    <td className="py-2 px-2 border-r border-slate-300 font-mono">
                      {r.studentNis}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-300 font-semibold">
                      {r.studentName}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-300 whitespace-nowrap">
                      {r.className}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-300 max-w-[140px] truncate">
                      {r.reason}
                    </td>
                    <td className="py-2 px-2 border-r border-slate-300 max-w-[150px] truncate">
                      {r.sanction}
                    </td>
                    <td className="py-2 px-2 text-center text-[9px] text-slate-400">
                      ................
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Kolom Pengesahan Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-xs text-slate-900 pt-4">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-semibold">Wakil Kepala Sekolah Bidang Kesiswaan</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{vicePrincipalName}</p>
            <p className="text-[11px] font-mono">NIP. {vicePrincipalNip}</p>
          </div>
          <div className="text-center">
            <p>Jember, {formatIndonesianDate(new Date().toISOString().split('T')[0])}</p>
            <p className="font-semibold">Koordinator Petugas Piket Kesiswaan</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">Hendra Setiawan, S.Pd.</p>
            <p className="text-[11px] font-mono">NIP. 19820719 200801 1 012</p>
          </div>
        </div>
      </div>
    </div>
  );
};
