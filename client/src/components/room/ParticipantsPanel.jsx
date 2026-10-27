import React from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { UsersIcon, CrownIcon, ShieldIcon } from '../common/Icons';

export default function ParticipantsPanel({
  participants = [],
  currentUserId,
  isHost,
  onAssignRole,
  onRemoveUser,
  onTransferHost,
}) {
  return (
    <div className="glass-panel border border-slate-800 rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-brand-400" />
          <span>People ({participants.length})</span>
        </h3>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[320px] custom-scrollbar pr-1">
        {participants.map((p) => {
          const isMe = p.userId === currentUserId;
          return (
            <div
              key={p.userId}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                isMe
                  ? 'bg-brand-950/30 border-brand-500/30'
                  : 'bg-dark-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${p.online ? 'bg-emerald-400' : 'bg-slate-500'}`}
                  title={p.online ? 'Online' : 'Reconnecting…'}
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                    <span>{p.username}</span>
                    {isMe && <span className="text-[10px] text-brand-400 font-normal">(you)</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge role={p.role} size="xs" />

                {/* Host Moderation Controls */}
                {isHost && !isMe && (
                  <div className="flex items-center gap-1">
                    <select
                      value={p.role}
                      onChange={(e) => onAssignRole(p.userId, e.target.value)}
                      className="bg-dark-950 border border-slate-700 rounded-lg text-[11px] text-slate-300 py-1 px-1.5 focus:outline-none focus:border-brand-500"
                    >
                      <option value="moderator">Moderator</option>
                      <option value="participant">Participant</option>
                      <option value="viewer">Viewer</option>
                    </select>

                    <button
                      onClick={() => onTransferHost(p)}
                      title="Make Host"
                      className="p-1 rounded-lg text-amber-400 hover:bg-amber-500/10 transition"
                    >
                      <CrownIcon className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onRemoveUser(p)}
                      title="Remove from room"
                      className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
