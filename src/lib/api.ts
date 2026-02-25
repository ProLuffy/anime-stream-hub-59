const API_BASE = "/.netlify/functions/api";

// Simple fetch wrapper
async function apiFetch(endpoint: string) {
  const res = await fetch(
    `${API_BASE}?endpoint=${encodeURIComponent(endpoint)}`
  );

  if (!res.ok) {
    throw new Error("API Error");
  }

  return res.json();
}

/* ================= HOME ================= */

export async function fetchHomeData() {
  return apiFetch("/home");
}

/* ================= SEARCH ================= */

export async function searchAnime(query: string, page = 1) {
  return apiFetch(`/search?keyword=${query}&page=${page}`);
}

/* ================= ANIME INFO ================= */

export async function fetchAnimeInfo(id: string) {
  return apiFetch(`/anime/${id}`);
}

/* ================= EPISODES ================= */

export async function fetchEpisodes(id: string) {
  return apiFetch(`/episodes/${id}`);
}

/* ================= STREAM ================= */

export async function fetchEpisodeSources(
  episodeId: string,
  server = "hd-1",
  type = "sub"
) {
  return apiFetch(
    `/stream?id=${episodeId}&server=${server}&type=${type}`
  );
}

/* ================= CATEGORY ================= */

export async function fetchCategory(category: string, page = 1) {
  return apiFetch(`/${category}?page=${page}`);
}
