import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { CopyIcon, CheckIcon, ShareIcon } from '../common/Icons';

export default function ShareModal({ isOpen, onClose, roomId }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const inviteUrl = `${window.location.origin}/?room=${roomId}`;

  const copyUrl = async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Friends to Watch"
      subtitle="Anyone with this link or code can join this synced stream"
    >
      <div className="space-y-4">
        {/* Room Code Box */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Room Code
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-dark-900 border border-slate-700/80 rounded-xl px-4 py-2.5 font-mono text-center text-xl font-bold tracking-widest text-brand-400">
              {roomId}
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={copyCode}
              icon={copiedCode ? CheckIcon : CopyIcon}
            >
              {copiedCode ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Direct Link Box */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Direct Invite URL
          </label>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={inviteUrl}
              className="flex-1 bg-dark-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate focus:outline-none"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={copyUrl}
              icon={copiedLink ? CheckIcon : CopyIcon}
            >
              {copiedLink ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </div>

        <div className="p-3 bg-brand-950/40 border border-brand-500/20 rounded-xl text-xs text-slate-300">
          💡 <b>Tip:</b> Open the invite link in an incognito tab to test as another user!
        </div>
      </div>
    </Modal>
  );
}
