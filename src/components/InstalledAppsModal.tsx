import React from 'react';
import { X, Package, Trash2, CheckCircle2, ShieldCheck, Download } from 'lucide-react';
import { AppItem } from '../types';
import { AppIcon } from './AppIcon';

interface InstalledAppsModalProps {
  installedApps: AppItem[];
  onClose: () => void;
  onUninstall: (appId: string) => void;
  onSelectApp: (app: AppItem) => void;
}

export const InstalledAppsModal: React.FC<InstalledAppsModalProps> = ({
  installedApps,
  onClose,
  onUninstall,
  onSelectApp
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Installed Apps & Bundles</h2>
              <p className="text-xs text-slate-500">Manage installed APKs and AAB packages on your device</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {installedApps.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">No apps installed</h3>
            <p className="text-xs text-slate-500 mt-1">Browse the store and install APK or AAB apps to see them here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {installedApps.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div
                  onClick={() => {
                    onClose();
                    onSelectApp(app);
                  }}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer group"
                >
                  <AppIcon
                    name={app.name}
                    iconUrl={app.iconUrl}
                    className="w-12 h-12 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                        {app.name}
                      </h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        app.fileType === 'AAB' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700' : 'bg-amber-100 dark:bg-amber-950 text-amber-700'
                      }`}>
                        {app.fileType}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono truncate">{app.packageName} · v{app.version}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Secure</span>
                  </span>
                  <button
                    onClick={() => onUninstall(app.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                    title="Uninstall App"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
