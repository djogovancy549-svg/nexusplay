/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AppCatalog } from './components/AppCatalog';
import { AppDetailModal } from './components/AppDetailModal';
import { UploadAppModal } from './components/UploadAppModal';
import { SecurityInspectorModal } from './components/SecurityInspectorModal';
import { GoogleSyncPanel } from './components/GoogleSyncPanel';
import { InstalledAppsModal } from './components/InstalledAppsModal';
import { DeveloperConsole } from './components/DeveloperConsole';
import { ApkInstallGuideModal } from './components/ApkInstallGuideModal';
import { AppItem, AppCategory } from './types';
import {
  getStoredApps,
  saveStoredApps,
  getInstalledAppIds,
  saveInstalledAppIds,
  syncToGoogleSheetAndDrive,
  fetchPublicAppsFromServer,
  fetchServerGoogleConfig,
  publishAppToServer,
  updateAppOnServer,
  deleteAppFromServer,
  getDeveloperPin,
  getDirectDownloadUrl
} from './services/googleService';
import { Store, Database, ShieldAlert, ShieldCheck, Lock, X, UserCheck } from 'lucide-react';

const OWNER_PIN = "fnc@liO#26&*//?!x@gdj^^%+";

export default function App() {
  const [apps, setApps] = useState<AppItem[]>(getStoredApps());
  const [installedIds, setInstalledIds] = useState<string[]>(getInstalledAppIds());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('All');
  const [darkMode, setDarkMode] = useState(false);
  const [activeMode, setActiveMode] = useState<'store' | 'developer'>('store');
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Modals
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [securityApp, setSecurityApp] = useState<AppItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [showInstalled, setShowInstalled] = useState(false);
  const [guideModalApp, setGuideModalApp] = useState<AppItem | null>(null);

  // Sync Panel PIN Protection (Owner)
  const [showSyncPinModal, setShowSyncPinModal] = useState(false);
  const [syncPinInput, setSyncPinInput] = useState('');
  const [syncPinError, setSyncPinError] = useState(false);

  // Developer Console PIN Protection (Developer)
  const [showDevPinModal, setShowDevPinModal] = useState(false);
  const [devPinInput, setDevPinInput] = useState('');
  const [devPinError, setDevPinError] = useState(false);
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);

  // Cybersecurity & Anti-Hacker Protections
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);

    // Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerSecurityWarning('CyberShield: Klik kanan dinonaktifkan untuk perlindungan hak cipta & keamanan aplikasi.');
    };

    // Disable Developer Tools / Shortcut Keys (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
        triggerSecurityWarning('CyberShield: Akses Developer Tools / Inspect Element diblokir oleh sistem keamanan.');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [darkMode]);

  // Fetch shared apps & shared server config on startup (Available to all users, devices, and emails)
  useEffect(() => {
    fetchServerGoogleConfig();
    fetchPublicAppsFromServer().then((sharedApps) => {
      if (sharedApps && Array.isArray(sharedApps) && sharedApps.length > 0) {
        setApps(sharedApps);
      }
    });
  }, []);

  const triggerSecurityWarning = (msg: string) => {
    setSecurityNotice(msg);
    setTimeout(() => setSecurityNotice(null), 3500);
  };

  const handlePublishApp = async (newApp: AppItem) => {
    const updated = [newApp, ...apps];
    setApps(updated);
    saveStoredApps(updated);
    await publishAppToServer(newApp);
  };

  const handleUpdateApp = async (updatedApp: AppItem) => {
    const updated = apps.map(a => a.id === updatedApp.id ? updatedApp : a);
    setApps(updated);
    saveStoredApps(updated);
    if (selectedApp && selectedApp.id === updatedApp.id) {
      setSelectedApp(updatedApp);
    }
    await updateAppOnServer(updatedApp);
  };

  const handleDeleteApp = async (appId: string) => {
    const appToDelete = apps.find(a => a.id === appId);
    const updated = apps.filter(a => a.id !== appId);
    setApps(updated);
    saveStoredApps(updated);
    await deleteAppFromServer(appId, appToDelete?.packageName);
  };

  const handleInstallApp = async (app: AppItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    // If user is on Laptop / PC desktop, open the guide modal with APK download & QR code
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
    if (!isMobile) {
      setGuideModalApp(app);
      return;
    }

    if (!installedIds.includes(app.id)) {
      const updated = [...installedIds, app.id];
      setInstalledIds(updated);
      saveInstalledAppIds(updated);
    }

    const link = document.createElement('a');
    link.href = getDirectDownloadUrl(app);
    link.download = `${app.name.replace(/\s+/g, '_')}_v${app.version}.${app.fileType.toLowerCase()}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUninstallApp = (appId: string) => {
    const updated = installedIds.filter(id => id !== appId);
    setInstalledIds(updated);
    saveInstalledAppIds(updated);
  };

  const handleSwitchMode = (mode: 'store' | 'developer') => {
    if (mode === 'developer') {
      if (isDevUnlocked) {
        setActiveMode('developer');
      } else {
        setShowDevPinModal(true);
        setDevPinInput('');
        setDevPinError(false);
      }
    } else {
      setActiveMode('store');
    }
  };

  const handleVerifyDevPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (devPinInput === getDeveloperPin()) {
      setIsDevUnlocked(true);
      setShowDevPinModal(false);
      setActiveMode('developer');
      setDevPinInput('');
      setDevPinError(false);
    } else {
      setDevPinError(true);
    }
  };

  // Filter apps based on search & category
  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery ||
      app.name.toLowerCase().includes(q) ||
      app.packageName.toLowerCase().includes(q) ||
      app.developer.toLowerCase().includes(q) ||
      app.fileType.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const featuredApp = apps[0] || apps[1];
  const installedAppsList = apps.filter(app => installedIds.includes(app.id));

  const handleOpenSyncProtected = () => {
    setShowSyncPinModal(true);
    setSyncPinInput('');
    setSyncPinError(false);
  };

  const handleVerifySyncPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (syncPinInput === OWNER_PIN) {
      setShowSyncPinModal(false);
      setShowSyncPanel(true);
      setSyncPinInput('');
      setSyncPinError(false);
    } else {
      setSyncPinError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-blue-600 selection:text-white select-none">
      {/* Cybersecurity Toast Notification */}
      {securityNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-bottom-5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          <span className="text-xs font-medium">{securityNotice}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenSyncPanel={handleOpenSyncProtected}
        onOpenInstalled={() => setShowInstalled(true)}
        installedCount={installedIds.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeMode={activeMode}
        onSwitchMode={handleSwitchMode}
      />

      {/* Main Container */}
      {activeMode === 'developer' ? (
        <DeveloperConsole
          apps={apps}
          onPublishApp={handlePublishApp}
          onUpdateApp={handleUpdateApp}
          onDeleteApp={handleDeleteApp}
          onSwitchToStore={() => setActiveMode('store')}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          {/* Hero Spotlight */}
          {!searchQuery && selectedCategory === 'All' && featuredApp && (
            <HeroBanner
              featuredApp={featuredApp}
              onSelectApp={(app) => setSelectedApp(app)}
            />
          )}

          {/* Store Catalog */}
          <AppCatalog
            apps={filteredApps}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectApp={(app) => setSelectedApp(app)}
            installedIds={installedIds}
            onInstallApp={handleInstallApp}
          />
        </main>
      )}

      {/* Footer with CyberShield Status */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Nexus Play Store & CyberShield</span>
            <span className="flex items-center gap-1 text-emerald-600 ml-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Anti-Hacker Shield Active
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleOpenSyncProtected} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Google Sheet & Drive Synced</span>
              <Lock className="w-3 h-3 text-amber-500 ml-0.5" />
            </button>
            <span>v2.5.0 Secure</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedApp && (
        <AppDetailModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          isInstalled={installedIds.includes(selectedApp.id)}
          onInstall={(app) => handleInstallApp(app)}
          onOpenSecurityInspector={(app) => {
            setSelectedApp(null);
            setSecurityApp(app);
          }}
        />
      )}

      {securityApp && (
        <SecurityInspectorModal
          app={securityApp}
          onClose={() => setSecurityApp(null)}
        />
      )}

      {showUpload && (
        <UploadAppModal
          onClose={() => setShowUpload(false)}
          onPublishApp={handlePublishApp}
        />
      )}

      {/* PIN Verification Modal for Google Sheet & Drive Settings */}
      {showSyncPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    PIN Pemilik Diperlukan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Akses Google Sheet & Drive dilindungi keamanan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncPinModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifySyncPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Masukkan PIN Pemilik Aplikasi
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={syncPinInput}
                  onChange={(e) => setSyncPinInput(e.target.value)}
                  placeholder="Masukkan PIN pemilik..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none font-mono"
                />
                {syncPinError && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">
                    PIN salah! Akses ditolak.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSyncPinModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Buka Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSyncPanel && (
        <GoogleSyncPanel
          onClose={() => setShowSyncPanel(false)}
          onRefreshApps={() => setApps(getStoredApps())}
        />
      )}

      {showInstalled && (
        <InstalledAppsModal
          installedApps={installedAppsList}
          onClose={() => setShowInstalled(false)}
          onUninstall={handleUninstallApp}
          onSelectApp={(app) => setSelectedApp(app)}
        />
      )}

      {/* Developer Console PIN Verification Modal */}
      {showDevPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    PIN Developer Console Diperlukan
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Akses dashboard khusus pengembang terverifikasi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDevPinModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVerifyDevPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Masukkan PIN Developer
                </label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={devPinInput}
                  onChange={(e) => setDevPinInput(e.target.value)}
                  placeholder="Masukkan PIN developer..."
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none font-mono"
                />
                {devPinError && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">
                    PIN Developer salah! Akses ditolak.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDevPinModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  Buka Developer Console
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APK Installation Guide for Laptop / PC / Mobile */}
      {guideModalApp && (
        <ApkInstallGuideModal
          app={guideModalApp}
          onClose={() => setGuideModalApp(null)}
          onConfirmInstall={() => {
            if (!installedIds.includes(guideModalApp.id)) {
              const updated = [...installedIds, guideModalApp.id];
              setInstalledIds(updated);
              saveInstalledAppIds(updated);
            }
          }}
        />
      )}
    </div>
  );
}
