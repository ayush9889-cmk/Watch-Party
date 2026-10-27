import React from 'react';
import Button from '../common/Button';
import { ShieldIcon, CheckIcon, CloseIcon } from '../common/Icons';
import { describeRequest } from '../../utils/youtube';

export default function RequestsPanel({
  requests = [],
  canControl,
  onResolveRequest,
}) {
  if (!canControl && requests.length === 0) return null;

  return (
    <div className="glass-panel border border-slate-800 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <ShieldIcon className="w-4 h-4 text-indigo-400" />
          <span>{canControl ? `Approval Requests (${requests.length})` : 'Your Requests'}</span>
        </h3>
      </div>

      {requests.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center">No pending approval requests</p>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[220px] custom-scrollbar pr-1">
          {requests.map((r) => (
            <div
              key={r.id}
              className="p-2.5 rounded-xl bg-dark-900/80 border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0">
                <span className="font-bold text-white">{r.username}</span>{' '}
                <span className="text-slate-300">wants to {describeRequest(r)}</span>
              </div>

              {canControl ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onResolveRequest(r.id, true)}
                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition"
                    title="Approve"
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onResolveRequest(r.id, false)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition"
                    title="Reject"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                  Waiting for Review
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
