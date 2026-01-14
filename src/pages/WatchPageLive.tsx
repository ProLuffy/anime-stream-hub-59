import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, ExternalLink, Loader2, AlertCircle, Server, Tv, Mic } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAnimeInfo, useEpisodes, useEpisodeServers, useEpisodeSources } from '@/hooks/useAnime';
import Disclaimer from '@/components/ui/Disclaimer';

export default function WatchPageLive() {
  const { id, episodeId } = useParams();
  const navigate = useNavigate();
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [selectedServer, setSelectedServer] = useState('hd-1');
  const [selectedCategory, setSelectedCategory] = useState<'sub' | 'dub'>('sub');

  const { data: animeData } = useAnimeInfo(id || '');
  const { data: episodesData } = useEpisodes(id || '');
  const { data: serversData, isLoading: serversLoading } = useEpisodeServers(episodeId || '');
  const { data: sourcesData, isLoading: sourcesLoading, error: sourcesError } = useEpisodeSources(
    episodeId || '',
    selectedServer,
    selectedCategory
  );

  const anime = animeData?.data?.anime;
  const episodes = episodesData?.data?.episodes || [];
  const servers = serversData?.data || {};
  const sources = sourcesData?.data?.sources || [];
  const subtitles = sourcesData?.data?.tracks || [];

  // Find current episode info
  const currentEpisode = episodes.find((ep: any) => ep.episodeId === episodeId);
  const currentIndex = episodes.findIndex((ep: any) => ep.episodeId === episodeId);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  // Get available servers by category
  const subServers = servers.sub || [];
  const dubServers = servers.dub || [];

  // Select first available server on load
  useEffect(() => {
    if (subServers.length > 0 && selectedCategory === 'sub') {
      setSelectedServer(subServers[0]?.serverName || 'hd-1');
    } else if (dubServers.length > 0 && selectedCategory === 'dub') {
      setSelectedServer(dubServers[0]?.serverName || 'hd-1');
    }
  }, [subServers, dubServers, selectedCategory]);

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
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl"
              style={{
                boxShadow: '0 0 80px hsl(var(--primary) / 0.15)',
              }}
            >
              {sourcesLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-background">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading stream sources...</p>
                  </div>
                </div>
              ) : sourcesError || sources.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-background">
                  <div className="text-center max-w-md px-4">
                    <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                    <p className="font-semibold mb-2">Stream Not Available</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      This stream is provided by third-party servers. Please try another server or check back later.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tip: Try switching between SUB/DUB or selecting a different server.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-card to-background p-8">
                  <Server className="w-12 h-12 text-primary mb-4" />
                  <p className="font-semibold mb-2">External Stream Available</p>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                    Click below to open the stream in a new tab. Playback is handled by third-party providers.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {sources.map((source: any, idx: number) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-hero flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="relative z-10">
                          Watch {source.quality || `Source ${idx + 1}`}
                        </span>
                      </a>
                    ))}
                  </div>
                  {subtitles.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-4">
                      {subtitles.length} subtitle(s) available
                    </p>
                  )}
                </div>
              )}

              {/* Vignette Effect */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.3)',
              }} />
            </motion.div>
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
                {!serversLoading && (
                  <select
                    value={selectedServer}
                    onChange={(e) => setSelectedServer(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-secondary text-sm outline-none"
                  >
                    {(selectedCategory === 'sub' ? subServers : dubServers).map((server: any) => (
                      <option key={server.serverName} value={server.serverName}>
                        {server.serverName?.toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}

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
                onClick={() => prevEpisode && navigate(`/watch/${id}/${prevEpisode.episodeId}`)}
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
                onClick={() => nextEpisode && navigate(`/watch/${id}/${nextEpisode.episodeId}`)}
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
