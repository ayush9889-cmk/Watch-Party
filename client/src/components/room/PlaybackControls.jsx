import React, { useState } from 'react';
import Button from '../common/Button';
import { PlayIcon, PauseIcon, ForwardIcon, RewindIcon, YoutubeIcon, ClockIcon } from '../common/Icons';
import { fmtTime, parseTime } from '../../utils/youtube';

export default function PlaybackControls({
  videoState,
  canControl,
  onAction,
  onOpenVideoModal,
}) {
  const [seekInput, setSeekInput] = useState('');
  const isPlaying = videoState?.playState === 'playing';
  const currentTime = videoState?.currentTime || 0;

  const togglePlay = () => {
    onAction(isPlaying ? 'pause' : 'play', { time: currentTime });
  };

  const jump = (delta) => {
    const target = Math.max(0, currentTime + delta);
    onAction('seek', { time: target });
  };

  const handleSeekSubmit = (e) => {
    e.preventDefault();
    const time = parseTime(seekInput);
    if (time === null) return;
    onAction('seek', { time });
    setSeekInput('');
  };

  return (
    <div className="glass-panel border border-slate-800 rounded-2xl p-4 sm:p-5 mt-4">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 mb-3.5 border-b border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-semibold text-slate-300">
            {isPlaying ? 'Playing Live' : 'Paused'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="font-mono text-slate-300">{fmtTime(currentTime)}</span>
        </div>
        <div>
          {canControl ? (
            <span className="text-brand-400 font-medium">You have direct playback control</span>
          ) : (
            <span className="text-slate-400">Your clicks are queued for Moderator approval</span>
          )}
        </div>
      </div>

      {/* Main Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback action group */}
        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? 'secondary' : 'primary'}
            size="md"
            onClick={togglePlay}
            icon={isPlaying ? PauseIcon : PlayIcon}
          >
            {isPlaying
              ? canControl ? 'Pause' : 'Request Pause'
              : canControl ? 'Play' : 'Request Play'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => jump(-10)}
            icon={RewindIcon}
            title="Rewind 10s"
          >
            -10s
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => jump(10)}
            icon={ForwardIcon}
            title="Forward 10s"
          >
            +10s
          </Button>
        </div>

        {/* Seek Input */}
        <form onSubmit={handleSeekSubmit} className="flex items-center gap-2 max-w-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. 1:30 or 90"
              value={seekInput}
              onChange={(e) => setSeekInput(e.target.value)}
              className="w-32 rounded-xl bg-dark-900 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-xs px-3 py-2 font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            {canControl ? 'Seek' : 'Request Seek'}
          </Button>
        </form>

        {/* Change Video button */}
        <Button
          variant="glass"
          size="sm"
          onClick={onOpenVideoModal}
          icon={YoutubeIcon}
          className="text-brand-300 hover:text-white"
        >
          {canControl ? 'Change Video' : 'Request Video'}
        </Button>
      </div>
    </div>
  );
}
