import mongoose from 'mongoose';

const animeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // HiAnime ID
  title: { type: String, required: true },
  titleJp: String,
  poster: String,
  banner: String,
  description: String,
  genres: [String],
  type: String, // anime, donghua, movie, etc.
  status: String,
  rating: Number,
  year: Number,
  languages: [String],
  isPremium: { type: Boolean, default: false },
  seasons: [{
    seasonNumber: Number,
    episodes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Episode' }]
  }],
  lastUpdated: { type: Date, default: Date.now }
});

const Anime = mongoose.model('Anime', animeSchema);
export default Anime;
