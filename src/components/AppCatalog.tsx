import React from 'react';
import { Star, ShieldCheck, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { AppItem, AppCategory } from '../types';
import { AppIcon } from './AppIcon';

interface AppCatalogProps {
  apps: AppItem[];
  selectedCategory: AppCategory;
  setSelectedCategory: (cat: AppCategory) => void;
  onSelectApp: (app: AppItem) => void;
  installedIds: string[];
  onInstallApp: (app: AppItem, e: React.MouseEvent) => void;
}

const CATEGORIES: AppCategory[] = ['All', 'Games', 'Productivity', 'Developer Tools', 'Security', 'Utilities', 'Social'];

export const AppCatalog: React.FC<AppCatalogProps> = ({
  apps,
  selectedCategory,
  setSelectedCategory,
  onSelectApp,
  installedIds,
  onInstallApp
}) => {
  return (
    <section className="space-y-6">
      {/* Category Filter Tabs (Functional Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* App Grid */}
      {apps.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900">
            <FileCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Store Masih Kosong</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
            Semua data dummy telah dibersihkan. Developer dapat masuk ke <strong>Developer Console</strong> untuk mulai mendaftarkan dan mengunggah paket APK atau AAB baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => {
            const isInstalled = installedIds.includes(app.id);
            return (
              <div
                key={app.id}
                onClick={() => onSelectApp(app)}
                className="group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-blue-950/20 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top row: Icon, Name, FileType badge */}
                  <div className="flex items-start gap-4 mb-4">
                    <AppIcon
                      name={app.name}
                      iconUrl={app.iconUrl}
                      className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                          app.fileType === 'AAB'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}>
                          {app.fileType}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{app.sizeMb} MB</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {app.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">{app.developer}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div>
                  {/* Metadata & rating */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{app.rating}</span>
                      <span>({app.downloads})</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Secure</span>
                    </div>
                  </div>

                  {/* Install / Open action button */}
                  <button
                    onClick={(e) => onInstallApp(app, e)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isInstalled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
                    }`}
                  >
                    {isInstalled ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Installed (Open)</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Install</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
