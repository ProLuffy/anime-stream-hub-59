import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, 
  Subtitles, Languages, ChevronLeft, ChevronRight, Loader2, 
  AlertCircle, RotateCcw, SkipForward
} from 'lucide-react';
import { toast } from 'sonner';

interface StreamSource {
  url: string;
  quality?: string;
  type?: string;
}

interface SubtitleTrack {
  url: string;
  lang: string;
  label?: string;
}

interface VideoPlayerProps {
  sources: StreamSource[];
  subtitles?: SubtitleTrack[];
  poster?: string;
  title?: string;
  episodeTitle?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

interface QualityOption {
  label: string;
  value: string;
}

interface SubtitleSettings {
  enabled: boolean;
  language: string;
  size: 'small' | 'medium' | 'large';
  color: string;
}

const qualityOptions: QualityOption[] = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p', value: '1080' },
  { label: '720p', value: '720' },
  { label: '480p', value: '480' },
];

const subtitleColors = ['#FFFFFF', '#FFFF00', '#00FFFF', '#00FF00', '#FF69B4'];
const subtitleSizes = {
  small: '14px',
  medium: '20px',
  large: '28px',
};

export default function VideoPlayer({
  sources,
  subtitles = [],
  poster,
  title,
  episodeTitle,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  intro,
  outro,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitleSettings, setShowSubtitleSettings] = useState(false);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    enabled: true,
    language: subtitles[0]?.lang || 'en',
    size: 'medium',
    color: '#FFFFFF',
  });

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Get current source
  const currentSource = sources[currentSourceIndex];

  // Handle source switching
  const switchSource = useCallback((index: number) => {
    if (index >= 0 && index < sources.length) {
      const savedTime = videoRef.current?.currentTime || 0;
      setCurrentSourceIndex(index);
      setIsLoading(true);
      setHasError(false);
      
      // Preserve timestamp
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = savedTime;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
      
      toast.success(`Switched to ${sources[index].quality || `Source ${index + 1}`}`);
    }
  }, [sources]);

  // Fallback logic
  const tryNextSource = useCallback(() => {
    if (currentSourceIndex < sources.length - 1) {
      toast.info('Switched to alternate stream for better playback');
      switchSource(currentSourceIndex + 1);
    } else {
      setHasError(true);
    }
  }, [currentSourceIndex, sources.length, switchSource]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Check for skip intro
      if (intro && currentTime >= intro.start && currentTime < intro.end) {
        setShowSkipIntro(true);
      } else {
        setShowSkipIntro(false);
      }
    }
  };

  const handleError = () => {
    setIsLoading(false);
    tryNextSource();
  };

  const handleWaiting = () => setIsLoading(true);
  const handleCanPlay = () => setIsLoading(false);

  // Control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setIsMuted(value === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skipIntro = () => {
    if (videoRef.current && intro) {
      videoRef.current.currentTime = intro.end;
      setShowSkipIntro(false);
    }
  };

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    const sourceIndex = sources.findIndex(s => 
      s.quality?.includes(quality) || quality === 'auto'
    );
    if (sourceIndex >= 0 && sourceIndex !== currentSourceIndex) {
      switchSource(sourceIndex);
    }
    setShowSettings(false);
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime -= 10;
          break;
        case 'ArrowRight':
          videoRef.current.currentTime += 10;
          break;
        case 'ArrowUp':
          setVolume(v => Math.min(1, v + 0.1));
          break;
        case 'ArrowDown':
          setVolume(v => Math.max(0, v - 0.1));
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Format time
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSource) {
    return (
      <div className="aspect-video bg-card rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No stream sources available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-2xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        boxShadow: '0 0 80px hsl(var(--primary) / 0.15)',
      }}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        src={currentSource.url}
        poster={poster}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        crossOrigin="anonymous"
      >
        {/* Subtitles */}
        {subtitleSettings.enabled && subtitles.map((sub, idx) => (
          <track
            key={idx}
            kind="subtitles"
            src={sub.url}
            srcLang={sub.lang}
            label={sub.label || sub.lang}
            default={sub.lang === subtitleSettings.language}
          />
        ))}
      </video>

      {/* Subtitle overlay styling */}
      <style>{`
        video::cue {
          font-size: ${subtitleSizes[subtitleSettings.size]};
          color: ${subtitleSettings.color};
          background: rgba(0, 0, 0, 0.7);
          padding: 4px 8px;
          border-radius: 4px;
        }
      `}</style>

      {/* Loading overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <p className="font-semibold mb-2">Stream Not Available</p>
            <p className="text-sm text-muted-foreground mb-4">
              All sources failed to load
            </p>
            <button
              onClick={() => switchSource(0)}
              className="btn-ghost flex items-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Skip Intro button */}
      <AnimatePresence>
        {showSkipIntro && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={skipIntro}
            className="absolute bottom-24 right-4 px-6 py-3 bg-white/20 hover:bg-white/30 
                       backdrop-blur-md rounded-lg font-semibold flex items-center gap-2
                       border border-white/30 transition-all"
          >
            <SkipForward className="w-5 h-5" />
            Skip Intro
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
              <div>
                {title && <h3 className="font-semibold">{title}</h3>}
                {episodeTitle && <p className="text-sm text-muted-foreground">{episodeTitle}</p>}
              </div>
              <div className="flex items-center gap-2">
                {/* Quality badge */}
                <span className="px-2 py-1 text-xs font-medium bg-primary/20 rounded">
                  {selectedQuality.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Center play button */}
            <button
              onClick={togglePlay}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         w-20 h-20 rounded-full bg-primary/80 hover:bg-primary 
                         flex items-center justify-center transition-all hover:scale-110"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-primary-foreground" />
              ) : (
                <Play className="w-8 h-8 text-primary-foreground ml-1" />
              )}
            </button>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                             [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                             [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary 
                             [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-xs font-mono">{formatTime(duration)}</span>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Prev/Next episode */}
                  {hasPrevious && (
                    <button onClick={onPrevious} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  
                  <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  {hasNext && (
                    <button onClick={onNext} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                                 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 
                                 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white 
                                 [&::-webkit-slider-thumb]:rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Subtitles */}
                  {subtitles.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowSubtitleSettings(!showSubtitleSettings)}
                        className={`p-2 rounded-lg transition-colors ${
                          subtitleSettings.enabled ? 'bg-primary text-primary-foreground' : 'hover:bg-white/20'
                        }`}
                      >
                        <Subtitles className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {showSubtitleSettings && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 p-4 bg-black/90 rounded-xl 
                                       backdrop-blur-md border border-white/10 min-w-[200px]"
                          >
                            <h4 className="font-semibold mb-3">Subtitles</h4>
                            
                            {/* Toggle */}
                            <label className="flex items-center justify-between mb-3">
                              <span className="text-sm">Enable</span>
                              <input
                                type="checkbox"
                                checked={subtitleSettings.enabled}
                                onChange={(e) => setSubtitleSettings(s => ({ ...s, enabled: e.target.checked }))}
                                className="w-4 h-4 accent-primary"
                              />
                            </label>

                            {/* Language */}
                            <div className="mb-3">
                              <label className="text-sm text-muted-foreground">Language</label>
                              <select
                                value={subtitleSettings.language}
                                onChange={(e) => setSubtitleSettings(s => ({ ...s, language: e.target.value }))}
                                className="w-full mt-1 p-2 bg-white/10 rounded-lg text-sm"
                              >
                                {subtitles.map((sub) => (
                                  <option key={sub.lang} value={sub.lang}>
                                    {sub.label || sub.lang.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Size */}
                            <div className="mb-3">
                              <label className="text-sm text-muted-foreground">Size</label>
                              <div className="flex gap-2 mt-1">
                                {(['small', 'medium', 'large'] as const).map((size) => (
                                  <button
                                    key={size}
                                    onClick={() => setSubtitleSettings(s => ({ ...s, size }))}
                                    className={`px-3 py-1 text-xs rounded ${
                                      subtitleSettings.size === size ? 'bg-primary text-primary-foreground' : 'bg-white/10'
                                    }`}
                                  >
                                    {size.charAt(0).toUpperCase() + size.slice(1)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Color */}
                            <div>
                              <label className="text-sm text-muted-foreground">Color</label>
                              <div className="flex gap-2 mt-1">
                                {subtitleColors.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => setSubtitleSettings(s => ({ ...s, color }))}
                                    className={`w-6 h-6 rounded-full border-2 ${
                                      subtitleSettings.color === color ? 'border-primary' : 'border-transparent'
                                    }`}
                                    style={{ background: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Settings (Quality) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </button>

                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 p-4 bg-black/90 rounded-xl 
                                     backdrop-blur-md border border-white/10 min-w-[150px]"
                        >
                          <h4 className="font-semibold mb-3">Quality</h4>
                          {qualityOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleQualityChange(option.value)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedQuality === option.value 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-white/10'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette effect */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.4)',
      }} />
    </div>
  );
}
