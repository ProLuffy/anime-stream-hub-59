import { useQuery } from '@tanstack/react-query';
import { searchAnime, searchSuggestion } from '@/lib/api';

/* ================================
   Helper Functions
================================ */

// Normalize anime display name
export function getDisplayName(anime: any): string {
  if (!anime) return 'Unknown';
  return anime.name || anime.title || anime.english || 'Unknown';
}

// Normalize Japanese name
export function getDisplayJName(anime: any): string {
  if (!anime) return '';
  return anime.jname || anime.alternativeTitle || anime.japanese || '';
}

/* ================================
   Search Suggestion Hook
   (Fast autocomplete)
================================ */

export function useSearchSuggestion(query: string) {
  return useQuery({
    queryKey: ['search-suggestion', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      return await searchSuggestion(query.trim());
    },
    enabled: query.trim().length >= 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
}

/* ================================
   Full Search Hook
   (With pagination)
================================ */

export function useFullSearch(query: string, page: number = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: async () => {
      if (!query.trim()) return { results: [], totalPages: 0 };
      return await searchAnime(query.trim(), page);
    },
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    keepPreviousData: true, // smooth pagination
    retry: 1,
  });
}
