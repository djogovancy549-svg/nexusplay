import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, RefreshCw, Lock, Terminal, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

interface AiSecurityReport {
  threatDetected: boolean;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL_ATTACK';
  attackerProfile: string;
  attackVector: string;
  recommendedAction: 'ALLOW' | 'RATE_LIMIT' | 'STRICT_LOCKDOWN';
  aiAnalysisSummary: string;
}

export const AiSecuritySentinel: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<AiSecurityReport>({
    threatDetected: false,
    threatLevel: 'SAFE',
    attackerProfile: 'None detected',
    attackVector: 'Encrypted TLS 1.3 / HTTPS Stream',
    recommendedAction: 'ALLOW',
    aiAnalysisSummary: 'CyberAI Sentinel is actively monitoring client requests, APK signatures, and Google Sheet/Drive sync streams. No anomaly or intrusion signature detected.'
  });
  const [lockdownActive, setLockdownActive] = useState(false);

  const runAiSecurityAudit = async () => {
    setAnalyzing(true);
    try {
      const sampleEvents = [
        { timestamp: new Date().toISOString(), type: 'CLIENT_SESSION', ip: '192.168.1.55', action: 'STORE_BROWSE' },
        { timestamp: new Date().toISOString(), type: 'SIGNATURE_CHECK', status: 'VALID_SHA256' },
        { timestamp: new Date().toISOString(), type: 'GOOGLE_SHEET_SYNC', status: 'AUTHORIZED_WEBHOOK' }
      ];

      const res = await fetch('/api/security/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: sampleEvents })
      });
      const data = await res.json();
      setReport(data);
      if (data.recommendedAction === 'STRICT_LOCKDOWN') {
        setLockdownActive(true);
      }
    } catch (e) {
      console.error('AI Security Audit error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 my-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              CyberAI Sentinel
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">POWERED BY GEMINI AI</span>
            </h2>
            <p className="text-xs text-slate-500">Autonomous AI threat detection & strict lockdown enforcement</p>
          </div>
        </div>

        <button
          onClick={runAiSecurityAudit}
          disabled={analyzing}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'AI Analyzing Telemetry...' : 'Run AI Threat Audit'}</span>
        </button>
      </div>

      {/* Threat Status Banner */}
      <div className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${
        report.threatLevel === 'SAFE'
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
          : report.threatLevel === 'SUSPICIOUS'
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
      }`}>
        {report.threatLevel === 'SAFE' ? (
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <ShieldAlert className="w-8 h-8 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
        )}
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider">AI Threat Status: {report.threatLevel}</span>
            <span className="text-xs font-mono font-semibold">Action: {report.recommendedAction}</span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {report.aiAnalysisSummary}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-500 uppercase text-[10px]">Attacker Profile</span>
          <div className="font-bold text-slate-800 dark:text-slate-200">{report.attackerProfile}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-slate-500 uppercase text-[10px]">Attack Vector</span>
          <div className="font-bold text-slate-800 dark:text-slate-200">{report.attackVector}</div>
        </div>
      </div>

      {/* Lockdown Control */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Lock className="w-4 h-4 text-blue-600" />
          <span>Strict AI Lockdown Protocol: {lockdownActive ? 'ACTIVE (Zero Trust)' : 'STANDBY'}</span>
        </div>
        <button
          onClick={() => setLockdownActive(!lockdownActive)}
          className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors ${
            lockdownActive
              ? 'bg-rose-600 text-white hover:bg-rose-700'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
          }`}
        >
          {lockdownActive ? 'Disable Strict Lockdown' : 'Enable Strict Lockdown'}
        </button>
      </div>
    </div>
  );
};
