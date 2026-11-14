import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Maximize, Minimize, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import { youtubeId } from '../../lib/crypto';

/* Minimal typings for the YouTube IFrame API. */
interface YTPlayer {
  getCurrentTime(): number;
  getDuration(): number;
  pauseVideo(): void;
  destroy(): void;
}
declare global {
  interface Window {
    YT?: { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: { ENDED: number; PLAYING: number } };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise(resolve => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return apiPromise;
}

interface Props {
  videoUrl: string;
  title: string;
  studentName?: string;
  studentPhone?: string;
  watermarkEnabled?: boolean;
  pauseOnTabBlur?: boolean;
  initialTime?: number;
  onTimeUpdate?: (seconds: number, duration: number) => void;
  onComplete?: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
}

const SPOTS = [
  { top: '12%', left: '8%' }, { top: '70%', left: '60%' }, { top: '40%', left: '30%' },
  { top: '20%', left: '62%' }, { top: '78%', left: '10%' }, { top: '52%', left: '72%' },
];

/**
 * Plays an unlisted YouTube lecture inside the academy page.
 * - Student name + phone float over the video (moves every 12 s) so screen
 *   recordings carry the student's identity.
 * - YouTube's own fullscreen is off; our fullscreen keeps the watermark on top.
 * - Clicks on the YouTube title / logo (which would open youtube.com) are blocked.
 * No web player can stop a determined screen recorder; this is a deterrent.
 */
export const YouTubePlayer: React.FC<Props> = ({
  videoUrl, title, studentName = 'Student', studentPhone = '', watermarkEnabled = true, pauseOnTabBlur = false,
  initialTime = 0, onTimeUpdate, onComplete, onNextLesson, onPrevLesson, hasNext, hasPrev, autoPlayNext = true, onToggleAutoPlayNext,
}) => {
  const id = youtubeId(videoUrl);
  const holder = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [spot, setSpot] = useState(0);
  const [isFs, setIsFs] = useState(false);
  const [failed, setFailed] = useState(false);

  // keep latest callbacks without re-creating the player
  const cb = useRef({ onTimeUpdate, onComplete, onNextLesson, autoPlayNext, hasNext });
  cb.current = { onTimeUpdate, onComplete, onNextLesson, autoPlayNext, hasNext };

  useEffect(() => {
    if (!id || !holder.current) return;
    let cancelled = false;
    let timer: number | undefined;
    const mount = document.createElement('div');
    holder.current.innerHTML = '';
    holder.current.appendChild(mount);

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT) return;
      player.current = new window.YT.Player(mount, {
        videoId: id,
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: {
          rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, fs: 0,
          start: Math.max(0, Math.floor(initialTime)), origin: window.location.origin,
        },
        events: {
          onStateChange: (e: { data: number }) => {
            if (e.data === window.YT!.PlayerState.ENDED) {
              const d = player.current?.getDuration() || 0;
              cb.current.onTimeUpdate?.(d, d);
              cb.current.onComplete?.();
              if (cb.current.autoPlayNext && cb.current.hasNext) cb.current.onNextLesson?.();
            }
          },
          onError: () => setFailed(true),
        },
      });
      timer = window.setInterval(() => {
        const p = player.current;
        if (!p || typeof p.getCurrentTime !== 'function') return;
        const t = p.getCurrentTime(); const d = p.getDuration();
        if (d > 0) cb.current.onTimeUpdate?.(t, d);
      }, 5000);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      try { player.current?.destroy(); } catch { /* already gone */ }
      player.current = null;
    };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // moving watermark
  useEffect(() => {
    if (!watermarkEnabled) return;
    const t = window.setInterval(() => setSpot(s => (s + 1) % SPOTS.length), 12000);
    return () => window.clearInterval(t);
  }, [watermarkEnabled]);

  // optional: pause when the student switches tabs
  useEffect(() => {
    if (!pauseOnTabBlur) return;
    const onVis = () => { if (document.hidden) player.current?.pauseVideo?.(); };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [pauseOnTabBlur]);

  useEffect(() => {
    const onFs = () => setIsFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const toggleFs = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen();
    else box.current?.requestFullscreen?.();
  }, []);

  if (!id) {
    return <div className="aspect-video rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 text-sm">This lecture's video link is not a valid YouTube link yet.</div>;
  }

  return (
    <div className="space-y-2">
      <div ref={box} onContextMenu={e => e.preventDefault()}
        className={`relative w-full bg-black overflow-hidden select-none ${isFs ? 'h-full' : 'aspect-video rounded-2xl shadow-2xl'}`} data-player="youtube" data-video-id={id}>
        <div ref={holder} className="absolute inset-0 [&_iframe]:w-full [&_iframe]:h-full" />
        {/* block YouTube's title bar link and the logo link (both open youtube.com) */}
        <div className="absolute top-0 inset-x-0 h-14 z-10" aria-hidden />
        <div className="absolute bottom-0 right-0 w-28 h-12 z-10" aria-hidden />
        {watermarkEnabled && (
          <div className="absolute z-20 pointer-events-none text-white/35 text-[11px] sm:text-sm font-semibold leading-tight transition-all duration-1000 drop-shadow"
            style={SPOTS[spot]} data-watermark>
            {studentName}<br />{studentPhone}
          </div>
        )}
        {failed && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 text-slate-300 text-sm p-6 text-center">
            This video can't be played. Ask the academy to check that the YouTube video is "Unlisted" (not Private) and that embedding is allowed.
          </div>
        )}
        <button onClick={toggleFs} className="absolute z-20 top-3 right-3 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white" title={isFs ? 'Exit fullscreen' : 'Fullscreen'}>
          {isFs ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
        <button disabled={!hasPrev} onClick={onPrevLesson} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 disabled:opacity-40"><ChevronLeft className="w-4 h-4" />Previous</button>
        <span className="truncate text-slate-400 hidden sm:block">{title}</span>
        <div className="flex items-center gap-2">
          <button onClick={onToggleAutoPlayNext} className={`flex items-center gap-1 px-3 py-2 rounded-xl ${autoPlayNext ? 'bg-teal-700 text-white' : 'bg-slate-800'}`} title="Auto-play next lecture"><Repeat className="w-3.5 h-3.5" />Auto-next</button>
          <button disabled={!hasNext} onClick={onNextLesson} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 disabled:opacity-40">Next<ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};
