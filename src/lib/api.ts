const BASE = "/.netlify/functions/api";

export async function searchAnime(query: string, page = 1) {
  const res = await fetch(`${BASE}?path=search&q=${query}&page=${page}`);
  return res.json();
}

export async function searchSuggestion(query: string) {
  const res = await fetch(`${BASE}?path=suggestion&q=${query}`);
  return res.json();
}
