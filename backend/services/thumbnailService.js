import axios from 'axios';
import { Jimp } from 'jimp';

export const thumbnailService = {
    generateThumbnail: async (animeTitle, episodeNumber) => {
        console.log(`[ThumbnailService] Generating thumbnail for: ${animeTitle} EP${episodeNumber}`);

        try {
            // 1. Fetch Anime Info from Jikan (MyAnimeList)
            const searchRes = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(animeTitle)}&limit=1`);

            if (searchRes.data.data && searchRes.data.data.length > 0) {
                const anime = searchRes.data.data[0];
                const imageUrl = anime.images.jpg.large_image_url;

                console.log(`[ThumbnailService] Found MAL Image: ${imageUrl}`);

                // 2. Generate Composite with Jimp
                const image = await Jimp.read(imageUrl);
                const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);

                // Resize for consistency
                image.resize({ w: 1280, h: 720 });

                // Add Overlay Text
                image.print({
                    font: font,
                    x: 50,
                    y: 600,
                    text: `EP ${episodeNumber}`
                });

                // In a real app, write to buffer and upload to Drive
                // const buffer = await image.getBuffer("image/jpeg");
                // const driveLink = await driveService.uploadFileStream(buffer, ...);

                console.log('[ThumbnailService] Composite generated (simulated)');

                // Returning the original URL for now as we don't have write access to public storage
                return imageUrl;
            } else {
                return "https://images.unsplash.com/photo-1607604276583-c4bd3de9ce51?w=400&h=600&fit=crop";
            }
        } catch (error) {
            console.error('[ThumbnailService] Error:', error.message);
            return "https://images.unsplash.com/photo-1607604276583-c4bd3de9ce51?w=400&h=600&fit=crop";
        }
    }
};
