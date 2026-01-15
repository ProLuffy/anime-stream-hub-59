import mongoose from 'mongoose';

const episodeSchema = new mongoose.Schema({
  animeId: { type: String, required: true, ref: 'Anime' }, // String ID from HiAnime
  seasonNumber: { type: Number, default: 1 },
  episodeNumber: { type: Number, required: true },
  title: String,
  thumbnail: String,
  duration: String,
  releaseDate: Date,
  isFiller: Boolean,

  // Streaming Links (Default from API/DoodStream)
  streamUrl: String,

  // Custom Overlays
  subtitles: [{
    language: String, // en, hi, ta
    url: String, // Google Drive Link or local path
    sourceType: { type: String, enum: ['manual', 'ai'], default: 'manual' },
    label: String,
    format: { type: String, default: 'vtt' }
  }],

  audioTracks: [{
    language: String,
    url: String, // Google Drive Link
    label: String
  }],

  createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure unique episode per anime+season
episodeSchema.index({ animeId: 1, seasonNumber: 1, episodeNumber: 1 }, { unique: true });

const Episode = mongoose.model('Episode', episodeSchema);
export default Episode;
