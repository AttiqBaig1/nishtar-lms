import React, { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface CustomVideoPlayerProps {
  videoUrl: string;
  title: string;
  studentName?: string;
  studentPhone?: string;
  watermarkEnabled?: boolean;
  pauseOnTabBlur?: boolean;
  initialTime?: number;
  duration?: number;
  onTimeUpdate?: (seconds: number, duration: number) => void;
  onComplete?: () => void;
  onNextLesson?: () => void;
  onPrevLesson?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  autoPlayNext?: boolean;
  onToggleAutoPlayNext?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  videoUrl,
  title,
  studentName = 'Medical Trainee',
  studentPhone = '+92 300 0000000',
  watermarkEnabled = true,
  pauseOnTabBlur = false,
  initialTime = 0,
  onTimeUpdate,
  onComplete,
  onNextLesson,
  onPrevLesson,
  hasNext = false,
  hasPrev = false,
  autoPlayNext = true,
  onToggleAutoPlayNext,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<{ id: number; name: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [isCompletedFired, setIsCompletedFired] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Moving watermark coordinates (% from top/left)
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, left: 25 });

  // 1. Moving watermark interval (every 12 seconds)
  useEffect(() => {
    if (!watermarkEnabled) return;
    const interval = setInterval(() => {
      // Random position between 10% and 80%
      const newTop = Math.floor(Math.random() * 70) + 10;
      const newLeft = Math.floor(Math.random() * 65) + 10;
      setWatermarkPos({ top: newTop, left: newLeft });
    }, 12000);
    return () => clearInterval(interval);
  }, [watermarkEnabled]);

  // 2. Pause video when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && pauseOnTabBlur && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseOnTabBlur]);

  // 3. Initialize Video source (HLS or direct MP4)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setVideoError(null);
    setIsCompletedFired(false);

    let hls: Hls | null = null;
    const isHlsUrl = videoUrl.includes('.m3u8');

    if (isHlsUrl && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        const levels = data.levels.map((lvl, idx) => ({
          id: idx,
          name: `${lvl.height}p`
        }));
        setQualityLevels(levels);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error('Fatal HLS error, switching to direct video', data);
          setVideoError('Stream connection issue. Retrying with fallback stream...');
          hls?.destroy();
          video.src = videoUrl;
        }
      });
    } else {
      video.src = videoUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl]);

  // Resume from initial position once metadata is loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration || 0);

    if (initialTime > 0 && initialTime < video.duration - 5) {
      video.currentTime = initialTime;
      setCurrentTime(initialTime);
    }
  };

  // 4. Play / Pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(e => console.warn('Play interrupted', e));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // 5. Seek bar
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 6. Time Update & 90% auto-complete
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const cur = video.currentTime;
    const dur = video.duration || duration;
    setCurrentTime(cur);

    if (onTimeUpdate) {
      onTimeUpdate(cur, dur);
    }

    // Trigger auto-complete when reaching 90%
    if (dur > 0 && cur >= dur * 0.9 && !isCompletedFired) {
      setIsCompletedFired(true);
      if (onComplete) {
        onComplete();
      }
    }
  };

  // 7. Video Ended -> Auto-play next lesson
  const handleEnded = () => {
    setIsPlaying(false);
    if (!isCompletedFired && onComplete) {
      onComplete();
    }
    if (autoPlayNext && hasNext && onNextLesson) {
      setTimeout(() => {
        onNextLesson();
      }, 1500);
    }
  };

  // 8. Speed selection
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  // 9. Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // 10. Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Hide controls on inactivity
  let controlsTimeout: NodeJS.Timeout;
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout);
    controlsTimeout = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()} // Disable right click
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group select-none border border-slate-800"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        playsInline
        disablePictureInPicture
        controlsList="nodownload"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Dynamic Moving Anti-Piracy Watermark */}
      {watermarkEnabled && (
        <div
          style={{ top: `${watermarkPos.top}%`, left: `${watermarkPos.left}%` }}
          className="watermark-float absolute z-20 pointer-events-none select-none text-white/20 font-mono text-xs md:text-sm tracking-wider px-2 py-1 rounded bg-black/10 backdrop-blur-[1px]"
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <Lock className="w-3 h-3 opacity-60 text-teal-400" />
            <span>{studentName}</span>
          </div>
          <div className="text-[11px] opacity-75">{studentPhone}</div>
          <div className="text-[9px] opacity-40">Nishtar Academy Multan</div>
        </div>
      )}

      {/* Big Play / Pause Overlay when paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[2px] cursor-pointer"
        >
          <button
            aria-label="Play video"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-teal-600/90 text-white flex items-center justify-center shadow-lg transform transition hover:scale-110 active:scale-95 border-2 border-white/30"
          >
            <Play className="w-8 h-8 md:w-10 md:h-10 fill-white ml-1" />
          </button>
        </div>
      )}

      {/* Video Error Banner if failed */}
      {videoError && (
        <div className="absolute top-4 left-4 right-4 z-30 bg-rose-900/90 text-rose-100 text-xs px-3 py-2 rounded-lg backdrop-blur-sm border border-rose-700/50 flex items-center justify-between">
          <span>{videoError}</span>
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play();
                setVideoError(null);
              }
            }}
            className="underline font-semibold ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Custom Bottom Control Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-3 md:p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Progress Bar */}
        <div className="relative group/scrub mb-2.5">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 md:h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 focus:outline-none transition-all"
          />
          {/* Buffer indicator styling */}
          <div
            className="absolute top-0 left-0 h-1.5 md:h-2 bg-teal-500 rounded-l-lg pointer-events-none"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {/* Buttons and timestamps */}
        <div className="flex items-center justify-between text-white text-xs md:text-sm">
          {/* Left actions */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-white"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {hasPrev && (
              <button
                onClick={onPrevLesson}
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white"
                title="Previous Lesson"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {hasNext && (
              <button
                onClick={onNextLesson}
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white"
                title="Next Lesson"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Jump back 10s */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/80 hover:text-white hidden sm:block"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10 transition text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1 bg-white/30 rounded accent-teal-400 cursor-pointer hidden group-hover/vol:block transition-all"
              />
            </div>

            {/* Timestamp */}
            <div className="font-mono text-white/80 text-[11px] md:text-xs ml-1">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/40">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Auto Play Next toggle */}
            {onToggleAutoPlayNext && (
              <button
                onClick={onToggleAutoPlayNext}
                className={`hidden md:flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition ${
                  autoPlayNext
                    ? 'border-teal-500/50 bg-teal-500/20 text-teal-300'
                    : 'border-white/20 text-white/50 hover:text-white/80'
                }`}
                title="Automatically play the next video in syllabus"
              >
                <span>Autoplay</span>
                <span className={`w-1.5 h-1.5 rounded-full ${autoPlayNext ? 'bg-teal-400' : 'bg-white/30'}`} />
              </button>
            )}

            {/* Speed & Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-2 py-1 rounded hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1"
                title="Playback Settings"
              >
                <span>{playbackSpeed}x</span>
                <Settings className="w-3.5 h-3.5 text-white/70" />
              </button>

              {/* Speed Popover */}
              {showSettings && (
                <div className="absolute bottom-8 right-0 bg-slate-900/95 border border-slate-700 rounded-xl p-2.5 shadow-2xl backdrop-blur-md w-36 text-xs text-white z-40">
                  <div className="font-semibold text-slate-400 pb-1 mb-1 border-b border-slate-800 text-[10px] uppercase tracking-wider">
                    Playback Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`w-full text-left px-2 py-1 rounded flex items-center justify-between hover:bg-teal-600/30 transition ${
                        playbackSpeed === s ? 'text-teal-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  ))}

                  {qualityLevels.length > 0 && (
                    <>
                      <div className="font-semibold text-slate-400 pt-2 pb-1 my-1 border-b border-t border-slate-800 text-[10px] uppercase tracking-wider">
                        Quality
                      </div>
                      <button
                        onClick={() => {
                          setCurrentQuality(-1);
                          setShowSettings(false);
                        }}
                        className={`w-full text-left px-2 py-1 rounded text-xs ${
                          currentQuality === -1 ? 'text-teal-400 font-bold' : 'text-slate-300'
                        }`}
                      >
                        Auto
                      </button>
                      {qualityLevels.map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => {
                            setCurrentQuality(lvl.id);
                            setShowSettings(false);
                          }}
                          className={`w-full text-left px-2 py-1 rounded text-xs ${
                            currentQuality === lvl.id ? 'text-teal-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {lvl.name}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 transition text-white"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
