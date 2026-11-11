import React, { useState } from 'react';
import { Mail, User, ShieldCheck, X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { registerCustomerEmail, CustomerUser } from '../services/googleService';

interface CustomerAuthModalProps {
  onClose: () => void;
  onSuccess: (user: CustomerUser) => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({ onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }

    setLoading(true);
    setError(null);

    const user = await registerCustomerEmail(email, name);
    setLoading(false);

    if (user) {
      onSuccess(user);
      onClose();
    } else {
      setError('Gagal mendaftarkan email. Silakan coba lagi.');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setName(demoName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Pendaftaran Email Pelanggan
              </h3>
              <p className="text-[11px] text-slate-500">
                Akses semua aplikasi di semua perangkat & email
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Banner */}
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            Email Anda akan terdaftar otomatis ke database <strong>Google Sheet (NexusRegisteredUsers)</strong> sehingga katalog aplikasi dapat dibuka dari email &amp; perangkat mana saja!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Email Pelanggan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: customer@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nama Lengkap / Username (Opsional)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="contoh: Budi Setiawan"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Quick email presets */}
          <div className="pt-1">
            <span className="text-[11px] font-medium text-slate-500 block mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Pilih email cepat untuk uji coba:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('djogovancy549@gmail.com', 'Djogo Vancy')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                djogovancy549@gmail.com
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('customer.official@gmail.com', 'Customer Official')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
              >
                customer.official@gmail.com
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium pt-1">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Daftarkan ke Google Sheet...</span>
                </>
              ) : (
                <>
                  <span>Masuk &amp; Daftarkan Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
