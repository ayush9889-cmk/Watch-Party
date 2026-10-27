import React from 'react';
import { YoutubeIcon, ShieldIcon, MessageIcon, ClockIcon } from '../common/Icons';

export default function Features() {
  const items = [
    {
      icon: ClockIcon,
      title: 'Real-Time Sync Engine',
      desc: 'Automatic heartbeat synchronization corrects drift seamlessly so everyone sees the exact same frame.',
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20',
    },
    {
      icon: ShieldIcon,
      title: 'Role-Based Access Control',
      desc: 'Host has total authority to promote Moderators, review action requests, or moderate members.',
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: YoutubeIcon,
      title: 'Participant Approval Queue',
      desc: 'Participants can request video changes, seeking, and pauses. Controllers approve with 1 click.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: MessageIcon,
      title: 'Persistent MongoDB Storage',
      desc: 'Rooms, playback history, chat messages, and member states are safely stored in MongoDB.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="mt-14 max-w-6xl mx-auto">
      <h3 className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-8">
        Designed for Seamless Streaming & Group Collaboration
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition group"
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} border ${item.color} flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white font-display mb-1.5">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
