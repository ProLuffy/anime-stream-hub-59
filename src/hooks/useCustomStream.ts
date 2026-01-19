import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCustomStreamData, CustomStreamData } from '@/lib/customBackend';

interface UseCustomStreamOptions {
  episodeId: string;
  lang?: string;
  enabled?: boolean;
}

interface CustomAudioState {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
}

export function useCustomStream({ episodeId, lang = 'hindi', enabled = true }: UseCustomStreamOptions) {
  const [customData, setCustomData] = useState<CustomStreamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !episodeId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCustomStreamData(episodeId, lang);
        setCustomData(data);
      } catch (err) {
        setError('Failed to fetch custom stream data');
        setCustomData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [episodeId, lang, enabled]);

  return { customData, isLoading, error };
}

// Hook for synchronized custom audio playback
export function useCustomAudioSync(
  videoRef: React.RefObject<HTMLVideoElement>,
  audioUrl: string | null,
  isActive: boolean
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioState, setAudioState] = useState<CustomAudioState>({
    isActive: false,
    isLoading: false,
    error: null,
    currentTime: 0,
  });
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSyncTime = useRef<number>(0);

  // Create audio element
  useEffect(() => {
    if (!audioUrl) {
      audioRef.current = null;
      return;
    }

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.addEventListener('waiting', () => {
      setAudioState(s => ({ ...s, isLoading: true }));
      // Pause video when audio is buffering
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    });

    audio.addEventListener('canplay', () => {
      setAudioState(s => ({ ...s, isLoading: false }));
      // Resume video when audio is ready
      if (videoRef.current?.paused && isActive) {
        videoRef.current.play().catch(() => {});
      }
    });

    audio.addEventListener('error', () => {
      setAudioState(s => ({ ...s, error: 'Failed to load custom audio', isLoading: false }));
    });

    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl]);

  // Sync audio with video
  const syncAudioToVideo = useCallback(() => {
    if (!audioRef.current || !videoRef.current || !isActive) return;

    const video = videoRef.current;
    const audio = audioRef.current;

    // Sync time if drift is more than 0.3 seconds
    const timeDiff = Math.abs(audio.currentTime - video.currentTime);
    if (timeDiff > 0.3) {
      audio.currentTime = video.currentTime;
    }

    // Sync play/pause state
    if (video.paused && !audio.paused) {
      audio.pause();
    } else if (!video.paused && audio.paused) {
      audio.play().catch(() => {});
    }

    setAudioState(s => ({ ...s, currentTime: audio.currentTime }));
  }, [isActive, videoRef]);

  // Listen to video events for sync
  useEffect(() => {
    if (!videoRef.current || !isActive) return;

    const video = videoRef.current;

    const handlePlay = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = video.currentTime;
        audioRef.current.play().catch(() => {});
      }
    };

    const handlePause = () => {
      audioRef.current?.pause();
    };

    const handleSeeked = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = video.currentTime;
      }
    };

    const handleTimeUpdate = () => {
      // Throttle sync to every 500ms
      const now = Date.now();
      if (now - lastSyncTime.current > 500) {
        syncAudioToVideo();
        lastSyncTime.current = now;
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [isActive, syncAudioToVideo, videoRef]);

  // Mute/unmute video based on custom audio state
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive && audioUrl) {
      videoRef.current.muted = true;
    }
  }, [isActive, audioUrl, videoRef]);

  // Activate/deactivate custom audio
  const toggleCustomAudio = useCallback(() => {
    if (!audioRef.current || !videoRef.current) return;

    const newActive = !audioState.isActive;
    setAudioState(s => ({ ...s, isActive: newActive }));

    if (newActive) {
      videoRef.current.muted = true;
      audioRef.current.currentTime = videoRef.current.currentTime;
      if (!videoRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      videoRef.current.muted = false;
      audioRef.current.pause();
    }
  }, [audioState.isActive, videoRef]);

  return {
    audioRef,
    audioState,
    toggleCustomAudio,
    setActive: (active: boolean) => {
      setAudioState(s => ({ ...s, isActive: active }));
      if (videoRef.current) {
        videoRef.current.muted = active;
      }
      if (audioRef.current) {
        if (active && videoRef.current && !videoRef.current.paused) {
          audioRef.current.currentTime = videoRef.current.currentTime;
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      }
    },
  };
}
