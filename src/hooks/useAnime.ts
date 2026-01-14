import { useQuery } from '@tanstack/react-query';
import {
  fetchHomeData,
  searchAnime,
  fetchAnimeInfo,
  fetchEpisodes,
  fetchEpisodeServers,
  fetchEpisodeSources,
  fetchCategory,
} from '@/lib/api';

// Hook for home page data (trending, latest, etc.)
export function useHomeData() {
  return useQuery({
    queryKey: ['home'],
    queryFn: fetchHomeData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for searching anime
export function useSearchAnime(query: string, page = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => searchAnime(query, page),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for anime details
export function useAnimeInfo(animeId: string) {
  return useQuery({
    queryKey: ['anime', animeId],
    queryFn: () => fetchAnimeInfo(animeId),
    enabled: !!animeId,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook for episode list
export function useEpisodes(animeId: string) {
  return useQuery({
    queryKey: ['episodes', animeId],
    queryFn: () => fetchEpisodes(animeId),
    enabled: !!animeId,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook for episode servers
export function useEpisodeServers(episodeId: string) {
  return useQuery({
    queryKey: ['servers', episodeId],
    queryFn: () => fetchEpisodeServers(episodeId),
    enabled: !!episodeId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for episode sources
export function useEpisodeSources(episodeId: string, server: string, category: string) {
  return useQuery({
    queryKey: ['sources', episodeId, server, category],
    queryFn: () => fetchEpisodeSources(episodeId, server, category),
    enabled: !!episodeId && !!server,
    staleTime: 2 * 60 * 1000,
  });
}

// Hook for category pages (top-airing, most-popular, etc.)
export function useCategory(category: string, page = 1) {
  return useQuery({
    queryKey: ['category', category, page],
    queryFn: () => fetchCategory(category, page),
    staleTime: 5 * 60 * 1000,
  });
}

// Hook for trending anime
export function useTrending() {
  return useCategory('top-airing');
}

// Hook for most popular anime
export function useMostPopular() {
  return useCategory('most-popular');
}

// Hook for recently updated
export function useRecentlyUpdated() {
  return useCategory('recently-updated');
}

// Hook for top upcoming
export function useTopUpcoming() {
  return useCategory('top-upcoming');
}
