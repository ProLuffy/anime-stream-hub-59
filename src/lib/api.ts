// HiAnime API Service - Metadata Aggregator
// This service fetches publicly available anime metadata from third-party APIs
// No video hosting or streaming is performed by this application

const API_BASE = 'https://hianime-api-seven-teal.vercel.app';

export interface AnimeResult {
  id: string;
  name: string;
  jname?: string;
  poster: string;
  type?: string;
  episodes?: {
    sub?: number;
    dub?: number;
  };
  duration?: string;
  rating?: string;
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

// Fetch trending/home anime
export async function fetchHomeData() {
  const res = await fetch(`${API_BASE}/api/v2/hianime/home`);
  if (!res.ok) throw new Error('Failed to fetch home data');
  return res.json();
}

// Search anime
export async function searchAnime(query: string, page = 1) {
  const res = await fetch(`${API_BASE}/api/v2/hianime/search?q=${encodeURIComponent(query)}&page=${page}`);
  if (!res.ok) throw new Error('Failed to search anime');
  return res.json();
}

// Fetch anime details
export async function fetchAnimeInfo(animeId: string) {
  const res = await fetch(`${API_BASE}/api/v2/hianime/anime/${animeId}`);
  if (!res.ok) throw new Error('Failed to fetch anime info');
  return res.json();
}

// Fetch episode list
export async function fetchEpisodes(animeId: string) {
  const res = await fetch(`${API_BASE}/api/v2/hianime/anime/${animeId}/episodes`);
  if (!res.ok) throw new Error('Failed to fetch episodes');
  return res.json();
}

// Fetch episode streaming servers
export async function fetchEpisodeServers(episodeId: string) {
  const res = await fetch(`${API_BASE}/api/v2/hianime/episode/servers?animeEpisodeId=${episodeId}`);
  if (!res.ok) throw new Error('Failed to fetch servers');
  return res.json();
}

// Fetch episode streaming sources
export async function fetchEpisodeSources(episodeId: string, server = 'hd-1', category = 'sub') {
  const res = await fetch(`${API_BASE}/api/v2/hianime/episode/sources?animeEpisodeId=${episodeId}&server=${server}&category=${category}`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

// Fetch category (e.g., top-airing, most-popular, etc.)
export async function fetchCategory(category: string, page = 1) {
  const res = await fetch(`${API_BASE}/api/v2/hianime/${category}?page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category}`);
  return res.json();
}

// Fetch genre list
export async function fetchGenres() {
  const res = await fetch(`${API_BASE}/api/v2/hianime/genre`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

// Fetch anime by genre
export async function fetchByGenre(genre: string, page = 1) {
  const res = await fetch(`${API_BASE}/api/v2/hianime/genre/${genre}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch genre anime');
  return res.json();
}

// Fetch schedule
export async function fetchSchedule(date: string) {
  const res = await fetch(`${API_BASE}/api/v2/hianime/schedule?date=${date}`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}
