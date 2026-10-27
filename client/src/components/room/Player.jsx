import React, { useEffect, useRef, useState } from 'react';
import { PlayIcon } from '../common/Icons';

let ytPromise;
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!ytPromise) {
    ytPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev && prev();
        resolve(window.YT);
      };
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    });
  }
  return ytPromise;
}

export default function Player({ state, canControl, onAction }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const stateRef = useRef(state);
  const canRef = useRef(canControl);
  const actionRef = useRef(onAction);
  const applying = useRef(false);
  const applyTimer = useRef(null);
  const unlockedRef = useRef(false);

  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);

  stateRef.current = state;
  canRef.current = canControl;
  actionRef.current = onAction;

  const apply = (s) => {
    const p = playerRef.current;
    if (!p || !p.getPlayerState || !unlockedRef.current) return;
    const target = s.playState === 'playing'
      ? s.currentTime + (Date.now() - (s.receivedAt || Date.now())) / 1000
      : s.currentTime;

    applying.current = true;
    clearTimeout(applyTimer.current);

    const loaded = p.getVideoData && p.getVideoData().video_id;
    if (loaded !== s.videoId) {
      const args = { videoId: s.videoId, startSeconds: target };
      s.playState === 'playing' ? p.loadVideoById(args) : p.cueVideoById(args);
    } else {
      if (Math.abs(p.getCurrentTime() - target) > 1.2) {
        p.seekTo(target, true);
      }
      const ps = p.getPlayerState();
      if (s.playState === 'playing' && ps !== 1 && ps !== 3) p.playVideo();
      if (s.playState === 'paused' && ps !== 2) p.pauseVideo();
    }
    applyTimer.current = setTimeout(() => {
      applying.current = false;
    }, 900);
  };

  useEffect(() => {
    let cancelled = false;
    let seekPoll;
    setReady(false);

    const host = document.createElement('div');
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(host);
    }

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      playerRef.current = new YT.Player(host, {
        videoId: stateRef.current.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          controls: canControl ? 1 : 0,
          disablekb: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setReady(true);
            apply(stateRef.current);
          },
          onStateChange: (e) => {
            if (!canRef.current || applying.current) return;
            const t = playerRef.current.getCurrentTime();
            if (e.data === 1 && stateRef.current.playState !== 'playing') {
              actionRef.current('play', { currentTime: t });
            }
            if (e.data === 2 && stateRef.current.playState !== 'paused') {
              actionRef.current('pause', { currentTime: t });
            }
          },
        },
      });

      if (canControl) {
        let last = { t: 0, at: Date.now() };
        seekPoll = setInterval(() => {
          const p = playerRef.current;
          if (!p || !p.getCurrentTime || applying.current) return;
          const now = Date.now();
          const cur = p.getCurrentTime();
          const playing = p.getPlayerState() === 1;
          const expected = last.t + (playing ? ((now - last.at) / 1000) * p.getPlaybackRate() : 0);
          if (Math.abs(cur - expected) > 1.5) {
            actionRef.current('seek', { time: cur });
          }
          last = { t: cur, at: now };
        }, 500);
      }
    });

    return () => {
      cancelled = true;
      clearInterval(seekPoll);
      clearTimeout(applyTimer.current);
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  }, [canControl]);

  useEffect(() => {
    if (ready) apply(state);
  }, [state, ready, unlocked]);

  const unlock = () => {
    unlockedRef.current = true;
    setUnlocked(true);
  };

  return (
    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800">
      <div className="w-full h-full" ref={mountRef} />

      {/* Non-controller overlay shield */}
      {!canControl && unlocked && (
        <div
          className="absolute inset-0 cursor-default"
          title="Playback controlled by Host & Moderators"
        />
      )}

      {/* Browser Autoplay Unlock Gate */}
      {!unlocked && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-dark-950/90 backdrop-blur-sm p-6 text-center">
          <button
            onClick={unlock}
            disabled={!ready}
            className="group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-base shadow-xl shadow-brand-500/30 transition transform active:scale-95 disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <PlayIcon className="w-4 h-4 text-white" />
            </div>
            <span>{ready ? 'Click to Join Playback & Audio' : 'Loading YouTube Engine…'}</span>
          </button>
          <p className="text-xs text-slate-400 mt-3 max-w-sm">
            Web browsers require a direct click to enable high-fidelity video and audio playback.
          </p>
        </div>
      )}
    </div>
  );
}
