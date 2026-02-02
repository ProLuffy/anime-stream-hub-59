import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, List, Loader2, AlertCircle, 
  Tv, Mic, Download, Subtitles, Languages, Crown, RefreshCw
} from 'lucide-react';
import Header from '@/components/layout/Header';
import VideoPlayer from '@/components/player/VideoPlayer';
import { useAnimeInfo, useEpisodes } from '@/hooks/useAnime';
import { useAuth } from '@/contexts/AuthContext';
import Disclaimer from '@/components/ui/Disclaimer';
import { toast } from 'sonner';
import { useCustomStream } from '@/hooks/useCustomStream';
import { requestMuxedDownload } from '@/lib/customBackend';
import { resolveStreamFast, SERVER_PRIORITY } from '@/lib/streamResolver';

// Available languages for dub
const DUB_LANGUAGES = [
  { code: 'sub', name: 'Japanese (Sub)', flag: '🇯🇵' },
  { code: 'dub', name: 'English (Dub)', flag: '🇺🇸' },
  { code: 'raw', name: 'Raw (No Subs)', flag: '🌐' },
];

// Available subtitle languages
const SUBTITLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', premium: true },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
];

export default function WatchPageLive() {
  const { id, episodeId } = useParams();
  const navigate = useNavigate();
  const { isPremium, updateWatchHistory } = useAuth();
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [selectedServer, setSelectedServer] = useState('hd-1');
  const [selectedCategory, setSelectedCategory] = useState<'sub' | 'dub' | 'raw'>('sub');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Stream state
  const [streamData, setStreamData] = useState<{
    sources: any[];
    subtitles: any[];
    intro?: any;
    outro?: any;
  } | null>(null);
  const [isLoadingStream, setIsLoadingStream] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Language dropdown states
  const [showDubDropdown, setShowDubDropdown] = useState(false);
  const [showSubDropdown, setShowSubDropdown] = useState(false);

  const { data: animeData } = useAnimeInfo(id || '');
  const { data: episodesData } = useEpisodes(id || '');
  
  // Fetch custom Hindi audio/subtitles from your backend
  const { customData: customStream } = useCustomStream({ episodeId: episodeId || '', lang: 'hindi' });

  // Handle both API structures
  const rawData = animeData?.data;
  const anime = rawData?.anime || rawData;
  const animeInfo = anime?.info || anime;
  const animeName = animeInfo?.name || animeInfo?.title;
  const animePoster = animeInfo?.poster;
  
  // Episodes: new API returns array directly
  const episodes = Array.isArray(episodesData?.data) 
    ? episodesData.data.map((ep: any) => ({
        episodeId: ep.id,
        number: ep.episodeNumber,
        title: ep.title,
        isFiller: ep.isFiller,
      }))
    : episodesData?.data?.episodes || [];

  // Find current episode info
  const currentEpisode = episodes.find((ep: any) => ep.episodeId === episodeId);
  const currentIndex = episodes.findIndex((ep: any) => ep.episodeId === episodeId);
  const prevEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  // Load stream with auto-retry
  const loadStream = useCallback(async () => {
    if (!episodeId) return;
    
    setIsLoadingStream(true);
    setStreamError(null);
    
    try {
      const result = await resolveStreamFast(episodeId, selectedCategory);
      
      if (result.success) {
        setStreamData({
          sources: result.sources,
          subtitles: result.subtitles,
          intro: result.intro,
          outro: result.outro,
        });
        setSelectedServer(result.server);
        
        if (result.server !== 'hd-1') {
          toast.success(`Connected via ${result.server.toUpperCase()}`);
        }
      } else {
        setStreamError(result.error || 'Stream not available');
      }
    } catch (error: any) {
      setStreamError(error.message || 'Failed to load stream');
    } finally {
      setIsLoadingStream(false);
      setIsRetrying(false);
    }
  }, [episodeId, selectedCategory]);

  // Load stream on mount and when category changes
  useEffect(() => {
    loadStream();
  }, [loadStream]);

  // Update watch history
  useEffect(() => {
    if (id && episodeId) {
      updateWatchHistory(id, episodeId, 0);
    }
  }, [id, episodeId]);

  // Format sources for VideoPlayer
  const playerSources = streamData?.sources?.map((s: any) => ({
    url: s.url,
    quality: s.quality || 'auto',
    type: s.type || 'hls',
  })) || [];

  const playerSubtitles = streamData?.subtitles?.map((s: any) => ({
    url: s.file || s.url,
    lang: s.label || s.lang || 'English',
    label: s.label || s.lang,
  })) || [];

  const handleRetry = () => {
    setIsRetrying(true);
    loadStream();
  };

  const handleCategoryChange = (category: 'sub' | 'dub' | 'raw') => {
    setSelectedCategory(category);
    setShowDubDropdown(false);
    toast.info(`Switching to ${DUB_LANGUAGES.find(l => l.code === category)?.name}...`);
  };

  const handleSubtitleRequest = () => {
    if (!isPremium) {
      toast.error('Subtitle requests are a Premium feature');
      navigate('/premium');
      return;
    }
    
    navigate(`/request-subtitle?animeId=${id}&animeName=${encodeURIComponent(animeName || '')}&episodeId=${episodeId}&episodeNumber=${currentEpisode?.number || 1}`);
  };

  const handleDownload = async () => {
    if (!isPremium) {
      toast.error('Download is a Premium feature. Upgrade to download!');
      navigate('/premium');
      return;
    }
    
    if (streamData?.sources && streamData.sources.length > 0) {
      setIsDownloading(true);
      toast.info('Preparing file... This may take a moment.');
      
      try {
        const response = await requestMuxedDownload(
          streamData.sources[0]?.url,
          customStream?.audioUrl,
          customStream?.subtitleUrl
        );
        
        if (response.success && response.downloadUrl) {
          window.open(response.downloadUrl, '_blank');
          toast.success('Download ready!');
        } else {
          const downloadItem = {
            id: Date.now().toString(),
            animeId: id,
            animeName: animeName || 'Unknown',
            episodeNumber: currentEpisode?.number || 1,
            episodeTitle: currentEpisode?.title || 'Episode',
            poster: animePoster || '/placeholder.svg',
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
      } catch (error) {
        toast.error('Download failed. Please try again.');
      } finally {
        setIsDownloading(false);
      }
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

  if (!animeName) {
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
            {isLoadingStream ? (
              <div className="aspect-video rounded-2xl bg-card flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    {isRetrying ? 'Trying different servers...' : 'Loading stream...'}
                  </p>
                </div>
              </div>
            ) : streamError || playerSources.length === 0 ? (
              <div className="aspect-video rounded-2xl bg-card flex items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
                  <p className="font-semibold mb-2">Stream Not Available</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {streamError || 'Try another server or language option.'}
                  </p>
                  <button
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                    {isRetrying ? 'Retrying...' : 'Try Again'}
                  </button>
                </div>
              </div>
            ) : (
              <VideoPlayer
                sources={playerSources}
                subtitles={playerSubtitles}
                poster={animePoster}
                title={animeName}
                episodeTitle={`Episode ${currentEpisode?.number}: ${currentEpisode?.title || ''}`}
                onPrevious={goToPrevious}
                onNext={goToNext}
                hasPrevious={!!prevEpisode}
                hasNext={!!nextEpisode}
                intro={streamData?.intro}
                outro={streamData?.outro}
                customStream={customStream}
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
                  {animeName}
                </Link>
                <p className="text-muted-foreground">
                  Episode {currentEpisode?.number}: {currentEpisode?.title || 'Unknown'}
                </p>
              </div>

              {/* Server & Category Selection */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* DUB/Language Selection */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDubDropdown(!showDubDropdown);
                      setShowSubDropdown(false);
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                      selectedCategory === 'dub' ? 'bg-green-500 text-white' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {selectedCategory === 'sub' ? 'SUB' : selectedCategory === 'dub' ? 'DUB' : 'RAW'}
                  </button>
                  
                  {showDubDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-2 p-2 bg-card rounded-xl border border-border shadow-xl z-50 min-w-[180px]"
                    >
                      {DUB_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => handleCategoryChange(lang.code as any)}
                          className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-3 transition-colors ${
                            selectedCategory === lang.code ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Subtitle Selection */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowSubDropdown(!showSubDropdown);
                      setShowDubDropdown(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Subtitles className="w-4 h-4" />
                    Subtitles
                  </button>
                  
                  {showSubDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-2 p-2 bg-card rounded-xl border border-border shadow-xl z-50 min-w-[220px]"
                    >
                      <p className="px-3 py-1.5 text-xs text-muted-foreground font-medium">Available Subtitles</p>
                      
                      {SUBTITLE_LANGUAGES.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            if (lang.premium && !isPremium) {
                              toast.error('This is a Premium feature');
                              navigate('/premium');
                            } else {
                              toast.success(`${lang.name} subtitles selected`);
                            }
                            setShowSubDropdown(false);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </div>
                          {lang.premium && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </button>
                      ))}
                      
                      <div className="border-t border-border mt-2 pt-2">
                        <button
                          onClick={handleSubtitleRequest}
                          className="w-full px-3 py-2 rounded-lg text-left text-sm flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-colors"
                        >
                          <Languages className="w-4 h-4 text-purple-400" />
                          <span>Request Subtitle</span>
                          <Crown className="w-4 h-4 text-yellow-500 ml-auto" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Server Selection */}
                <select
                  value={selectedServer}
                  onChange={(e) => {
                    setSelectedServer(e.target.value);
                    loadStream();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-secondary text-sm outline-none"
                >
                  {SERVER_PRIORITY.slice(0, 4).map((server) => (
                    <option key={server} value={server}>
                      {server.toUpperCase()}
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
                  disabled={isDownloading}
                >
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isDownloading ? 'Preparing...' : isPremium ? 'Download' : 'Premium'}
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
      
      {/* Close dropdowns on outside click */}
      {(showDubDropdown || showSubDropdown) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowDubDropdown(false);
            setShowSubDropdown(false);
          }}
        />
      )}
    </div>
  );
}
