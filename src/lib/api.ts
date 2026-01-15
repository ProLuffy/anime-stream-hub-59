// HiAnime API Service - Metadata Aggregator
// This service fetches publicly available anime metadata from third-party APIs
// No video hosting or streaming is performed by this application

const API_BASE = 'https://hianime-api-seven-teal.vercel.app';

export interface AnimeResult {
  id: string;
  title: string;
  alternativeTitle?: string;
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
  const res = await fetch(`${API_BASE}/api/v1/home`);
  if (!res.ok) throw new Error('Failed to fetch home data');
  return res.json();
}

// Search anime
export async function searchAnime(query: string, page = 1) {
  const res = await fetch(`${API_BASE}/api/v1/search?keyword=${encodeURIComponent(query)}&page=${page}`);
  if (!res.ok) throw new Error('Failed to search anime');
  return res.json();
}

// Fetch anime details
export async function fetchAnimeInfo(animeId: string) {
  const res = await fetch(`${API_BASE}/api/v1/anime/${animeId}`);
  if (!res.ok) throw new Error('Failed to fetch anime info');
  return res.json();
}

// Fetch episode list
export async function fetchEpisodes(animeId: string) {
  const res = await fetch(`${API_BASE}/api/v1/episodes/${animeId}`);
  if (!res.ok) throw new Error('Failed to fetch episodes');
  return res.json();
}

// Fetch episode streaming servers
export async function fetchEpisodeServers(episodeId: string) {
  const res = await fetch(`${API_BASE}/api/v1/servers?id=${episodeId}`);
  if (!res.ok) throw new Error('Failed to fetch servers');
  return res.json();
}

// Fetch episode streaming sources
export async function fetchEpisodeSources(episodeId: string, server = 'hd-1', category = 'sub') {
  const res = await fetch(`${API_BASE}/api/v1/stream?id=${episodeId}&server=${server}&type=${category}`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}

// Fetch category (e.g., top-airing, most-popular, etc.)
export async function fetchCategory(category: string, page = 1) {
  const res = await fetch(`${API_BASE}/api/v1/animes/${category}?page=${page}`);
  if (!res.ok) throw new Error(`Failed to fetch ${category}`);
  return res.json();
}

// Fetch genre list
export async function fetchGenres() {
  const res = await fetch(`${API_BASE}/api/v1/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
}

// Fetch anime by genre
export async function fetchByGenre(genre: string, page = 1) {
  const res = await fetch(`${API_BASE}/api/v1/animes/genre/${genre}?page=${page}`);
  if (!res.ok) throw new Error('Failed to fetch genre anime');
  return res.json();
}

// Fetch schedule
export async function fetchSchedule(date: string) {
  const res = await fetch(`${API_BASE}/api/v1/schedules?date=${date}`);
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Point to our backend

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  register: async (username, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { username, email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};

// Anime Service (Proxy through our backend)
export const animeService = {
    getHome: async () => {
        const response = await axios.get(`${API_URL}/anime/home`);
        return response.data;
    },
    getAnimeDetails: async (id) => {
        const response = await axios.get(`${API_URL}/anime/${id}`);
        return response.data;
    },
    getEpisodes: async (id) => {
        const response = await axios.get(`${API_URL}/anime/${id}/episodes`);
        return response.data;
    },
    getEpisodeSources: async (id, server = 'hd-1', category = 'sub') => {
        const response = await axios.get(`${API_URL}/anime/episode-srcs`, {
            params: { id, server, category }
        });
        return response.data;
    }
};

// Admin Service
export const adminService = {
    uploadMedia: async (formData) => {
        const user = authService.getCurrentUser();
        const response = await axios.post(`${API_URL}/admin/upload-media`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${user.token}`
            }
        });
        return response.data;
    }
};
