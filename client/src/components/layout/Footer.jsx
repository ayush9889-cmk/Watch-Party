import React from 'react';
import { YoutubeIcon } from '../common/Icons';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/60 py-8 px-4 text-center text-xs text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-300">
          <YoutubeIcon className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-white">WatchParty Pro</span>
          <span className="text-slate-500">·</span>
          <span>v2.0 MVC + MongoDB</span>
        </div>
        <p className="text-slate-400">
          Watch YouTube videos together with frame-accurate sync, role-based controls, and live chat.
        </p>
      </div>
    </footer>
  );
}
