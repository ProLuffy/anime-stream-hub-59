import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Episode from '../models/Episode.js';
import multer from 'multer';
import { driveService } from '../services/driveService.js';
import { geminiService } from '../services/geminiService.js';
import { videoService } from '../services/videoService.js';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Temporary storage before Google Drive

// @desc    Upload Subtitle/Audio (Admin only)
// @route   POST /api/admin/upload-media
router.post('/upload-media', protect, admin, upload.single('file'), async (req, res) => {
    const { animeId, seasonNumber, episodeNumber, language, type, label } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        // Upload to Drive
        const driveLink = await driveService.uploadFile(file.path, file.originalname, file.mimetype);

        // Clean up temp file
        fs.unlinkSync(file.path);

        let episode = await Episode.findOne({ animeId, seasonNumber, episodeNumber });

        if (!episode) {
            episode = new Episode({
                animeId,
                seasonNumber,
                episodeNumber,
                streamUrl: '', // Could be filled if we are replacing the stream too
            });
        }

        if (type === 'subtitle') {
            // REPLACE LOGIC: Check if subtitle with same language exists
            const existingIndex = episode.subtitles.findIndex(
                s => s.language.toLowerCase() === language.toLowerCase() && s.sourceType === 'manual'
            );

            const newSubtitle = {
                language,
                url: driveLink,
                sourceType: 'manual',
                label,
                format: 'vtt'
            };

            if (existingIndex !== -1) {
                // Replace existing
                episode.subtitles[existingIndex] = newSubtitle;
            } else {
                // Add new
                episode.subtitles.push(newSubtitle);
            }

        } else if (type === 'audio') {
             // REPLACE LOGIC: Check if audio with same language exists
             const existingIndex = episode.audioTracks.findIndex(
                 a => a.language.toLowerCase() === language.toLowerCase()
             );

             const newAudio = {
                 language,
                 url: driveLink,
                 label
             };

             if (existingIndex !== -1) {
                 episode.audioTracks[existingIndex] = newAudio;
             } else {
                 episode.audioTracks.push(newAudio);
             }
        }

        await episode.save();
        res.json({ message: 'Upload successful', episode });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// @desc    Trigger AI Subtitle Generation
// @route   POST /api/admin/generate-subs
router.post('/generate-subs', protect, admin, async (req, res) => {
    const { animeId, seasonNumber, episodeNumber, targetLanguage } = req.body;

    try {
         // 1. Get Episode Video URL (Ideally from DB or API)
         // For now, assume we have logic to get the stream URL or download it
         const videoUrl = "https://example.com/stream.mp4"; // Placeholder

         // 2. Generate Content
         const vttContent = await geminiService.generateSubtitle(videoUrl, targetLanguage);

         // 3. Save VTT to file temporarily
         const fileName = `${animeId}-ep${episodeNumber}-${targetLanguage}.vtt`;
         const filePath = `uploads/${fileName}`;
         if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
         fs.writeFileSync(filePath, vttContent);

         // 4. Upload to Drive
         const driveLink = await driveService.uploadFile(filePath, fileName, 'text/vtt');

         // 5. Update DB
         let episode = await Episode.findOne({ animeId, seasonNumber, episodeNumber });
         if (!episode) {
            episode = new Episode({ animeId, seasonNumber, episodeNumber });
         }

         episode.subtitles = episode.subtitles.filter(s => s.language !== targetLanguage);
         episode.subtitles.push({
            language: targetLanguage,
            url: driveLink,
            sourceType: 'ai',
            label: `${targetLanguage} (AI)`,
            format: 'vtt'
         });
         await episode.save();

         // Cleanup
         fs.unlinkSync(filePath);

         res.json({ message: 'Subtitle generation complete', url: driveLink });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Generation failed' });
    }
});

// @desc    Trigger FFmpeg Hardcode
// @route   POST /api/admin/hardcode
router.post('/hardcode', protect, admin, async (req, res) => {
    const { animeId, episodeNumber, language } = req.body;
    try {
        // Logic: Download video & sub -> Burn -> Upload
        console.log(`[Admin] Starting hardcode for ${animeId} EP${episodeNumber} ${language}`);

        // Mocking paths
        const mockVideo = 'video.mp4';
        const mockSub = 'sub.vtt';
        const output = 'output.mp4';

        // await videoService.burnSubtitle(mockVideo, mockSub, output);

        res.json({ message: 'Hardcode job started' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hardcode failed' });
    }
});

export default router;
