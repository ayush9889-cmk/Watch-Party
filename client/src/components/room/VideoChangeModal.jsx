import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { YoutubeIcon } from '../common/Icons';
import { extractVideoId, getThumbnailUrl, PRESET_VIDEOS } from '../../utils/youtube';

export default function VideoChangeModal({ isOpen, onClose, canControl, onSelectVideo }) {
  const [url, setUrl] = useState('');
  const [previewId, setPreviewId] = useState('');
  const [error, setError] = useState('');

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    const id = extractVideoId(val);
    setPreviewId(id || '');
    setError('');
  };

  const handlePresetSelect = (id) => {
    setUrl(`https://www.youtube.com/watch?v=${id}`);
    setPreviewId(id);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = previewId || extractVideoId(url);
    if (!id) {
      setError('Please provide a valid YouTube video link or ID');
      return;
    }
    onSelectVideo(id);
    onClose();
    setUrl('');
    setPreviewId('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={canControl ? 'Change Current Video' : 'Request Video Change'}
      subtitle={canControl ? 'Updates the video for all room participants instantly' : 'Sends an approval request to the Host or Moderator'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="YouTube URL or Video ID"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={handleUrlChange}
          icon={YoutubeIcon}
          error={error}
          autoFocus
        />

        {/* Thumbnail Preview */}
        {previewId && (
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video relative group">
            <img
              src={getThumbnailUrl(previewId, 'hqdefault')}
              alt="Video Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Valid Video ID: {previewId}
              </span>
            </div>
          </div>
        )}

        {/* Presets */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Or pick from popular tracks
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_VIDEOS.map((p) => (
              <button
                key={p.videoId}
                type="button"
                onClick={() => handlePresetSelect(p.videoId)}
                className={`text-left p-2 rounded-xl border text-xs transition ${
                  previewId === p.videoId
                    ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                    : 'bg-dark-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{p.category}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!previewId}>
            {canControl ? 'Load Video' : 'Send Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
