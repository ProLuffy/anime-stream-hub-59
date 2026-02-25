import { useQuery } from "@tanstack/react-query";
import {
  fetchHomeData,
  searchAnime,
  fetchAnimeInfo,
  fetchEpisodes,
  fetchEpisodeSources,
  fetchCategory,
} from "@/lib/api";

/* ============================= */
/* HOME DATA */
/* ============================= */

export function useHomeData() {
  return useQuery({
    queryKey: ["home"],
    queryFn: fetchHomeData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/* ============================= */
/* SEARCH */
/* ============================= */

export function useSearchAnime(query: string, page = 1) {
  return useQuery({
    queryKey: ["search", query, page],
    queryFn: () => searchAnime(query.trim(), page),
    enabled: !!query && query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/* ============================= */
/* ANIME INFO */
/* ============================= */

export function useAnimeInfo(animeId: string) {
  return useQuery({
    queryKey: ["anime-info", animeId],
    queryFn: () => fetchAnimeInfo(animeId),
    enabled: !!animeId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/* ============================= */
/* EPISODES */
/* ============================= */

export function useEpisodes(animeId: string) {
  return useQuery({
    queryKey: ["episodes", animeId],
    queryFn: () => fetchEpisodes(animeId),
    enabled: !!animeId,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/* ============================= */
/* EPISODE SOURCES */
/* ============================= */

export function useEpisodeSources(
  episodeId: string,
  server: string,
  category: string
) {
  return useQuery({
    queryKey: ["sources", episodeId, server, category],
    queryFn: () => fetchEpisodeSources(episodeId, server, category),
    enabled: !!episodeId && !!server,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/* ============================= */
/* CATEGORY */
/* ============================= */

export function useCategory(category: string, page = 1) {
  return useQuery({
    queryKey: ["category", category, page],
    queryFn: () => fetchCategory(category, page),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
}

/* ============================= */
/* PRESET CATEGORY HOOKS */
/* ============================= */

export const useTrending = () => useCategory("top-airing");
export const useMostPopular = () => useCategory("most-popular");
export const useRecentlyUpdated = () =>
  useCategory("recently-updated");
export const useTopUpcoming = () =>
  useCategory("top-upcoming");
