import React, { useEffect, useRef, useState } from 'react';
import { animeService } from '../../lib/api';
import { Settings, Subtitles, Volume2, Server, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerProps {
  episodeId: string;
}

export default function AnimePlayer({ episodeId }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Data States
  const [servers, setServers] = useState<any[]>([]);
  const [currentServer, setCurrentServer] = useState<string>('hd-1');
  const [sources, setSources] = useState<any>(null);

  // Media States
  const [subtitles, setSubtitles] = useState<any[]>([]);
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string>('Original');

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'sub' | 'audio' | 'server'>('server');

  // Premium Logic
  const [watchTime, setWatchTime] = useState(0);
  const [showPremiumLock, setShowPremiumLock] = useState(false);
  // Mock premium check - in real app, check user.isPremium
  const isPremium = false;
  const FREE_LIMIT = 60; // seconds

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

    const handleTimeUpdate = () => {
        syncSeek();
        if (!isPremium && video.currentTime > FREE_LIMIT) {
            video.pause();
            setShowPremiumLock(true);
        }
    };

    video.addEventListener('play', syncPlay);
    video.addEventListener('pause', syncPause);
    video.addEventListener('seeking', syncSeek);
    video.addEventListener('ratechange', syncRate);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
        video.removeEventListener('play', syncPlay);
        video.removeEventListener('pause', syncPause);
        video.removeEventListener('seeking', syncSeek);
        video.removeEventListener('ratechange', syncRate);
        video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [currentAudio, isPremium]);

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

  // Fetch Servers
  useEffect(() => {
      async function loadServers() {
          try {
              const data = await animeService.fetchEpisodeServers(episodeId);
              // data.data.sub or data.data.dub array
              const serverList = data.data?.sub || data.data?.dub || [];
              setServers(serverList);
              if (serverList.length > 0) {
                  // Prefer VidStreaming / HD-1
                  const preferred = serverList.find((s: any) => s.serverName === 'HD-1' || s.serverName === 'VidStreaming');
                  setCurrentServer(preferred ? preferred.serverName : serverList[0].serverName);
              }
          } catch (err) {
              console.error("Failed to load servers", err);
          }
      }
      loadServers();
  }, [episodeId]);

  // Fetch Sources when Server/Episode Changes
  useEffect(() => {
    async function loadSources() {
      if (!currentServer) return;

      setLoading(true);
      setError(null);
      setSources(null);

      try {
        // Map server name to API ID if needed, or pass as is depending on API requirement.
        // Hianime API usually takes 'hd-1', 'hd-2' etc. assuming serverName matches or we extract it.
        // If server object has 'serverId', might need mapping.
        // For now using the serverName lowercased/formatted.
        const serverParam = currentServer.toLowerCase().replace(' ', '-');

        const data = await animeService.getEpisodeSources(episodeId, serverParam);

        if (!data || !data.sources) {
            throw new Error("No sources found");
        }

        setSources(data);

        // Handle Subtitles
        const apiSubs = data.subtitles || [];
        setSubtitles(apiSubs);

        // Set default English sub
        const engSub = apiSubs.find((s: any) => s.lang?.toLowerCase().includes('english'));
        if (engSub) setCurrentSub(engSub.url);

        // Mock Audio Tracks if none (for demo of UI)
        setAudioTracks([{ label: 'Original (Japanese)', url: 'orig' }, { label: 'English Dub (Mock)', url: 'eng-dub' }]);

      } catch (error) {
        console.error("Error loading player sources", error);
        setError("Failed to load stream. Try switching servers.");
      } finally {
        setLoading(false);
      }
    }
    loadSources();
  }, [episodeId, currentServer]);

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

  if (loading) return (
      <div className="aspect-video bg-zinc-900 flex flex-col items-center justify-center text-white/50 rounded-lg gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          <p>Connecting to {currentServer}...</p>
      </div>
  );

  if (error) return (
      <div className="aspect-video bg-zinc-900 flex flex-col items-center justify-center text-red-400 rounded-lg gap-4">
          <AlertTriangle className="w-10 h-10" />
          <p>{error}</p>
          <div className="flex gap-2">
              {servers.map(s => (
                  <button
                    key={s.serverId}
                    onClick={() => setCurrentServer(s.serverName)}
                    className="px-3 py-1 bg-white/10 rounded hover:bg-white/20 text-white text-xs"
                  >
                      Switch to {s.serverName}
                  </button>
              ))}
          </div>
      </div>
  );

  if (!sources || !sources.sources || sources.sources.length === 0) return <div className="aspect-video bg-zinc-900 flex items-center justify-center text-red-400 rounded-lg">Stream Unavailable</div>;

  return (
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group font-sans">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        crossOrigin="anonymous"
        poster={sources.poster}
        key={sources.sources[0].url} // Force reload on source change
      >
        <source src={sources.sources[0].url} type="application/x-mpegURL" />
        <source src={sources.sources[0].url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <audio ref={audioRef} className="hidden" />

      {/* Premium Lock Overlay */}
      {showPremiumLock && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-[60] flex flex-col items-center justify-center text-center p-6">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-[1px] rounded-2xl">
                  <div className="bg-black rounded-2xl p-8 max-w-md">
                      <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                          Free Preview Ended
                      </h3>
                      <p className="text-gray-400 mb-6">
                          Go Premium to continue watching this episode and unlock unlimited access to the entire library.
                      </p>
                      <button className="w-full bg-white text-black font-bold py-3 rounded-xl hover:scale-105 transition-transform">
                          Upgrade to Premium
                      </button>
                  </div>
              </div>
          </div>
      )}

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
                            onClick={() => setActiveTab('server')}
                            className={`flex-1 p-3 text-xs font-medium flex flex-col items-center justify-center gap-1 ${activeTab === 'server' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <Server className="w-4 h-4" /> Server
                        </button>
                        <button
                            onClick={() => setActiveTab('audio')}
                            className={`flex-1 p-3 text-xs font-medium flex flex-col items-center justify-center gap-1 ${activeTab === 'audio' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <Volume2 className="w-4 h-4" /> Audio
                        </button>
                        <button
                            onClick={() => setActiveTab('sub')}
                            className={`flex-1 p-3 text-xs font-medium flex flex-col items-center justify-center gap-1 ${activeTab === 'sub' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <Subtitles className="w-4 h-4" /> Subtitles
                        </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20">
                        {activeTab === 'server' && (
                            <div className="space-y-1">
                                {servers.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentServer(s.serverName)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentServer === s.serverName ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                    >
                                        {s.serverName}
                                    </button>
                                ))}
                            </div>
                        )}
                        {activeTab === 'audio' && (
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
                        )}
                        {activeTab === 'sub' && (
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
