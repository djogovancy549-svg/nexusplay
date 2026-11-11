import React, { useState } from 'react';
import { X, Cloud, Database, ExternalLink, RefreshCw, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import { GOOGLE_CONFIG } from '../config/googleConfig';
import { getSyncLogs } from '../services/googleService';
import { SyncLog } from '../types';

interface GoogleSyncPanelProps {
  onClose: () => void;
  onRefreshApps: () => void;
}

export const GoogleSyncPanel: React.FC<GoogleSyncPanelProps> = ({ onClose, onRefreshApps }) => {
  const [logs, setLogs] = useState<SyncLog[]>(getSyncLogs());
  const [syncing, setSyncing] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    await new Promise(res => setTimeout(res, 1000));
    setLogs(getSyncLogs());
    setSyncing(false);
    onRefreshApps();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Sheet & Drive Integration</h2>
              <p className="text-xs text-slate-500">Embedded URLs and real-time backend synchronization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hardcoded URLs Status */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Embedded Google Configuration</span>
          </h3>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Google Sheet URL:</span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <code className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 truncate flex-1">
                  {GOOGLE_CONFIG.SHEET_URL}
                </code>
                <a
                  href={GOOGLE_CONFIG.SHEET_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-1 shrink-0"
                >
                  <span>Open Sheet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Google Apps Script Webhook URL:</span>
              <div className="mt-1">
                <code className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 block truncate">
                  {GOOGLE_CONFIG.WEBHOOK_URL}
                </code>
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium">Google Drive Folder ID:</span>
              <div className="mt-1">
                <code className="bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 block truncate">
                  {GOOGLE_CONFIG.DRIVE_FOLDER_ID}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            All APK/AAB publish events and security audits are logged automatically.
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Force Sync Now'}</span>
          </button>
        </div>

        {/* Sync Logs History */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Sync & Webhook Audit Trail</span>
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{log.action}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5 text-[11px]">{log.details}</div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
