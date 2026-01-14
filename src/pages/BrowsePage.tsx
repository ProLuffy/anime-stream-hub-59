import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Grid, List, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import AnimeCard from '@/components/anime/AnimeCard';
import { mockAnimeList, genres, languages, Anime } from '@/data/animeData';

interface BrowsePageProps {
  type?: 'anime' | 'donghua';
}

export default function BrowsePage({ type }: BrowsePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  let filtered = mockAnimeList;

  // Filter by type
  if (type) {
    filtered = filtered.filter(a => a.type === type);
  }

  // Filter by search
  if (searchQuery) {
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.titleJp?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Filter by genre
  if (selectedGenre) {
    filtered = filtered.filter(a => a.genres.includes(selectedGenre));
  }

  // Filter by language
  if (selectedLanguage) {
    filtered = filtered.filter(a => a.languages.includes(selectedLanguage));
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'year') return b.year - a.year;
    return a.title.localeCompare(b.title);
  });

  const title = type === 'donghua' ? 'Donghua' : type === 'anime' ? 'Anime' : 'Browse All';

  return (
    <div className="min-h-screen theme-transition">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">
              {filtered.length} titles available
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/50 outline-none text-sm"
                />
              </div>

              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-secondary/50 outline-none text-sm"
              >
                <option value="">All Genres</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {/* Language Filter */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2.5 rounded-lg bg-secondary/50 outline-none text-sm"
              >
                <option value="">All Languages</option>
                {languages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 rounded-lg bg-secondary/50 outline-none text-sm"
              >
                <option value="rating">Top Rated</option>
                <option value="year">Newest</option>
                <option value="title">A-Z</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results */}
          {filtered.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6'
                : 'space-y-4'
            }>
              {filtered.map((anime, index) => (
                <AnimeCard key={anime.id} anime={anime} index={index} />
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 text-center">
              <p className="text-muted-foreground">No results found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
