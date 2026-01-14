import React from 'react';
import { motion } from 'framer-motion';
import AnimeCard from '@/components/anime/AnimeCard';
import { mockAnimeList, Anime } from '@/data/animeData';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AnimeSectionProps {
  title: string;
  subtitle?: string;
  animeList: Anime[];
  viewAllLink?: string;
}

export default function AnimeSection({ title, subtitle, animeList, viewAllLink }: AnimeSectionProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {animeList.map((anime, index) => (
            <AnimeCard key={anime.id} anime={anime} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrendingSection() {
  const trending = mockAnimeList.filter(a => a.rating >= 8.5).slice(0, 6);
  return (
    <AnimeSection
      title="🔥 Trending Now"
      subtitle="Most watched this week"
      animeList={trending}
      viewAllLink="/anime"
    />
  );
}

export function NewReleasesSection() {
  const newReleases = mockAnimeList.filter(a => a.year >= 2024).slice(0, 6);
  return (
    <AnimeSection
      title="✨ New Releases"
      subtitle="Latest episodes added"
      animeList={newReleases}
      viewAllLink="/anime"
    />
  );
}

export function DonghuaSection() {
  const donghua = mockAnimeList.filter(a => a.type === 'donghua').slice(0, 6);
  return (
    <AnimeSection
      title="🐉 Popular Donghua"
      subtitle="Chinese animation hits"
      animeList={donghua}
      viewAllLink="/donghua"
    />
  );
}
