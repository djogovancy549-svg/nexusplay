import React from 'react';
import { ShieldCheck, Download, Star, Cpu } from 'lucide-react';
import { AppItem } from '../types';
import { AppIcon } from './AppIcon';

interface HeroBannerProps {
  featuredApp: AppItem;
  onSelectApp: (app: AppItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ featuredApp, onSelectApp }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-2xl border border-slate-800 my-6">
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        <img
          src={featuredApp.bannerUrl}
          alt={featuredApp.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-medium mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Featured {featuredApp.fileType} Release</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Secure
            </span>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <AppIcon
              name={featuredApp.name}
              iconUrl={featuredApp.iconUrl}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shadow-xl border-2 border-white/20 shrink-0 text-xl font-bold"
            />
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
                {featuredApp.name}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 mt-0.5">{featuredApp.developer}</p>
            </div>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-2">
            {featuredApp.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white">{featuredApp.rating}</span>
              <span className="text-slate-400">({featuredApp.reviewsCount.toLocaleString()} reviews)</span>
            </div>
            <span>v{featuredApp.version}</span>
            <span aria-hidden="true">·</span>
            <span>{featuredApp.sizeMb} MB</span>
            <span aria-hidden="true">·</span>
            <span>{featuredApp.downloads} Downloads</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => onSelectApp(featuredApp)}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Install</span>
          </button>
          <div className="text-center text-[11px] text-slate-400">
            Synced to Google Sheet & Drive
          </div>
        </div>
      </div>
    </div>
  );
};
