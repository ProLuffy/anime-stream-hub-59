import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, Loader2, AlertCircle, Tv, Mic, Download } from 'lucide-react';
import Header from '@/components/layout/Header';
import VideoPlayer from '@/components/player/VideoPlayer';
import { useAnimeInfo, useEpisodes, useEpisodeSources } from '@/hooks/useAnime';
import { useAuth } from '@/contexts/AuthContext';
import Disclaimer from '@/components/ui/Disclaimer';
import { toast } from 'sonner';

const SERVERS = [
  { id: 'vidcloud', name: 'VidCloud' },
  { id: 'vidstreaming', name: 'VidStreaming' },
  { id: 'streamsb', name: 'StreamSB' },
  { id: 'streamtape', name: 'StreamTape' },
];

export default function WatchPageLive() {
  const { id, episodeId } = useParams();
  const navigate = useNavigate();
  const { isPremium, updateWatchHistory } = useAuth();
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [selectedServer, setSelectedServer] = useState('vidcloud');
  const [selectedCategory, setSelectedCategory] = useState<'sub' | 'dub'>('sub');

  const { data: animeData } = useAnimeInfo(id || '');
  const { data: episodesData } = useEpisodes(id || '');
  const { data: sourcesData, isLoading: sourcesLoading, error: sourcesError, refetch } = useEpisodeSources(
    episodeId || '',
    selectedServer,
    selectedCategory
  );

  const anime = animeData?.data?.anime;
  const episodes = episodesData?.data?.episodes || [];
  const sources = sourcesData?.data?.sources || [];
  const subtitles = sourcesData?.data?.tracks || sourcesData?.data?.subtitles || [];
  const intro = sourcesData?.data?.intro;
  const outro = sourcesData?.data?.outro;

  // Find current episode info
  const currentEpisode = episodes.find((ep: any) => ep.episodeId === episodeId);
  const currentIndex = episodes.findIndex((ep: any) => ep.episodeId === episodeId);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  // Update watch history
  useEffect(() => {
    if (id && episodeId) {
      updateWatchHistory(id, episodeId, 0);
    }
  }, [id, episodeId]);

  // Format sources for VideoPlayer
  const playerSources = sources.map((s: any) => ({
    url: s.url,
    quality: s.quality || 'auto',
    type: s.type || 'hls',
  }));

  const playerSubtitles = subtitles.map((s: any) => ({
    url: s.file || s.url,
    lang: s.label || s.lang || 'English',
    label: s.label || s.lang,
  }));

  const handleDownload = () => {
    if (!isPremium) {
      toast.error('Download is a Premium feature. Upgrade to download!');
      navigate('/premium');
      return;
    }
    
    if (sources.length > 0) {
      // Add to downloads
      const downloadItem = {
        id: Date.now().toString(),
        animeId: id,
        animeName: anime?.info?.name || 'Unknown',
        episodeNumber: currentEpisode?.number || 1,
        episodeTitle: currentEpisode?.title || 'Episode',
        poster: anime?.info?.poster || '/placeholder.svg',
        quality: '1080p',
        size: '400 MB',
        progress: 0,
        status: 'downloading' as const,
        downloadedAt: Date.now(),
        speed: '2.1 MB/s',
      };
      
      const existing = JSON.parse(localStorage.getItem('anicrew-downloads') || '[]');
      localStorage.setItem('anicrew-downloads', JSON.stringify([downloadItem, ...existing]));
      
      toast.success('Download added! Check Downloads page.');
      navigate('/downloads');
    }
  };

  const goToPrevious = () => {
    if (prevEpisode) {
      navigate(`/watch/${id}/${prevEpisode.episodeId}`);
    }
  };

  const goToNext = () => {
    if (nextEpisode) {
      navigate(`/watch/${id}/${nextEpisode.episodeId}`);
    }
  };

  if (!anime) {
    return (
      <div className="min-h-screen theme-transition">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-transition bg-background">
      <Header />

      <main className="pt-20">
        {/* Video Player Area */}
        <section className="relative">
          <div className="container mx-auto px-4">
            {sourcesLoading ? (
              <div className="aspect-video rounded-2xl bg-card flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading stream...</p>
                </div>
              </div>
            ) : sourcesError || sources.length === 0 ? (
              <div className="aspect-video rounded-2xl bg-card flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                  <p className="font-semibold mb-2">Stream Not Available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Try another server or language option.
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="btn-ghost"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <VideoPlayer
                sources={playerSources}
                subtitles={playerSubtitles}
                poster={anime.info?.poster}
                title={anime.info?.name}
                episodeTitle={`Episode ${currentEpisode?.number}: ${currentEpisode?.title || ''}`}
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasPrevious={!!prevEpisode}
                hasNext={!!nextEpisode}
                intro={intro}
                outro={outro}
              />
            )}
          </div>
        </section>

        {/* Episode Navigation & Controls */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            {/* Episode Info */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <Link to={`/anime/${id}`} className="text-xl font-bold hover:text-primary transition-colors">
                  {anime.info?.name}
                </Link>
                <p className="text-muted-foreground">
                  Episode {currentEpisode?.number}: {currentEpisode?.title || 'Unknown'}
                </p>
              </div>

              {/* Server & Category Selection */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Category Toggle */}
                <div className="flex bg-secondary/50 rounded-xl p-1">
                  <button
                    onClick={() => setSelectedCategory('sub')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      selectedCategory === 'sub'
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Tv className="w-4 h-4" />
                    SUB
                  </button>
                  <button
                    onClick={() => setSelectedCategory('dub')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                      selectedCategory === 'dub'
                        ? 'bg-green-500 text-white'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    DUB
                  </button>
                </div>

                {/* Server Selection */}
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-sm outline-none"
                >
                  {SERVERS.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name}
                    </option>
                  ))}
                </select>

                {/* Download Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                    isPremium
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {isPremium ? 'Download' : 'Premium'}
                </motion.button>

                {/* Episode List Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  className={`p-2.5 rounded-xl transition-colors ${
                    showEpisodes ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mb-4">
              <Disclaimer />
            </div>

            {/* Prev/Next Navigation */}
            <div className="flex items-center justify-between gap-4">
              <motion.button
                whileHover={{ scale: prevEpisode ? 1.02 : 1 }}
                whileTap={{ scale: prevEpisode ? 0.98 : 1 }}
                onClick={goToPrevious}
                disabled={!prevEpisode}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${
                  prevEpisode 
                    ? 'glass-card hover:border-primary/50 cursor-pointer' 
                    : 'bg-secondary/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Previous Episode</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: nextEpisode ? 1.02 : 1 }}
                whileTap={{ scale: nextEpisode ? 0.98 : 1 }}
                onClick={goToNext}
                disabled={!nextEpisode}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${
                  nextEpisode 
                    ? 'glass-card hover:border-primary/50 cursor-pointer' 
                    : 'bg-secondary/30 opacity-50 cursor-not-allowed'
                }`}
              >
                <span>Next Episode</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Episode Grid */}
            {showEpisodes && episodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 glass-card p-4 max-h-80 overflow-y-auto"
              >
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                  {episodes.map((ep: any) => (
                    <motion.button
                      key={ep.episodeId}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/watch/${id}/${ep.episodeId}`)}
                      className={`p-2.5 rounded-lg text-center text-sm font-medium transition-colors ${
                        ep.episodeId === episodeId
                          ? 'bg-primary text-primary-foreground'
                          : ep.isFiller
                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
                            : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      title={ep.title}
                    >
                      {ep.number}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
