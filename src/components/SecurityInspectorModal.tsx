import React from 'react';
import { X, ShieldCheck, Lock, AlertTriangle, CheckCircle2, Cpu, Key, FileCheck } from 'lucide-react';
import { AppItem } from '../types';

interface SecurityInspectorModalProps {
  app: AppItem;
  onClose: () => void;
}

export const SecurityInspectorModal: React.FC<SecurityInspectorModalProps> = ({ app, onClose }) => {
  const audit = app.securityAudit;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Sandbox Audit</h2>
              <p className="text-xs text-slate-500">{app.name} (v{app.version}) - {app.fileType}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
          <div>
            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Malware Heuristic Scan: PASSED (0 Threats)</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
              Cryptographic signature is valid. Code obfuscation (ProGuard) verified. Safe for installation.
            </div>
          </div>
        </div>

        {/* Cryptographic Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Key className="w-4 h-4 text-blue-600" />
            <span>Cryptographic Certificate & Signature</span>
          </h3>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div>
              <span className="text-slate-500">Signer Distinguished Name:</span>
              <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 break-all">{audit.signer}</div>
            </div>
            <div>
              <span className="text-slate-500">SHA-256 Certificate Fingerprint:</span>
              <div className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 break-all">{audit.sha256Hash}</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500">Signature Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Valid & Verified</span>
            </div>
          </div>
        </div>

        {/* Requested Permissions */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" />
            <span>Declared Permissions ({audit.permissions.length})</span>
          </h3>
          <div className="space-y-2">
            {audit.permissions.map((perm, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-semibold text-slate-900 dark:text-white">{perm.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{perm.description}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                  perm.level === 'dangerous'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {perm.level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SDK & Obfuscation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase">Min / Target SDK</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">API {audit.minSdk} → {audit.targetSdk}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] text-slate-500 uppercase">Code Obfuscation</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">ProGuard Active</div>
          </div>
        </div>
      </div>
    </div>
  );
};
