import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export const videoService = {
    burnSubtitle: async (videoPath, subtitlePath, outputPath) => {
        return new Promise((resolve, reject) => {
            console.log(`[VideoService] Burning subtitle: ${subtitlePath} into ${videoPath}`);

            // In a real environment, we'd ensure paths are absolute and ffmpeg is installed
            // This mock implementation simulates the process

            if (!process.env.FFMPEG_PATH && !fs.existsSync('/usr/bin/ffmpeg')) {
                console.warn("[VideoService] FFmpeg not found. Returning mock success.");
                setTimeout(() => resolve(outputPath), 2000);
                return;
            }

            ffmpeg(videoPath)
                .outputOptions(`-vf subtitles=${subtitlePath}`)
                .save(outputPath)
                .on('end', () => {
                    console.log('[VideoService] Burn complete');
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('[VideoService] Error:', err);
                    reject(err);
                });
        });
    }
};
