import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCardLive from '@/components/anime/AnimeCardLive';
import { useHomeData, useCategory } from '@/hooks/useAnime';
import { AnimeResult } from '@/lib/api';

interface AnimeSectionLiveProps {
  title: string;
  subtitle?: string;
  animeList: AnimeResult[];
  viewAllLink?: string;
  isLoading?: boolean;
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
  const trending = data?.data?.trendingAnimes || [];
  
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
  const topAiring = data?.data?.topAiringAnimes || [];
  
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
  const latest = data?.data?.latestEpisodeAnimes || [];
  
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
  const upcoming = data?.data?.topUpcomingAnimes || [];
  
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
  const { data, isLoading } = useCategory('most-popular');
  const popular = data?.data?.animes || [];
  
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
