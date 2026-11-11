import React, { useState } from 'react';
import { Smartphone, Sparkles, Layers, ShieldCheck, Box } from 'lucide-react';

interface AppIconProps {
  name: string;
  iconUrl?: string;
  className?: string;
  fallbackSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const GRADIENTS = [
  'from-blue-600 to-indigo-600',
  'from-emerald-500 to-teal-700',
  'from-purple-600 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-red-600',
  'from-indigo-600 to-violet-700'
];

export const getAppInitials = (name: string): string => {
  if (!name) return 'AP';
  const clean = name.trim();
  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.substring(0, 2).toUpperCase();
};

export const getGradientForName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  iconUrl,
  className = 'w-16 h-16 rounded-2xl',
  fallbackSize = 'md'
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = getAppInitials(name);
  const gradient = getGradientForName(name);

  // If valid iconUrl and not errored
  if (iconUrl && !hasError && iconUrl.trim() !== '') {
    return (
      <img
        src={iconUrl}
        alt={name}
        onError={() => setHasError(true)}
        className={`${className} object-cover shadow-sm bg-slate-100 dark:bg-slate-800 transition-all`}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    );
  }

  // Graceful, stylish native Android app icon tile
  return (
    <div
      className={`${className} bg-gradient-to-br ${gradient} text-white flex flex-col items-center justify-center font-bold tracking-wider relative overflow-hidden shadow-md select-none shrink-0 border border-white/20`}
      title={name}
    >
      {/* Gloss shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/25 pointer-events-none" />
      
      <span className="relative z-10 font-extrabold tracking-tight drop-shadow-sm text-center">
        {initials}
      </span>

      {/* Subtle indicator dot */}
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-white/60" />
    </div>
  );
};
