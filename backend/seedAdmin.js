import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to DB (using the same logic as server.js for in-memory if needed, but for script likely needs real DB or running app context)
// Since we are using in-memory in server.js, we can't easily seed from a separate script unless we export the DB connection or run this ON server startup.
// So I will create a route to create admin for testing purposes.

// Actually, I will just add a temporary route to promote a user to admin.
