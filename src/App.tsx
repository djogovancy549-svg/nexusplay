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
import { AppItem, AppCategory } from './types';
import { getStoredApps, saveStoredApps, getInstalledAppIds, saveInstalledAppIds, syncToGoogleSheetAndDrive } from './services/googleService';
import { Store, Database, ShieldAlert, ShieldCheck } from 'lucide-react';

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

  const triggerSecurityWarning = (msg: string) => {
    setSecurityNotice(msg);
    setTimeout(() => setSecurityNotice(null), 3500);
  };

  const handlePublishApp = async (newApp: AppItem) => {
    const updated = [newApp, ...apps];
    setApps(updated);
    saveStoredApps(updated);
  };

  const handleDeleteApp = (appId: string) => {
    const updated = apps.filter(a => a.id !== appId);
    setApps(updated);
    saveStoredApps(updated);
  };

  const handleInstallApp = async (app: AppItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!installedIds.includes(app.id)) {
      const updated = [...installedIds, app.id];
      setInstalledIds(updated);
      saveInstalledAppIds(updated);
    }
  };

  const handleUninstallApp = (appId: string) => {
    const updated = installedIds.filter(id => id !== appId);
    setInstalledIds(updated);
    saveInstalledAppIds(updated);
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
        onOpenSyncPanel={() => setShowSyncPanel(true)}
        onOpenInstalled={() => setShowInstalled(true)}
        installedCount={installedIds.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeMode={activeMode}
        onSwitchMode={(mode) => setActiveMode(mode)}
      />

      {/* Main Container */}
      {activeMode === 'developer' ? (
        <DeveloperConsole
          apps={apps}
          onPublishApp={handlePublishApp}
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
            <button onClick={() => setShowSyncPanel(true)} className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>Google Sheet & Drive Synced</span>
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
    </div>
  );
}
