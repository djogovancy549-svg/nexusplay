import React, { useState } from 'react';
import { X, Cloud, Database, ExternalLink, RefreshCw, CheckCircle2, ShieldCheck, Terminal, Save, RotateCcw, Edit3 } from 'lucide-react';
import { getGoogleConfig, saveGoogleConfig, resetGoogleConfig, getSyncLogs } from '../services/googleService';
import { SyncLog, GoogleConfig } from '../types';

interface GoogleSyncPanelProps {
  onClose: () => void;
  onRefreshApps: () => void;
}

export const GoogleSyncPanel: React.FC<GoogleSyncPanelProps> = ({ onClose, onRefreshApps }) => {
  const [config, setConfig] = useState<GoogleConfig>(getGoogleConfig());
  const [sheetUrl, setSheetUrl] = useState(config.SHEET_URL);
  const [webhookUrl, setWebhookUrl] = useState(config.WEBHOOK_URL);
  const [driveFolderId, setDriveFolderId] = useState(config.DRIVE_FOLDER_ID);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logs, setLogs] = useState<SyncLog[]>(getSyncLogs());
  const [syncing, setSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveGoogleConfig({
      SHEET_URL: sheetUrl.trim(),
      WEBHOOK_URL: webhookUrl.trim(),
      DRIVE_FOLDER_ID: driveFolderId.trim()
    });
    setConfig(updated);
    setSavedSuccess(true);
    setIsEditing(false);
    setLogs(getSyncLogs());
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Kembalikan konfigurasi URL Google Sheet & Drive ke pengaturan awal?')) {
      const reset = resetGoogleConfig();
      setConfig(reset);
      setSheetUrl(reset.SHEET_URL);
      setWebhookUrl(reset.WEBHOOK_URL);
      setDriveFolderId(reset.DRIVE_FOLDER_ID);
      setLogs(getSyncLogs());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    await new Promise(res => setTimeout(res, 900));
    setLogs(getSyncLogs());
    setSyncing(false);
    onRefreshApps();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Google Sheet & Drive Settings</h2>
              <p className="text-xs text-slate-500">Kustomisasi dan ganti URL Google Sheet, Webhook, dan Drive Folder</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan link Google Sheet & Drive berhasil disimpan dan diperbarui!</span>
          </div>
        )}

        {/* Editable Google Configuration Section */}
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Konfigurasi Link Google (Bisa Diedit & Diganti)</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Mode Kunci' : 'Edit Link'}</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1"
                title="Reset ke Default"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            {/* Google Sheet URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-semibold">Google Sheet URL:</label>
                {sheetUrl && (
                  <a
                    href={sheetUrl}
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
                value={sheetUrl}
                disabled={!isEditing}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                  isEditing
                    ? 'bg-white dark:bg-slate-900 border-blue-500 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Link spreadsheet tempat database katalog dan catatan instalasi aplikasi tersimpan.
              </p>
            </div>

            {/* Google Apps Script Webhook URL */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Google Apps Script Webhook URL:
              </label>
              <input
                type="url"
                required
                value={webhookUrl}
                disabled={!isEditing}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                  isEditing
                    ? 'bg-white dark:bg-slate-900 border-blue-500 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Endpoint Webhook Apps Script untuk pengiriman otomatis metadata APK/AAB.
              </p>
            </div>

            {/* Google Drive Folder ID */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Google Drive Folder ID / Repository:
              </label>
              <input
                type="text"
                required
                value={driveFolderId}
                disabled={!isEditing}
                onChange={(e) => setDriveFolderId(e.target.value)}
                placeholder="ID Folder Google Drive"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono transition-all outline-none ${
                  isEditing
                    ? 'bg-white dark:bg-slate-900 border-blue-500 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-not-allowed'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                ID folder Google Drive tempat file biner .apk dan .aab diarsipkan.
              </p>
            </div>

            {/* Save Buttons when editing */}
            {isEditing && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setSheetUrl(config.SHEET_URL);
                    setWebhookUrl(config.WEBHOOK_URL);
                    setDriveFolderId(config.DRIVE_FOLDER_ID);
                    setIsEditing(false);
                  }}
                  className="px-3.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Link Baru</span>
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Sync Actions */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-500">
            Perubahan link langsung aktif untuk semua proses sinkronisasi berikutnya.
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={syncing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Menghubungkan...' : 'Force Sync Sekarang'}</span>
          </button>
        </div>

        {/* Sync Logs History */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-blue-600" />
            <span>Riwayat Audit & Sinkronisasi</span>
          </h3>

          <div className="space-y-2 max-h-44 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{log.action}</span>
                  </div>
                  <div className="text-slate-500 mt-0.5 text-[11px] truncate">{log.details}</div>
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
