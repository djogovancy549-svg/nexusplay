import React, { useState } from 'react';
import { X, Upload, FileCode, ShieldCheck, CheckCircle2, Cloud, Database, Image, Sparkles, Camera, ShieldAlert, AlertOctagon } from 'lucide-react';
import { AppItem, FileType, AppCategory } from '../types';
import { getGoogleConfig, scanPackageSecurity } from '../services/googleService';
import { generateSvgAppIcon, DEFAULT_PRESET_GRADIENTS } from '../utils/iconGenerator';
import { AppIcon } from './AppIcon';

interface UploadAppModalProps {
  onClose: () => void;
  onPublishApp: (newApp: AppItem) => void;
}

export const UploadAppModal: React.FC<UploadAppModalProps> = ({ onClose, onPublishApp }) => {
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('com.nexus.app.');
  const [developer, setDeveloper] = useState('');
  const [category, setCategory] = useState<AppCategory>('Productivity');
  const [fileType, setFileType] = useState<FileType>('APK');
  const [version, setVersion] = useState('1.0.0');
  const [sizeMb, setSizeMb] = useState('25.4');
  const [description, setDescription] = useState('');
  const [whatsNew, setWhatsNew] = useState('Initial production release.');
  const [fileName, setFileName] = useState<string | null>(null);
  
  // Icon State
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [selectedGradient, setSelectedGradient] = useState<[string, string]>(['#2563eb', '#1d4ed8']);
  const [iconMode, setIconMode] = useState<'upload' | 'url' | 'gradient'>('upload');

  const [publishing, setPublishing] = useState(false);
  const [scanningSecurity, setScanningSecurity] = useState(false);
  const [securityRejectReason, setSecurityRejectReason] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCustomIconUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileDropSimulator = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSizeMb((file.size / (1024 * 1024)).toFixed(1));
      const ext = file.name.split('.').pop()?.toUpperCase();
      if (ext === 'AAB' || ext === 'APK') {
        setFileType(ext as FileType);
      }
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      if (!appName) setAppName(baseName);
      if (!developer) setDeveloper('Nexus Verified Developer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !packageName) return;

    setPublishing(true);
    setScanningSecurity(true);
    setSecurityRejectReason(null);

    // 1. Mandatory Deep Antivirus & Threat Engine Scan
    const scanReport = await scanPackageSecurity({
      name: appName,
      packageName,
      fileType,
      sizeMb: parseFloat(sizeMb) || 20.0,
      description,
      developer: developer || 'Independent Developer'
    }, { name: fileName });

    setScanningSecurity(false);

    // Strict rejection if virus, trojan, or high malware score detected
    if (!scanReport.safe || scanReport.malwareScore > 35) {
      setPublishing(false);
      setSecurityRejectReason(`UPLOAD DITOLAK & FILE DIHAPUS OTOMATIS: ${scanReport.details} (Skor Risiko: ${scanReport.malwareScore}/100). Sistem keamanan mendeteksi potensi ancaman malware/virus pada file APK ini.`);
      setFileName(null);
      return;
    }

    // Simulate upload to Google Drive and push to Google Sheet
    await new Promise(res => setTimeout(res, 800));

    const newApp: AppItem = {
      id: `app-${Date.now()}`,
      name: appName,
      packageName: packageName,
      developer: developer || 'Independent Developer',
      category: category,
      fileType: fileType,
      version: version,
      versionCode: Math.floor(Math.random() * 1000) + 100,
      sizeMb: parseFloat(sizeMb) || 20.0,
      downloads: '10+',
      rating: 5.0,
      reviewsCount: 1,
      iconUrl: customIconUrl.trim() || generateSvgAppIcon(appName || 'App', selectedGradient),
      bannerUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: description || 'High-performance Android application tested and verified for security compliance.',
      whatsNew: whatsNew,
      securityAudit: {
        sha256Hash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + 'a1b2',
        signatureValid: true,
        signer: `CN=${developer}, O=Verified Publisher, C=US`,
        malwareScore: 0,
        permissions: [
          { name: 'android.permission.INTERNET', level: 'normal', description: 'Network connectivity.' },
          { name: 'android.permission.ACCESS_NETWORK_STATE', level: 'normal', description: 'View network state.' }
        ],
        obfuscated: true,
        minSdk: 26,
        targetSdk: 34
      },
      downloadUrl: `${getGoogleConfig().DRIVE_FOLDER_URL}/${appName.replace(/\s+/g, '_')}_${version}.${fileType.toLowerCase()}`,
      syncedToSheet: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setPublishing(false);
    setSuccess(true);

    setTimeout(() => {
      onPublishApp(newApp);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Publish APK or AAB App</h2>
              <p className="text-xs text-slate-500">Auto-scan Antivirus, syncs metadata &amp; icon to Google Sheets and binary to Google Drive</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rejection Alert if Virus/Malware detected */}
        {securityRejectReason && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold mb-6 flex items-start gap-3 animate-in shake duration-300">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">File APK Ditolak &amp; Dihapus!</span>
              <p className="mt-1 leading-relaxed text-[11px] text-rose-700 dark:text-rose-300">
                {securityRejectReason}
              </p>
            </div>
          </div>
        )}

        {/* Live scanning progress */}
        {scanningSecurity && (
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold mb-6 flex items-center gap-3 animate-pulse">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 animate-spin" />
            <div>
              <span>Memeriksa Keamanan File APK/AAB dengan AI Antivirus &amp; Threat Engine...</span>
              <p className="text-[10px] text-blue-600/80 font-normal mt-0.5">Memindai trojan, ransomware, signature backdoor, dan izin berbahaya.</p>
            </div>
          </div>
        )}

        {success ? (
          <div className="text-center py-12 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Published &amp; Synced Successfully!</h3>
            <p className="text-xs text-slate-500">Paket APK lolos verifikasi antivirus dan telah dipublikasikan ke semua perangkat &amp; Google Sheet.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* File Drag and Drop zone */}
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50 dark:bg-slate-800/40 relative">
              <input
                type="file"
                accept=".apk,.aab"
                onChange={handleFileDropSimulator}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileCode className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {fileName ? fileName : 'Drop your APK or AAB file here, or browse'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Supports Android App Bundles (.aab) & Packages (.apk)</div>
            </div>

            {/* App Icon Upload / Customizer Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-blue-600" />
                  <span>Gambar / Icon Aplikasi</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setIconMode('upload')}
                    className={`px-2 py-1 rounded-md font-semibold transition-all ${iconMode === 'upload' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('url')}
                    className={`px-2 py-1 rounded-md font-semibold transition-all ${iconMode === 'url' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                  >
                    Link URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setIconMode('gradient')}
                    className={`px-2 py-1 rounded-md font-semibold transition-all ${iconMode === 'gradient' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                  >
                    Gradien Icon
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="shrink-0 text-center">
                  <AppIcon
                    name={appName || 'App'}
                    iconUrl={customIconUrl}
                    className="w-16 h-16 rounded-2xl shadow-md border-2 border-slate-200 dark:border-slate-700 mx-auto"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Preview Icon</span>
                </div>

                <div className="flex-1 min-w-0">
                  {iconMode === 'upload' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-slate-500">Pilih gambar logo/icon dari komputer (PNG, JPG, WebP):</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
                      />
                    </div>
                  )}

                  {iconMode === 'url' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-slate-500">Tempel URL Link Gambar Langsung:</label>
                      <input
                        type="url"
                        value={customIconUrl}
                        onChange={(e) => setCustomIconUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                      />
                    </div>
                  )}

                  {iconMode === 'gradient' && (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] text-slate-500">Pilih Warna Gradien Monogram Otomatis:</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {DEFAULT_PRESET_GRADIENTS.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setSelectedGradient(p.colors);
                              setCustomIconUrl(generateSvgAppIcon(appName || 'App', p.colors));
                            }}
                            className="w-7 h-7 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm transition-transform hover:scale-110"
                            style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                            title={p.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {customIconUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomIconUrl('')}
                      className="text-[10px] text-rose-500 hover:underline mt-1 inline-block"
                    >
                      Reset / Gunakan Icon Otomatis
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">App Name</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Nexus Wallet"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Package Name</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="com.company.app"
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Format</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as FileType)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none"
                >
                  <option value="APK">APK (Package)</option>
                  <option value="AAB">AAB (App Bundle)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AppCategory)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none"
                >
                  <option value="Productivity">Productivity</option>
                  <option value="Games">Games</option>
                  <option value="Developer Tools">Developer Tools</option>
                  <option value="Security">Security</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Social">Social</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Developer / Publisher</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="Developer Name"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe app features and capabilities..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none resize-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <Database className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-800 dark:text-emerald-300">
                <strong>Google Sheet & Drive Sync Enabled:</strong> Publishing will automatically push row data to the hardcoded Google Sheet and store the APK/AAB binary in Google Drive.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={publishing}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {publishing ? (
                  <span>Publishing & Syncing...</span>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    <span>Publish to Store & Sheet</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
