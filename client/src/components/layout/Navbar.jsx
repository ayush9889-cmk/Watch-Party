import React, { useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { CopyIcon, CheckIcon, ShareIcon, LogoutIcon, YoutubeIcon, UsersIcon } from '../common/Icons';

export default function Navbar({
  roomId,
  roomTitle,
  role,
  participantCount = 1,
  onLeave,
  onOpenShare,
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <YoutubeIcon className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold text-white font-display leading-tight flex items-center gap-1.5">
              <span>WatchParty</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Live Synced" />
            </h1>
            <p className="text-[11px] text-slate-400 truncate max-w-[140px] md:max-w-[200px]">
              {roomTitle || 'Live Session'}
            </p>
          </div>
        </div>

        {/* Room Code Badge */}
        {roomId && (
          <div className="flex items-center bg-dark-900/90 border border-slate-700/80 rounded-xl px-2.5 py-1 gap-2 shadow-inner">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ROOM</span>
            <span className="font-mono font-bold text-sm text-brand-400 tracking-wider select-all">{roomId}</span>
            <button
              onClick={copyCode}
              title="Copy Room Code"
              className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded"
            >
              {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Active counter */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300">
          <UsersIcon className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-semibold">{participantCount}</span>
          <span className="text-slate-400">online</span>
        </div>

        {/* User Role */}
        {role && <Badge role={role} size="md" />}

        {/* Share Invite */}
        <Button
          variant="glass"
          size="sm"
          onClick={onOpenShare}
          icon={ShareIcon}
          className="hidden sm:inline-flex"
        >
          Invite
        </Button>

        {/* Leave */}
        <Button
          variant="danger"
          size="sm"
          onClick={onLeave}
          icon={LogoutIcon}
          title="Leave Room"
        >
          <span className="hidden sm:inline">Leave</span>
        </Button>
      </div>
    </header>
  );
}
