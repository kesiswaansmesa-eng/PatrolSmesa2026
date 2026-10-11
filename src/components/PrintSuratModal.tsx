import React, { useState, useRef } from 'react';
import { Student, LateRecord, AppSettings } from '../types/patrol';
import { SchoolLogo } from './SchoolLogo';
import { formatIndonesianDate } from '../utils/storage';
import { exportElementToPDF } from '../utils/pdfExport';
import { X, Printer, FileText, Download, Loader2, FileDown } from 'lucide-react';

interface PrintSuratModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: LateRecord | null;
  student?: Student | null;
  mode?: 'panggilan' | 'pernyataan';
  violationCount?: number;
  settings?: AppSettings;
}

export const PrintSuratModal: React.FC<PrintSuratModalProps> = ({
  isOpen,
  onClose,
  record,
  student,
  mode = 'panggilan',
  violationCount = 3,
  settings,
}) => {
  const [docType, setDocType] = useState<'panggilan' | 'pernyataan'>(mode);
  const [meetingDate, setMeetingDate] = useState('2026-10-14'); // Next Monday
  const [meetingTime, setMeetingTime] = useState('08:30 WIB');
  const [meetingRoom, setMeetingRoom] = useState('Ruang Kesiswaan & BK (Gedung A Lt. 1)');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !student) return null;

  const schoolName = settings?.schoolName || 'SEKOLAH MENENGAH KEJURUAN NEGERI 1 JEMBER';
  const schoolAddress = settings?.schoolAddress || 'Jl. Jambu No.17 Patrang - Jember';
  const schoolPhone = settings?.schoolPhone || '(0331) 337486';
  const schoolEmail = settings?.schoolEmail || 'kesiswaansmesa@gmail.com';
  const schoolWebsite = settings?.schoolWebsite || 'smkn1jember.sch.id';
  const vicePrincipalName = settings?.vicePrincipalName || 'Drs. H. Mulyono, M.Pd.';
  const vicePrincipalNip = settings?.vicePrincipalNip || '19680512 199303 1 008';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printContentRef.current) return;
    setIsExportingPDF(true);
    try {
      const sanitizedName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
      const docLabel = docType === 'panggilan' ? 'Surat_Panggilan_Ortu' : 'Surat_Pernyataan_Disiplin';
      const fileName = `${docLabel}_${sanitizedName}_${student.nis}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      await exportElementToPDF(printContentRef.current, fileName, {
        orientation: 'p',
        title: `${docType === 'panggilan' ? 'Surat Panggilan Orang Tua' : 'Surat Pernyataan Kedisiplinan'} - ${student.name}`,
      });
    } catch (err) {
      console.error('Gagal generate PDF surat:', err);
      window.print();
    } finally {
      setIsExportingPDF(false);
    }
  };

  const todayStr = formatIndonesianDate(new Date().toISOString().split('T')[0]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden my-4">
        {/* Top Controls Bar (Hidden during printing) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">Dokumen Cetak SMKN 1 Jember</span>
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setDocType('panggilan')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  docType === 'panggilan'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Surat Panggilan Ortu
              </button>
              <button
                onClick={() => setDocType('pernyataan')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  docType === 'pernyataan'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Surat Pernyataan Siswa
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isExportingPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-lg transition-colors shadow-xs"
              title="Unduh langsung file PDF ke PC atau Google Drive"
            >
              {isExportingPDF ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengunduh PDF...</span>
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs"
              title="Buka dialog cetak printer browser"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Printer</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Letter Body */}
        <div 
          ref={printContentRef}
          className="p-8 sm:p-12 text-slate-900 bg-white max-h-[82vh] overflow-y-auto print:max-h-none print:p-0"
        >
          {/* KOP RESMI */}
          <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 flex items-center justify-between gap-4">
            <SchoolLogo size={75} src={settings?.logoUrl} />
            <div className="text-center flex-1">
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-800">
                PEMERINTAH PROVINSI JAWA TIMUR
              </h4>
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-800">
                DINAS PENDIDIKAN
              </h4>
              <h4 className="text-[11px] font-bold tracking-wider uppercase text-slate-800">
                CABANG DINAS PENDIDIKAN WILAYAH JEMBER
              </h4>
              <h2 className="text-lg sm:text-xl font-black uppercase text-slate-950 tracking-tight mt-0.5">
                SEKOLAH MENENGAH KEJURUAN NEGERI 1 JEMBER
              </h2>
              <p className="text-[11px] text-slate-700 leading-tight mt-0.5">
                Jl. Jambu No.17 Patrang - Jember • Telepon: (0331) 337486
              </p>
              <p className="text-[10px] text-slate-600 font-mono">
                Website: smkn1jember.sch.id • Email: kesiswaansmesa@gmail.com
              </p>
            </div>
            <div className="w-[75px] hidden sm:block shrink-0" />
          </div>

          {/* DOKUMEN 1: SURAT PANGGILAN ORANG TUA */}
          {docType === 'panggilan' && (
            <div className="space-y-4 text-xs leading-relaxed">
              {/* Nomor Surat & Lampiran */}
              <div className="flex justify-between items-start text-xs pt-2">
                <table>
                  <tbody>
                    <tr>
                      <td className="w-20 font-medium">Nomor</td>
                      <td className="w-4">:</td>
                      <td className="font-mono">421.5 / 842 / 101.6.2.21 / 2026</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Lampiran</td>
                      <td>:</td>
                      <td>1 (satu) lembar</td>
                    </tr>
                    <tr>
                      <td className="font-medium">Perihal</td>
                      <td>:</td>
                      <td className="font-bold underline">Panggilan Orang Tua / Wali Siswa</td>
                    </tr>
                  </tbody>
                </table>
                <div className="text-right">
                  <p>Jember, {todayStr}</p>
                </div>
              </div>

              {/* Penerima */}
              <div className="pt-2">
                <p>Kepada Yth.</p>
                <p className="font-bold">Bapak / Ibu Orang Tua / Wali Murid dari {student.name}</p>
                <p>di Tempat</p>
              </div>

              {/* Paragraf Pembuka */}
              <p className="pt-2">
                Dengan hormat,
                <br />
                Sehubungan dengan hasil evaluasi kedisiplinan dan tata tertib siswa SMK Negeri 1 Jember Tahun Ajaran 2025/2026, bersama ini kami mengharap kehadiran Bapak / Ibu Orang Tua / Wali Siswa pada:
              </p>

              {/* Jadwal Menghadap */}
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 mx-4 my-2">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-28 font-semibold py-1">Hari / Tanggal</td>
                      <td className="w-4">:</td>
                      <td className="font-bold">{formatIndonesianDate(meetingDate)}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-1">Waktu</td>
                      <td className="w-4">:</td>
                      <td className="font-mono font-bold">{meetingTime}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-1">Tempat</td>
                      <td className="w-4">:</td>
                      <td>{meetingRoom}</td>
                    </tr>
                    <tr>
                      <td className="font-semibold py-1">Menghadap</td>
                      <td className="w-4">:</td>
                      <td>Wakil Kepala Sekolah Bidang Kesiswaan &amp; Guru BK</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Keterangan Siswa */}
              <p>Guna melakukan pembinaan dan musyawarah terkait kedisiplinan putra/putri Bapak/Ibu:</p>
              <div className="mx-4">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-28 py-0.5">Nama Siswa</td>
                      <td className="w-4">:</td>
                      <td className="font-bold">{student.name}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">NIS / NISN</td>
                      <td>:</td>
                      <td className="font-mono">{student.nis} / {student.nisn}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Kelas / Jurusan</td>
                      <td>:</td>
                      <td>{student.className} ({student.majorId})</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Wali Kelas</td>
                      <td>:</td>
                      <td>{student.waliKelas}</td>
                    </tr>
                    <tr>
                      <td className="py-0.5">Pelanggaran</td>
                      <td>:</td>
                      <td className="font-semibold text-red-700">
                        Telah terlambat datang ke sekolah sebanyak {violationCount} kali (Semester Ganjil 2025/2026)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="pt-2">
                Mengingat pentingnya koordinasi antara pihak sekolah dan orang tua demi masa depan kedisiplinan ananda, kehadiran Bapak/Ibu sangat kami harapkan tepat pada waktunya.
              </p>

              <p>Atas perhatian, kehadiran, dan kerja sama Bapak/Ibu, kami sampaikan terima kasih.</p>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 pt-8">
                <div className="text-center">
                  <p>Wali Kelas,</p>
                  <div className="h-20" />
                  <p className="font-bold underline uppercase">{student.waliKelas}</p>
                  <p className="text-[10px] text-slate-500">Guru Wali Rombel {student.className}</p>
                </div>
                <div className="text-center">
                  <p>Wakil Kepala Sekolah Bidang Kesiswaan,</p>
                  <div className="h-20" />
                  <p className="font-bold underline uppercase">Drs. H. Mulyono, M.Pd.</p>
                  <p className="text-[10px] font-mono">NIP. 19680512 199303 1 008</p>
                </div>
              </div>
            </div>
          )}

          {/* DOKUMEN 2: SURAT PERNYATAAN SISWA */}
          {docType === 'pernyataan' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold uppercase underline">
                  SURAT PERNYATAAN KEDISIPLINAN SISWA
                </h2>
                <p className="text-[11px] text-slate-600">SMK NEGERI 1 JEMBER</p>
              </div>

              <p>Saya yang bertanda tangan di bawah ini:</p>
              <div className="mx-4">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-28 py-1">Nama Lengkap</td>
                      <td className="w-4">:</td>
                      <td className="font-bold">{student.name}</td>
                    </tr>
                    <tr>
                      <td className="py-1">NIS / NISN</td>
                      <td>:</td>
                      <td className="font-mono">{student.nis} / {student.nisn}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Kelas / Jurusan</td>
                      <td>:</td>
                      <td>{student.className}</td>
                    </tr>
                    <tr>
                      <td className="py-1">Nama Orang Tua</td>
                      <td>:</td>
                      <td>{student.parentName}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="pt-2">
                Menyatakan dengan sesungguhnya bahwa saya mengakui telah melakukan pelanggaran tata tertib sekolah berupa <strong>keterlambatan hadir ke sekolah sebanyak {violationCount} kali</strong>.
              </p>

              <p>Dengan ini saya berjanji dan berkomitmen:</p>
              <ol className="list-decimal list-inside space-y-1 pl-2 text-slate-800">
                <li>Hadir di sekolah sebelum pukul 07.00 WIB setiap hari sekolah.</li>
                <li>Mengatur waktu tidur dan berangkat dari rumah minimal 30 menit sebelum bel berbunyi.</li>
                <li>Menaati seluruh tata tertib dan sanksi edukatif yang ditetapkan oleh SMK Negeri 1 Jember.</li>
                <li>Apabila saya mengulangi pelanggaran yang sama, saya bersedia menerima sanksi disiplin yang lebih berat sesuai ketentuan sekolah.</li>
              </ol>

              <p className="pt-2">
                Demikian surat pernyataan ini saya buat dengan penuh kesadaran dan tanpa paksaan dari pihak manapun.
              </p>

              {/* Tanda Tangan 3 Kolom */}
              <div className="grid grid-cols-3 gap-4 pt-10 text-center">
                <div>
                  <p>Orang Tua / Wali Murid,</p>
                  <div className="h-20" />
                  <p className="font-bold underline">{student.parentName}</p>
                </div>
                <div>
                  <p>Jember, {todayStr}</p>
                  <p className="text-[10px] text-slate-400">Materai Rp 10.000</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{student.name}</p>
                  <p className="text-[10px]">Siswa Bersangkutan</p>
                </div>
                <div>
                  <p>Mengetahui,</p>
                  <p>Wali Kelas,</p>
                  <div className="h-16" />
                  <p className="font-bold underline">{student.waliKelas}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
