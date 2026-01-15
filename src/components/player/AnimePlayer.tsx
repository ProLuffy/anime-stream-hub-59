import React, { useEffect, useRef, useState } from 'react';
import { animeService } from '../../lib/api';
import { Settings, Subtitles, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerProps {
  episodeId: string;
  server?: string;
}

export default function AnimePlayer({ episodeId, server = 'hd-1' }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sources, setSources] = useState<any>(null);
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string>('Original');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'sub' | 'audio'>('sub');

  // Audio Sync Logic
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const syncPlay = () => audio.play().catch(() => {});
    const syncPause = () => audio.pause();
    const syncSeek = () => {
        if (Math.abs(audio.currentTime - video.currentTime) > 0.3) {
            audio.currentTime = video.currentTime;
        }
    };
    const syncRate = () => audio.playbackRate = video.playbackRate;

    video.addEventListener('play', syncPlay);
    video.addEventListener('pause', syncPause);
    video.addEventListener('seeking', syncSeek);
    video.addEventListener('ratechange', syncRate);
    video.addEventListener('timeupdate', syncSeek);

    return () => {
        video.removeEventListener('play', syncPlay);
        video.removeEventListener('pause', syncPause);
        video.removeEventListener('seeking', syncSeek);
        video.removeEventListener('ratechange', syncRate);
        video.removeEventListener('timeupdate', syncSeek);
    };
  }, [currentAudio]);

  // Handle Audio Switching
  useEffect(() => {
      if (!videoRef.current) return;
      const track = audioTracks.find(t => t.label === currentAudio);
      if (track && track.url !== 'orig') {
          // Custom Audio Selected
          videoRef.current.muted = true;
          if (audioRef.current) {
              audioRef.current.src = track.url;
              audioRef.current.currentTime = videoRef.current.currentTime;
              if (!videoRef.current.paused) audioRef.current.play();
          }
      } else {
          // Original Audio
          videoRef.current.muted = false;
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.src = "";
          }
      }
  }, [currentAudio, audioTracks]);

  useEffect(() => {
    async function loadSources() {
      setLoading(true);
      try {
        const data = await animeService.getEpisodeSources(episodeId, server);
        setSources(data);

        // Handle Subtitles
        // Merge API subtitles with custom overlays if any (passed via logic or separate fetch)
        // For now, using API subs.
        const apiSubs = data.subtitles || [];
        setSubtitles(apiSubs);

        // Set default English sub
        const engSub = apiSubs.find((s: any) => s.lang?.toLowerCase().includes('english'));
        if (engSub) setCurrentSub(engSub.url);

        // Mock Audio Tracks if none (for demo of UI)
        setAudioTracks([{ label: 'Original (Japanese)', url: 'orig' }, { label: 'English Dub (Mock)', url: 'eng-dub' }]);

      } catch (error) {
        console.error("Error loading player sources", error);
      } finally {
        setLoading(false);
      }
    }
    loadSources();
  }, [episodeId, server]);

  useEffect(() => {
    if (videoRef.current && currentSub) {
       const oldTracks = videoRef.current.getElementsByTagName('track');
       while (oldTracks.length > 0) {
         videoRef.current.removeChild(oldTracks[0]);
       }

       const track = document.createElement('track');
       track.kind = 'subtitles';
       track.label = 'Active';
       track.srclang = 'en';
       track.src = currentSub;
       track.default = true;
       videoRef.current.appendChild(track);
    } else if (videoRef.current && !currentSub) {
        // Remove tracks if Off
       const oldTracks = videoRef.current.getElementsByTagName('track');
       while (oldTracks.length > 0) {
         videoRef.current.removeChild(oldTracks[0]);
       }
    }
  }, [currentSub]);

  if (loading) return <div className="aspect-video bg-zinc-900 flex items-center justify-center text-white/50 animate-pulse rounded-lg">Loading Stream...</div>;
  if (!sources || !sources.sources || sources.sources.length === 0) return <div className="aspect-video bg-zinc-900 flex items-center justify-center text-red-400 rounded-lg">Stream Unavailable</div>;

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group font-sans">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        crossOrigin="anonymous"
        poster={sources.poster}
      >
        <source src={sources.sources[0].url} type="application/x-mpegURL" />
        <source src={sources.sources[0].url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <audio ref={audioRef} className="hidden" />

      {/* Netflix-style Settings Overlay */}
      <div className="absolute top-4 right-4 z-50">
        <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-black/60 hover:bg-black/80 backdrop-blur-md p-2 rounded-full text-white transition-all transform hover:scale-110 hover:rotate-90"
        >
            <Settings className="w-6 h-6" />
        </button>

        <AnimatePresence>
            {showSettings && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute right-0 mt-2 w-72 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                >
                    <div className="flex border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('audio')}
                            className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'audio' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <Volume2 className="w-4 h-4" /> Audio
                        </button>
                        <button
                            onClick={() => setActiveTab('sub')}
                            className={`flex-1 p-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'sub' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <Subtitles className="w-4 h-4" /> Subtitles
                        </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20">
                        {activeTab === 'audio' ? (
                            <div className="space-y-1">
                                {audioTracks.map((track, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentAudio(track.label)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentAudio === track.label ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                    >
                                        {track.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <button
                                    onClick={() => setCurrentSub(null)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentSub === null ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                >
                                    Off
                                </button>
                                {subtitles.map((sub, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSub(sub.url)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentSub === sub.url ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                    >
                                        {sub.lang}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}
