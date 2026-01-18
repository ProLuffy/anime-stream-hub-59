// HiAnime API Service - Using your custom API
// API Base: /api/v1

const API_BASE = 'https://hianime-api-seven-teal.vercel.app';

export interface AnimeResult {
  id: string;
  name?: string;
  title?: string; // API returns title instead of name
  jname?: string;
  alternativeTitle?: string; // Japanese title from API
  poster: string;
  type?: string;
  quality?: string;
  episodes?: {
    sub?: number;
    dub?: number;
    eps?: number;
  };
  duration?: string;
  rating?: string;
  rank?: number;
  description?: string;
  synopsis?: string; // API returns synopsis instead of description
  otherInfo?: string[];
  aired?: string;
}

export interface SpotlightAnime extends AnimeResult {
  rank: number;
  synopsis: string;
}

export interface AnimeInfo {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  description?: string;
  stats?: {
    rating?: string;
    quality?: string;
    episodes?: {
      sub?: number;
      dub?: number;
    };
    type?: string;
    duration?: string;
  };
  moreInfo?: {
    aired?: string;
    genres?: string[];
    status?: string;
    studios?: string[];
    producers?: string[];
  };
}

export interface Episode {
  episodeId: string;
  number: number;
  title: string;
  isFiller?: boolean;
}

export interface EpisodeSource {
  server: string;
  category: 'sub' | 'dub' | 'raw';
  url?: string;
}

export interface StreamingSource {
  sources: {
    url: string;
    type: string;
    quality?: string;
  }[];
  subtitles?: {
    url: string;
    lang: string;
  }[];
  intro?: { start: number; end: number };
  outro?: { start: number; end: number };
}

export interface HomeData {
  success: boolean;
  data: {
    // New API structure (your API)
    spotlight?: SpotlightAnime[];
    trending?: AnimeResult[];
    topAiring?: AnimeResult[];
    latestEpisodes?: AnimeResult[];
    mostPopular?: AnimeResult[];
    mostFavorite?: AnimeResult[];
    latestCompleted?: AnimeResult[];
    topUpcoming?: AnimeResult[];
    // Old API structure (fallback)
    spotlightAnimes?: SpotlightAnime[];
    trendingAnimes?: AnimeResult[];
    latestEpisodeAnimes?: AnimeResult[];
    topUpcomingAnimes?: AnimeResult[];
    top10Animes?: {
      today: AnimeResult[];
      week: AnimeResult[];
      month: AnimeResult[];
    };
    topAiringAnimes?: AnimeResult[];
    mostPopularAnimes?: AnimeResult[];
    mostFavoriteAnimes?: AnimeResult[];
    latestCompletedAnimes?: AnimeResult[];
    genres?: string[];
    featuredAnimes?: {
      topAiringAnimes?: AnimeResult[];
      mostPopularAnimes?: AnimeResult[];
    };
  };
}

// Helper function to make API calls
async function apiFetch(endpoint: string) {
  const url = `${API_BASE}/api/v1${endpoint}`;
  console.log('Fetching:', url);
  
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  
  return res.json();
}

// Fetch home data (trending, spotlight, top airing, latest episodes)
export async function fetchHomeData(): Promise<HomeData> {
  return apiFetch('/home');
}

// Search anime
export async function searchAnime(query: string, page = 1) {
  return apiFetch(`/search?keyword=${encodeURIComponent(query)}&page=${page}`);
}

// Fetch anime details
export async function fetchAnimeInfo(animeId: string) {
  return apiFetch(`/anime/${animeId}`);
}

// Fetch episode list
export async function fetchEpisodes(animeId: string) {
  return apiFetch(`/episodes/${animeId}`);
}

// Fetch episode streaming sources
// Note: The stream endpoint expects just the episode ID part (after the last ??)
// and server names should match what the API expects
export async function fetchEpisodeSources(episodeId: string, server = 'hd-1', category = 'sub') {
  // The API expects episode ID like: "one-piece-100$episode$23454$both"
  // Convert from "one-piece-100::ep=2168" or similar formats
  let formattedId = episodeId;
  
  // If episode ID contains "::" format, we need to extract just the ep number
  if (episodeId.includes('::')) {
    // Keep the full ID as is - the API might need it this way
    formattedId = episodeId;
  }
  
  // Try with hd-1, hd-2 servers first as they're more reliable
  return apiFetch(`/stream?id=${formattedId}&server=${server}&type=${category}`);
}

// Fetch category (e.g., top-airing, most-popular, etc.)
export async function fetchCategory(category: string, page = 1) {
  return apiFetch(`/${category}?page=${page}`);
}

// Fetch genre list
export async function fetchGenres() {
  return apiFetch('/genre');
}

// Fetch anime by genre
export async function fetchByGenre(genre: string, page = 1) {
  return apiFetch(`/genre/${genre}?page=${page}`);
}

// Fetch AZ list
export async function fetchAZList(letter: string, page = 1) {
  return apiFetch(`/az-list/${letter}?page=${page}`);
}

// Fetch schedule (not in v1 API but keeping for compatibility - will return empty)
export async function fetchSchedule(date: string) {
  // The v1 API doesn't have a schedule endpoint
  // Return empty data structure
  return { success: true, data: { scheduledAnimes: [] } };
}

// Get current API base
export function getCurrentApiBase() {
  return API_BASE;
}
