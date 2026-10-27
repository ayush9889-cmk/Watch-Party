import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { SparklesIcon, YoutubeIcon } from '../common/Icons';
import { extractVideoId, PRESET_VIDEOS } from '../../utils/youtube';

export default function CreateRoomCard({ username, setUsername, onCreate, busy, error }) {
  const [title, setTitle] = useState('');
  const [customVideo, setCustomVideo] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(PRESET_VIDEOS[0].videoId);

  const handleSubmit = (e) => {
    e.preventDefault();
    const videoId = customVideo.trim() ? extractVideoId(customVideo) : selectedPreset;
    onCreate({ title: title.trim(), videoId: videoId || PRESET_VIDEOS[0].videoId });
  };

  return (
    <div className="glass-panel border border-slate-700/70 rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Create a New Room</h2>
            <p className="text-xs text-slate-400">You will be assigned as the Host</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Your Name"
            placeholder="e.g. Alex"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={24}
            required
            autoFocus
          />

          <Input
            label="Room Name (Optional)"
            placeholder="e.g. Movie Night, Music Jam"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={40}
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Initial YouTube Video
            </label>
            <Input
              placeholder="Paste YouTube link or pick below"
              value={customVideo}
              onChange={(e) => setCustomVideo(e.target.value)}
              icon={YoutubeIcon}
            />

            {/* Quick Presets */}
            {!customVideo && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {PRESET_VIDEOS.map((preset) => (
                  <button
                    key={preset.videoId}
                    type="button"
                    onClick={() => setSelectedPreset(preset.videoId)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                      selectedPreset === preset.videoId
                        ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-medium'
                        : 'bg-dark-900 border-slate-800 text-slate-400 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {preset.category}: {preset.title.slice(0, 22)}…
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-500/30">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={busy}
            className="w-full mt-2"
          >
            Create Watch Party
          </Button>
        </form>
      </div>
    </div>
  );
}
