import React, { useState } from 'react';
import { X, Star, ShieldCheck, Download, CheckCircle2, Lock, Cpu, FileText, ExternalLink, HardDrive, Database } from 'lucide-react';
import { AppItem } from '../types';

interface AppDetailModalProps {
  app: AppItem;
  onClose: () => void;
  isInstalled: boolean;
  onInstall: (app: AppItem) => void;
  onOpenSecurityInspector: (app: AppItem) => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  onClose,
  isInstalled,
  onInstall,
  onOpenSecurityInspector
}) => {
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartInstall = () => {
    if (isInstalled) return;
    setInstalling(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setInstalling(false);
          onInstall(app);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header / Banner */}
        <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
          <img
            src={app.bannerUrl}
            alt={app.name}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-6 left-6 right-6 flex items-end gap-5">
            <img
              src={app.iconUrl}
              alt={app.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-2xl border-2 border-white dark:border-slate-800"
              referrerPolicy="no-referrer"
            />
            <div className="text-white flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  app.fileType === 'AAB' ? 'bg-purple-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {app.fileType} Bundle
                </span>
                <span className="text-xs text-slate-300">v{app.version}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight truncate">
                {app.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">{app.developer}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">Rating</div>
              <div className="flex items-center gap-1 mt-0.5 font-bold text-slate-900 dark:text-white">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{app.rating} / 5.0</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">Downloads</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{app.downloads}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">File Size</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">{app.sizeMb} MB</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">Target SDK</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">Android {app.securityAudit.targetSdk}</div>
            </div>
          </div>

          {/* Action / Install Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-blue-50 dark:bg-blue-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-900/50">
            <div className="flex-1">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Secure Package Verified
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                SHA-256 Signature checked. Stored securely in Google Drive & Sheet sync.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              {installing ? (
                <div className="w-full sm:w-48 bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden h-10 flex items-center px-3 relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                  <span className="relative z-10 text-xs font-bold text-white mx-auto">
                    Installing {progress}%
                  </span>
                </div>
              ) : isInstalled ? (
                <button
                  onClick={() => alert(`Launching ${app.name} in secure sandbox environment...`)}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Open App</span>
                </button>
              ) : (
                <button
                  onClick={handleStartInstall}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Install</span>
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">About this app</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {app.description}
            </p>
          </div>

          {/* What's New */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">What's new in v{app.version}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-3.5 rounded-xl">
              {app.whatsNew}
            </p>
          </div>

          {/* Security & Permissions Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">Security & Permissions Audit</span>
              </div>
              <button
                onClick={() => onOpenSecurityInspector(app)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Full Audit Report</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-slate-500 space-y-1">
              <div>Package Name: <code className="text-slate-700 dark:text-slate-300">{app.packageName}</code></div>
              <div>SHA-256: <code className="text-[10px] text-slate-700 dark:text-slate-300">{app.securityAudit.sha256Hash}</code></div>
              <div>Signer: {app.securityAudit.signer}</div>
            </div>
          </div>

          {/* Google Sheet & Drive Sync Status Badge */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Synced with Google Sheet & Drive Repository</span>
            </div>
            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">Code: {app.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
