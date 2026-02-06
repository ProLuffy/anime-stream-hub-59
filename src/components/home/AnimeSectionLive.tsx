import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCardLive from '@/components/anime/AnimeCardLive';
import { useHomeData } from '@/hooks/useAnime';
import { AnimeResult, HomeData } from '@/lib/api';

interface AnimeSectionLiveProps {
  title: string;
  subtitle?: string;
  animeList: AnimeResult[];
  viewAllLink?: string;
  isLoading?: boolean;
}

// Helper to safely extract anime array from various data structures
function getAnimeArray(data: HomeData | undefined, ...keys: string[]): AnimeResult[] {
  if (!data?.data) return [];
  
  const d = data.data as any;
  
  for (const key of keys) {
    // Handle nested keys like top10Animes.today
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      if (d[parent]?.[child] && Array.isArray(d[parent][child])) {
        return d[parent][child];
      }
      continue;
    }
    // Direct key access
    if (Array.isArray(d[key]) && d[key].length > 0) {
      return d[key];
    }
  }
  
  return [];
}

function AnimeSectionLive({ title, subtitle, animeList, viewAllLink, isLoading }: AnimeSectionLiveProps) {
  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-6"
        >
          <div>
            <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
            )}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </motion.div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : animeList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
            {animeList.map((anime, index) => (
              <AnimeCardLive key={anime.id} anime={anime} index={index} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground">No anime found</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function TrendingSectionLive() {
  const { data, isLoading } = useHomeData();
  // API returns: newAdded, mostFavorite, latestEpisode, mostPopular, latestCompleted
  const trending = getAnimeArray(data, 
    'trendingAnimes', 'trending',
    'newAdded',        // actual API field
    'mostFavorite',    // fallback
  );
  
  return (
    <AnimeSectionLive
      title="🔥 Trending Now"
      subtitle="Most watched this season"
      animeList={trending.slice(0, 12)}
      viewAllLink="/category/trending"
      isLoading={isLoading}
    />
  );
}

export function TopAiringSectionLive() {
  const { data, isLoading } = useHomeData();
  const topAiring = getAnimeArray(data,
    'topAiringAnimes', 'topAiring',
    'latestEpisode',    // actual API field - currently airing with new eps
    'top10Animes.today',
  );
  
  return (
    <AnimeSectionLive
      title="📺 Top Airing"
      subtitle="Currently on air"
      animeList={topAiring.slice(0, 12)}
      viewAllLink="/category/top-airing"
      isLoading={isLoading}
    />
  );
}

export function LatestEpisodesSectionLive() {
  const { data, isLoading } = useHomeData();
  const latest = getAnimeArray(data,
    'latestEpisodeAnimes', 'latestEpisodes',
    'latestEpisode',     // actual API field
    'newAdded',          // fallback
  );
  
  return (
    <AnimeSectionLive
      title="✨ Latest Episodes"
      subtitle="Recently updated"
      animeList={latest.slice(0, 12)}
      viewAllLink="/category/recently-updated"
      isLoading={isLoading}
    />
  );
}

export function UpcomingSectionLive() {
  const { data, isLoading } = useHomeData();
  const upcoming = getAnimeArray(data,
    'topUpcomingAnimes', 'topUpcoming',
    'latestCompleted',   // actual API field as fallback
  );
  
  return (
    <AnimeSectionLive
      title="🚀 Top Upcoming"
      subtitle="Coming soon"
      animeList={upcoming.slice(0, 12)}
      viewAllLink="/category/top-upcoming"
      isLoading={isLoading}
    />
  );
}

export function MostPopularSectionLive() {
  const { data, isLoading } = useHomeData();
  const popular = getAnimeArray(data,
    'mostPopularAnimes',
    'mostPopular',       // actual API field ✅
    'mostFavorite',      // fallback
    'top10Animes.week',
  );
  
  return (
    <AnimeSectionLive
      title="⭐ Most Popular"
      subtitle="All-time favorites"
      animeList={popular.slice(0, 12)}
      viewAllLink="/category/most-popular"
      isLoading={isLoading}
    />
  );
}

export default AnimeSectionLive;
