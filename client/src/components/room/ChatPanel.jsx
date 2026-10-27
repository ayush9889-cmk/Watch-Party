import React, { useRef, useEffect, useState } from 'react';
import Button from '../common/Button';
import { MessageIcon, SendIcon } from '../common/Icons';
import { ROLE_CONFIG } from '../../utils/roles';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '🍿', '👏'];

export default function ChatPanel({ chat = [], onSendMessage }) {
  const [text, setText] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleQuickEmoji = (emoji) => {
    onSendMessage(emoji);
  };

  return (
    <div className="glass-panel border border-slate-800 rounded-2xl p-4 flex flex-col h-[400px] lg:h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 shrink-0">
        <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
          <MessageIcon className="w-4 h-4 text-emerald-400" />
          <span>Live Chat</span>
        </h3>
        <span className="text-[11px] text-slate-400">Synced in MongoDB</span>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 my-1">
        {chat.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-10">
            Say hello to start the party!
          </p>
        ) : (
          chat.map((m) => {
            const roleStyle = ROLE_CONFIG[m.role]?.badgeClass || '';
            const time = m.at ? new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            return (
              <div key={m.id} className="text-xs leading-relaxed group">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-bold text-slate-200">{m.username}</span>
                  {m.role && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded border uppercase font-semibold ${roleStyle}`}>
                      {m.role}
                    </span>
                  )}
                  {time && <span className="text-[10px] text-slate-400 ml-auto opacity-0 group-hover:opacity-100 transition">{time}</span>}
                </div>
                <p className="text-slate-300 break-words bg-dark-900/60 p-2 rounded-xl border border-slate-800/60 inline-block max-w-full">
                  {m.text}
                </p>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Emojis */}
      <div className="flex items-center gap-1.5 py-2 border-t border-slate-800/80 shrink-0 overflow-x-auto">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => handleQuickEmoji(emoji)}
            className="hover:scale-125 transition-transform text-sm px-1.5 py-0.5 rounded hover:bg-slate-800"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Chat Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1 shrink-0">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          placeholder="Send a message…"
          className="flex-1 rounded-xl bg-dark-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 focus:outline-none focus:border-brand-500"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!text.trim()}
          icon={SendIcon}
        />
      </form>
    </div>
  );
}
