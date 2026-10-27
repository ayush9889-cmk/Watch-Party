import React, { useEffect, useState } from 'react';
import { fetchActiveRooms } from '../../services/api';
import { UsersIcon, YoutubeIcon, PlayIcon } from '../common/Icons';
import { getThumbnailUrl } from '../../utils/youtube';

export default function ActiveRoomsPreview({ onSelectRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchActiveRooms().then((data) => {
      if (alive) {
        setRooms(data || []);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  if (loading || rooms.length === 0) return null;

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Active Public Rooms ({rooms.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {rooms.map((r) => (
          <div
            key={r.code}
            onClick={() => onSelectRoom(r.code)}
            className="glass-card hover:bg-dark-800/80 rounded-xl p-3 border border-slate-700/60 hover:border-brand-500/50 cursor-pointer transition flex items-center gap-3 group"
          >
            <div className="w-16 h-12 rounded-lg overflow-hidden bg-black relative shrink-0">
              <img
                src={getThumbnailUrl(r.videoId, 'default')}
                alt={r.title}
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <PlayIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-xs font-bold text-brand-400">{r.code}</span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <UsersIcon className="w-3 h-3" />
                  {r.participantCount}
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate mt-0.5">{r.title}</p>
              <p className="text-[10px] text-slate-400 truncate">Host: {r.host}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
