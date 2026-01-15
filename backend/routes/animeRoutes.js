import express from 'express';
import axios from 'axios';
import Anime from '../models/Anime.js';
import Episode from '../models/Episode.js';

const router = express.Router();
const API_BASE = 'https://hianime-api-seven-teal.vercel.app';

// @desc    Get Home Data
// @route   GET /api/anime/home
router.get('/home', async (req, res) => {
  try {
    const { data } = await axios.get(`${API_BASE}/api/v1/home`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching home data' });
  }
});

// @desc    Get Anime Details (Sync with DB)
// @route   GET /api/anime/:id
router.get('/:id', async (req, res) => {
  const animeId = req.params.id;
  try {
    // Always fetch fresh data to update or create
    const { data } = await axios.get(`${API_BASE}/api/v1/anime/${animeId}`);
    // Check if data.data exists (API response wrapper)
    const animeData = data.data;

    let anime = await Anime.findOne({ id: animeId });

    if (!anime) {
      anime = new Anime({
        id: animeData.id,
        title: animeData.title,
        titleJp: animeData.japanese,
        poster: animeData.poster,
        description: animeData.synopsis,
        genres: animeData.genres,
        type: animeData.type,
        status: animeData.status,
        rating: 0, // Need to parse MAL_score if string
        // year: ...
      });
    } else {
        // Update fields if needed
        anime.title = animeData.title;
        anime.poster = animeData.poster;
        anime.description = animeData.synopsis;
    }
    await anime.save();

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching anime details' });
  }
});

// @desc    Get Episodes
// @route   GET /api/anime/:id/episodes
router.get('/:id/episodes', async (req, res) => {
  const animeId = req.params.id;
  try {
    // 1. Fetch from HiAnime API
    const { data } = await axios.get(`${API_BASE}/api/v1/episodes/${animeId}`);
    const apiEpisodes = data.data.episodes; // Ensure this matches API schema

    // 2. Fetch from our DB to overlay custom data
    const dbEpisodes = await Episode.find({ animeId });

    // 3. Merge data
    const mergedEpisodes = apiEpisodes.map(ep => {
      const dbEp = dbEpisodes.find(d => d.episodeNumber === ep.episodeNumber);
      return {
        ...ep,
        customSubtitles: dbEp ? dbEp.subtitles : [],
        customAudio: dbEp ? dbEp.audioTracks : [],
        isCustom: !!dbEp
      };
    });

    res.json({ ...data, data: { ...data.data, episodes: mergedEpisodes } });
  } catch (error) {
    console.error("Error fetching episodes:", error);
    res.status(500).json({ message: 'Error fetching episodes' });
  }
});

// @desc    Get Streaming Sources
// @route   GET /api/anime/episode-srcs
router.get('/episode-srcs', async (req, res) => {
    const { id, server, category } = req.query;
    try {
        const { data } = await axios.get(`${API_BASE}/api/v1/stream?id=${id}&server=${server || 'hd-1'}&type=${category || 'sub'}`);

        // Here we could inject our custom subtitles/audio if we had the logic to map HiAnime episode ID to our DB
        // But for now, we just proxy
        res.json(data);
    } catch (error) {
        console.error("Error fetching sources:", error);
        res.status(500).json({ message: 'Error fetching sources' });
    }
});

export default router;
