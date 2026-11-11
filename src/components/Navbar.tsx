import React from 'react';
import { Store, Cloud, Package, Search, Sun, Moon, UserCheck, Lock, Mail, LogOut, CheckCircle2 } from 'lucide-react';
import { CustomerUser } from '../services/googleService';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenSyncPanel: () => void;
  onOpenInstalled: () => void;
  installedCount: number;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  activeMode: 'store' | 'developer';
  onSwitchMode: (mode: 'store' | 'developer') => void;
  currentUser: CustomerUser | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenSyncPanel,
  onOpenInstalled,
  installedCount,
  darkMode,
  setDarkMode,
  activeMode,
  onSwitchMode,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Nexus Store
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono">Play</span>
            </span>
          </div>
        </div>

        {/* Search Bar Zone (only shown in store mode) */}
        {activeMode === 'store' && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps by name, package (com.xxx)..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Zone 3: Customer Email, Actions & Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Customer Email Registration / Profile Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="flex flex-col text-left max-w-[130px] sm:max-w-[180px] truncate">
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">{currentUser.email}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Terdaftar Google Sheet</span>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors ml-1"
                title="Keluar / Ganti Email"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-500/20 transition-all shrink-0"
              title="Daftarkan Email Pelanggan untuk Akses Google Sheet"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Daftar Email</span>
              <span className="sm:hidden">Daftar</span>
            </button>
          )}

          <button
            onClick={onOpenSyncPanel}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
            title="Google Sheet & Drive Settings (Protected by Owner PIN)"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Sheet & Drive Synced</span>
            <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400 ml-0.5" />
          </button>

          {activeMode === 'store' ? (
            <>
              <button
                onClick={onOpenInstalled}
                className="relative p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                title="My Installed Apps"
              >
                <Package className="w-5 h-5" />
                {installedCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {installedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSwitchMode('developer')}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-xl border border-blue-200 dark:border-blue-800 transition-all whitespace-nowrap shrink-0"
                title="Developer Console (Dilindungi PIN)"
              >
                <UserCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Developer Console</span>
                <Lock className="w-3 h-3 text-amber-500 ml-0.5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onSwitchMode('store')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all whitespace-nowrap shrink-0"
            >
              <Store className="w-4 h-4" />
              <span>Customer Store View</span>
            </button>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

