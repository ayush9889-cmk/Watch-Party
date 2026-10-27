import React from 'react';
import { CheckIcon, CloseIcon } from './Icons';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-item flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm max-w-sm backdrop-blur-lg animate-slide-up ${
            t.kind === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : t.kind === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-dark-900/90 border-brand-500/40 text-slate-100'
          }`}
        >
          <div className="shrink-0">
            {t.kind === 'error' ? (
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">!</span>
            ) : t.kind === 'success' ? (
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><CheckIcon className="w-3.5 h-3.5" /></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            )}
          </div>
          <p className="flex-1 text-xs sm:text-sm font-medium leading-snug">{t.message}</p>
          {onDismiss && (
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
