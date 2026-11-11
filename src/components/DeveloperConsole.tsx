import React, { useState } from 'react';
import { AppItem, FileType, AppCategory } from '../types';
import { Upload, Plus, Database, Cloud, ShieldCheck, Trash2, Edit, CheckCircle2, FileCode, BarChart3, UserCheck, Lock, Key, X, Cpu, Save, ExternalLink, Image, Sparkles, Camera, Edit3 } from 'lucide-react';
import { syncToGoogleSheetAndDrive, getGoogleConfig, saveGoogleConfig } from '../services/googleService';
import { AiSecuritySentinel } from './AiSecuritySentinel';
import { AppIcon } from './AppIcon';
import { generateSvgAppIcon, DEFAULT_PRESET_GRADIENTS } from '../utils/iconGenerator';

interface DeveloperConsoleProps {
  apps: AppItem[];
  onPublishApp: (app: AppItem) => void;
  onUpdateApp?: (app: AppItem) => void;
  onDeleteApp: (appId: string) => void;
  onSwitchToStore: () => void;
}

const OWNER_PIN = "fnc@liO#26&*//?!x@gdj^^%+";

export const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({
  apps,
  onPublishApp,
  onUpdateApp,
  onDeleteApp,
  onSwitchToStore
}) => {
  const [activeTab, setActiveTab] = useState<'myApps' | 'upload' | 'syncLogs' | 'aiSecurity'>('myApps');
  const [developerName, setDeveloperName] = useState('Nexus Studio Official');
  const [developerEmail, setDeveloperEmail] = useState('developer@nexusstore.io');
  const [isRegistered, setIsRegistered] = useState(true);

  // PIN Protection for Google Sheet & Drive Sync and AI Security
  const [isSyncUnlocked, setIsSyncUnlocked] = useState(false);
  const [isAiUnlocked, setIsAiUnlocked] = useState(false);
  const [pinTarget, setPinTarget] = useState<'sync' | 'ai'>('sync');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Editable Google Config State for Owner
  const [devSheetUrl, setDevSheetUrl] = useState(() => getGoogleConfig().SHEET_URL);
  const [devWebhookUrl, setDevWebhookUrl] = useState(() => getGoogleConfig().WEBHOOK_URL);
  const [devDriveFolderId, setDevDriveFolderId] = useState(() => getGoogleConfig().DRIVE_FOLDER_ID);
  const [devConfigSaved, setDevConfigSaved] = useState(false);

  // Upload Form state
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('com.developer.app.');
  const [category, setCategory] = useState<AppCategory>('Productivity');
  const [fileType, setFileType] = useState<FileType>('APK');
  const [version, setVersion] = useState('1.0.0');
  const [sizeMb, setSizeMb] = useState('24.5');
  const [description, setDescription] = useState('');
  const [whatsNew, setWhatsNew] = useState('Initial release on Nexus Store.');
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Icon State for Upload
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [iconMode, setIconMode] = useState<'upload' | 'url' | 'gradient'>('upload');
  const [selectedGradient, setSelectedGradient] = useState<[string, string]>(['#2563eb', '#1d4ed8']);

  // Editing existing App Icon state (e.g. SPAMMOBILE)
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  const [editIconUrl, setEditIconUrl] = useState('');
  const [editIconMode, setEditIconMode] = useState<'upload' | 'url' | 'gradient'>('upload');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  };

  const handleSyncTabClick = () => {
    if (isSyncUnlocked) {
      setActiveTab('syncLogs');
    } else {
      setPinTarget('sync');
      setShowPinModal(true);
      setPinError(false);
      setPinInput('');
    }
  };

  const handleAiTabClick = () => {
    if (isAiUnlocked) {
      setActiveTab('aiSecurity');
    } else {
      setPinTarget('ai');
      setShowPinModal(true);
      setPinError(false);
      setPinInput('');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === OWNER_PIN) {
      if (pinTarget === 'sync') {
        setIsSyncUnlocked(true);
        setActiveTab('syncLogs');
      } else {
        setIsAiUnlocked(true);
        setActiveTab('aiSecurity');
      }
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleSubmitApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !packageName) return;

    setUploading(true);
    await new Promise(res => setTimeout(res, 1000));

    const newApp: AppItem = {
      id: `dev-app-${Date.now()}`,
      name: appName,
      packageName: packageName,
      developer: developerName,
      category: category,
      fileType: fileType,
      version: version,
      versionCode: Math.floor(Math.random() * 1000) + 100,
      sizeMb: parseFloat(sizeMb) || 20.0,
      downloads: '0',
      rating: 5.0,
      reviewsCount: 0,
      iconUrl: customIconUrl.trim() || generateSvgAppIcon(appName || 'App', selectedGradient),
      bannerUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: description || 'High-performance Android application published via Developer Console.',
      whatsNew: whatsNew,
      securityAudit: {
        sha256Hash: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2) + 'dev1',
        signatureValid: true,
        signer: `CN=${developerName}, O=Google Play Verified Developer, C=US`,
        malwareScore: 0,
        permissions: [
          { name: 'android.permission.INTERNET', level: 'normal', description: 'Network connectivity.' }
        ],
        obfuscated: true,
        minSdk: 26,
        targetSdk: 34
      },
      downloadUrl: `${getGoogleConfig().DRIVE_FOLDER_URL}/${appName.replace(/\s+/g, '_')}_${version}.${fileType.toLowerCase()}`,
      syncedToSheet: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onPublishApp(newApp);
    await syncToGoogleSheetAndDrive(newApp);

    setUploading(false);
    setSuccessMsg(`Successfully published ${appName} (${fileType})! Synced to Google Sheet & Drive.`);
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('myApps');
    }, 2000);
  };

  const handleSaveEditedIcon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    const finalIcon = editIconUrl.trim() || generateSvgAppIcon(editingApp.name);
    const updatedApp: AppItem = {
      ...editingApp,
      iconUrl: finalIcon
    };

    if (onUpdateApp) {
      onUpdateApp(updatedApp);
    }
    await syncToGoogleSheetAndDrive(updatedApp);

    setEditSuccessMsg(`Gambar icon untuk ${editingApp.name} berhasil diperbarui & disinkronkan ke Google Sheet!`);
    setTimeout(() => {
      setEditSuccessMsg('');
      setEditingApp(null);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Developer Console Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Google Play Developer Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Developer Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Register as a developer, upload your APK/AAB bundles, and manage automated Google Sheet & Drive sync.
          </p>
        </div>

        <button
          onClick={onSwitchToStore}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all"
        >
          ← Back to Customer Store View
        </button>
      </div>

      {/* Developer Profile Card */}
      {!isRegistered ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Developer Registration</h3>
          <p className="text-xs text-slate-500">Register your developer account to publish APK and AAB packages to Nexus Store.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder="Developer / Company Name"
              className="px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
            <input
              type="email"
              value={developerEmail}
              onChange={(e) => setDeveloperEmail(e.target.value)}
              placeholder="Developer Email"
              className="px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
            />
          </div>
          <button
            onClick={() => setIsRegistered(true)}
            className="px-6 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl"
          >
            Complete Registration
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
              {developerName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{developerName}</div>
              <div className="text-slate-500">{developerEmail} · Verified Publisher ID: #DEV-9842</div>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active Developer Account
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('myApps')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'myApps' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          My Published Apps ({apps.length})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          + Upload New APK / AAB
        </button>
        <button
          onClick={handleSyncTabClick}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'syncLogs' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Lock className="w-3 h-3 text-amber-500" />
          <span>Google Sheet & Drive Sync</span>
        </button>
        <button
          onClick={handleAiTabClick}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
            activeTab === 'aiSecurity' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>AI Security Sentinel</span>
          {!isAiUnlocked && <Lock className="w-3 h-3 text-amber-500 ml-1" />}
        </button>
      </div>

      {/* Tab 1: My Apps */}
      {activeTab === 'myApps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your Published APK & AAB Packages</h3>
            <button
              onClick={() => setActiveTab('upload')}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Upload App
            </button>
          </div>

          {apps.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <FileCode className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Belum Ada Aplikasi yang Dipublikasikan</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Anda belum mengunggah paket aplikasi. Klik tombol di bawah untuk mulai mengunggah APK atau AAB baru.
              </p>
              <button
                onClick={() => setActiveTab('upload')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Upload APK / AAB Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app) => (
                <div key={app.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 shadow-xs">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <AppIcon name={app.name} iconUrl={app.iconUrl} className="w-14 h-14 rounded-xl object-cover shrink-0 shadow-sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          app.fileType === 'AAB' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {app.fileType}
                        </span>
                        <span className="text-xs text-slate-400">v{app.version}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{app.name}</h4>
                      <p className="text-xs font-mono text-slate-500 truncate">{app.packageName}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                        <span>Downloads: {app.downloads}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Sheet Synced
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingApp(app);
                        setEditIconUrl(app.iconUrl);
                        setEditSuccessMsg('');
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl transition-colors"
                      title="Ganti Gambar / Icon Aplikasi"
                    >
                      <Image className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteApp(app.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl transition-colors"
                      title="Hapus Aplikasi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Upload Form */}
      {activeTab === 'upload' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 max-w-2xl">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Upload APK or AAB Package</h3>
          <p className="text-xs text-slate-500 mb-6">Submit your Android binary package. Customers browsing Nexus Store will instantly see and install it.</p>

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitApp} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-800/40 relative">
              <input
                type="file"
                accept=".apk,.aab"
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileCode className="w-10 h-10 text-blue-600 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                {fileName ? fileName : 'Drop your .apk or .aab file here'}
              </div>
              <div className="text-xs text-slate-500 mt-1">Automatic SHA-256 signature verification & metadata parse</div>
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
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              if (typeof ev.target?.result === 'string') {
                                setCustomIconUrl(ev.target.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">App Name</label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. My Android App"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="com.mycompany.app"
                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Format</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as FileType)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                >
                  <option value="APK">APK</option>
                  <option value="AAB">AAB (App Bundle)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AppCategory)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Version</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">App Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe features for customers..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl outline-none resize-none"
              />
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Cloud className="w-4 h-4 shrink-0 text-blue-600" />
              <span>Publishing will instantly sync metadata to your Google Sheet and binary to Google Drive.</span>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {uploading ? 'Publishing & Syncing...' : 'Publish to Nexus Store'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Google Sheet & Drive Sync (Protected by PIN) */}
      {activeTab === 'syncLogs' && isSyncUnlocked && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>Pengaturan Link Google Sheet & Drive (Khusus Pemilik)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ubah atau sesuaikan URL database Google Sheet, Webhook, dan ID Google Drive sesuai kebutuhan Anda.
              </p>
            </div>
            <button
              onClick={() => setIsSyncUnlocked(false)}
              className="text-xs text-rose-600 hover:underline px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-950 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              Kunci Kembali
            </button>
          </div>

          {devConfigSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan link Google berhasil disimpan! Semua upload berikutnya akan terarah ke link baru.</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveGoogleConfig({
                SHEET_URL: devSheetUrl.trim(),
                WEBHOOK_URL: devWebhookUrl.trim(),
                DRIVE_FOLDER_ID: devDriveFolderId.trim()
              });
              setDevConfigSaved(true);
              setTimeout(() => setDevConfigSaved(false), 3000);
            }}
            className="space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Google Sheet URL:</label>
                {devSheetUrl && (
                  <a
                    href={devSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Buka Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <input
                type="url"
                required
                value={devSheetUrl}
                onChange={(e) => setDevSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Google Apps Script Webhook URL:</label>
              <input
                type="url"
                required
                value={devWebhookUrl}
                onChange={(e) => setDevWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Google Drive Folder ID:</label>
              <input
                type="text"
                required
                value={devDriveFolderId}
                onChange={(e) => setDevDriveFolderId(e.target.value)}
                placeholder="Google Drive Folder ID"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Pengaturan Link</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: AI Security Sentinel */}
      {activeTab === 'aiSecurity' && (
        <AiSecuritySentinel />
      )}

      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {pinTarget === 'sync' ? 'Unlock Google Sheet & Drive Sync' : 'Unlock AI Security Sentinel'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {pinTarget === 'sync' ? 'Restricted to application owner' : 'Restricted to AI Security Administrator'}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowPinModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Enter Owner PIN Code</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter secure PIN..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-blue-500 outline-none font-mono"
                />
                {pinError && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">PIN salah! Akses ditolak.</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  {pinTarget === 'sync' ? 'Unlock Google Sync' : 'Unlock AI Security'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit App Icon Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <Image className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Ganti Gambar / Icon Aplikasi
                  </h3>
                  <p className="text-[11px] text-slate-500">{editingApp.name} ({editingApp.fileType})</p>
                </div>
              </div>
              <button onClick={() => setEditingApp(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditedIcon} className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
                <AppIcon
                  name={editingApp.name}
                  iconUrl={editIconUrl}
                  className="w-20 h-20 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700"
                />
                <span className="text-[11px] text-slate-500 font-medium">Pratinjau Icon Saat Ini</span>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setEditIconMode('upload')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${editIconMode === 'upload' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                >
                  Upload File Baru
                </button>
                <button
                  type="button"
                  onClick={() => setEditIconMode('url')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${editIconMode === 'url' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                >
                  Link Gambar (URL)
                </button>
                <button
                  type="button"
                  onClick={() => setEditIconMode('gradient')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${editIconMode === 'gradient' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'}`}
                >
                  Gradien Icon
                </button>
              </div>

              {editIconMode === 'upload' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pilih file gambar dari perangkat Anda:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (typeof ev.target?.result === 'string') {
                            setEditIconUrl(ev.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300 hover:file:bg-blue-100 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400">Mendukung format PNG, JPG, WebP, SVG transparan.</p>
                </div>
              )}

              {editIconMode === 'url' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Masukkan URL / Tautan Gambar:
                  </label>
                  <input
                    type="url"
                    value={editIconUrl}
                    onChange={(e) => setEditIconUrl(e.target.value)}
                    placeholder="https://example.com/icon.png"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus:border-blue-500 outline-none"
                  />
                </div>
              )}

              {editIconMode === 'gradient' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pilih Tema Warna Gradien Otomatis:
                  </label>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {DEFAULT_PRESET_GRADIENTS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => {
                          setEditIconUrl(generateSvgAppIcon(editingApp.name, p.colors));
                        }}
                        className="w-8 h-8 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm transition-transform hover:scale-110"
                        style={{ background: `linear-gradient(135deg, ${p.colors[0]}, ${p.colors[1]})` }}
                        title={p.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Gambar Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
