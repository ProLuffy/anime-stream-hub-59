import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', // Adjust based on frontend port
  credentials: true
}));

import authRoutes from './routes/authRoutes.js';
import animeRoutes from './routes/animeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/admin', adminRoutes);

import { MongoMemoryServer } from 'mongodb-memory-server';

// Database Connection
const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      console.log('No MONGODB_URI found. Starting in-memory MongoDB...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log('In-memory MongoDB started at:', mongoUri);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

connectDB();

app.get('/', (req, res) => {
  res.send('Anime Streaming API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
