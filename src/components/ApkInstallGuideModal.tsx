import React, { useState } from 'react';
import { X, Smartphone, Laptop, Download, QrCode, CheckCircle2, ShieldCheck, ArrowRight, ExternalLink, HelpCircle, HardDrive } from 'lucide-react';
import { AppItem } from '../types';
import { AppIcon } from './AppIcon';
import { getDirectDownloadUrl } from '../services/googleService';

interface ApkInstallGuideModalProps {
  app: AppItem;
  onClose: () => void;
  onConfirmInstall: () => void;
}

export const ApkInstallGuideModal: React.FC<ApkInstallGuideModalProps> = ({
  app,
  onClose,
  onConfirmInstall
}) => {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'qr' | 'guide'>('download');

  const handleDownloadApkFile = () => {
    setDownloadStarted(true);
    onConfirmInstall();

    // Trigger direct download of APK binary package
    const link = document.createElement('a');
    link.href = getDirectDownloadUrl(app);
    link.download = `${app.name.replace(/\s+/g, '_')}_v${app.version}.${app.fileType.toLowerCase()}`;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadStarted(false);
    }, 3000);
  };

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(currentAppUrl)}`;

  return (
    <div className="fixed inset-0 z-[70] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <AppIcon name={app.name} iconUrl={app.iconUrl} className="w-14 h-14 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {app.fileType} Package
                </span>
                <span className="text-xs text-slate-400 font-mono">v{app.version} · {app.sizeMb} MB</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{app.name}</h3>
              <p className="text-xs text-slate-500">{app.developer}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device Context Notice */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
            <span className="font-bold">Apakah file APK harus di HP?</span>
            <p className="mt-1 text-slate-600 dark:text-slate-300">
              <strong>Ya, file APK adalah aplikasi khusus sistem operasi Android (HP).</strong> Laptop dengan Windows/Mac tidak dapat langsung menginstal APK secara langsung tanpa bantuan emulator (seperti BlueStacks atau WSA).
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'download' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh APK ke Laptop</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Buka Langsung di HP</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'guide' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan Pasang</span>
          </button>
        </div>

        {/* Tab 1: Direct Download */}
        {activeTab === 'download' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>Unduh File Mentah .apk ke Laptop Anda:</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Setelah file APK terunduh ke laptop, Anda bisa:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px] pl-1">
                <li>Kirim ke HP via <strong>WhatsApp Web, Kabel USB, atau Google Drive</strong>.</li>
                <li>Atau jalankan di laptop menggunakan emulator Android (BlueStacks, LDPlayer, Nox).</li>
              </ul>
            </div>

            <button
              onClick={handleDownloadApkFile}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              {downloadStarted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white animate-spin" />
                  <span>Sedang Mengunduh {app.name}.apk...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download File APK Sekarang ({app.sizeMb} MB)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Tab 2: QR Code Scan for Mobile */}
        {activeTab === 'qr' && (
          <div className="text-center space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Arahkan kamera HP Android Anda ke QR Code di bawah untuk langsung membuka &amp; menginstal aplikasi di HP:
            </p>
            <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 inline-block shadow-md">
              <img src={qrCodeUrl} alt="Scan QR Code to open on phone" className="w-44 h-44 mx-auto" />
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate max-w-sm mx-auto">
              {currentAppUrl}
            </div>
          </div>
        )}

        {/* Tab 3: Step-by-step Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>3 Langkah Mudah Memasang APK di HP Android:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px] pl-1 leading-relaxed">
                <li>Buka file <strong>{app.name}.apk</strong> yang telah terunduh di folder <em>Download / File Manager</em> HP Anda.</li>
                <li>Jika muncul peringatan <em>"Instal aplikasi dari sumber tidak dikenal"</em>, aktifkan tombol <strong>Izinkan dari sumber ini (Allow from this source)</strong> di Pengaturan HP.</li>
                <li>Ketuk <strong>Instal</strong>. Aplikasi akan terpasang di HP Anda dan siap digunakan!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Paket APK Terverifikasi Aman &amp; Bebas Virus</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
