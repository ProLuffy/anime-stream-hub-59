AnimeCrew

> A premium-first anime streaming platform with automated ingestion, multi-language playback, AI subtitles, and Telegram-powered uploads.




---

🏠 Home Experience



Overview

AnimeCrew opens with a cinematic animated landing inspired by soft anime aesthetics (sakura, night skies, calm motion). This page is accessible to all users and focuses on discovery and immersion.

Features:

Animated intro (AnimeCrew logo → home)

Trending & new-season anime only

Clean watch UI (no clutter)

Fast search & AI-assisted recommendations



---

⭐ Premium Experience



Premium-Only Features

Premium users unlock advanced controls and AI-powered features designed for power users.

Premium Includes:

AI-generated subtitles in any language (on-demand)

Soft subtitles for downloads (no hardcoding unless requested)

Multi-audio & multi-dub switching without reload

Faster streams & priority servers

Advanced quality selector (speed vs quality)



---

🎬 Video Player Architecture



How Playback Works

Each episode supports multiple variants mapped by:

Series → Episode → Language → Category (Dub/Sub) → Quality

Player Capabilities:

Instant language switch (JP / EN / HI / TA etc.)

Subtitle toggle (manual or AI-generated)

No page reload on stream change

Provider-agnostic (DoodStream / DoomStream)



---

🧠 AI Subtitle System (Premium)



Flow

1. User selects a new subtitle language


2. Video is sent to Gemini (video-only, no raw audio upload)


3. Gemini generates subtitle file (SRT/VTT)


4. Subtitle stored in Drive / Object Storage


5. Attached as soft subtitle to the stream



Notes:

No gender/voice mistakes (video-based processing)

Subtitles downloadable only for premium users

Cached to avoid re-generation



---

⬆️ Upload System (Telegram → Streaming)



Upload Flow

1. Admin uploads video via Telegram bot


2. Bot detects:

Series

Episode number

Language

Dub/Sub



3. Video uploaded to DoodStream


4. Backend updates episode mapping



Auto-Replace Logic:

(seriesId + episode + language + category + quality)

If already exists → old stream replaced automatically.


---

🧑‍💼 Admin Dashboard



Admin Capabilities

Series & episode management

Upload job tracking

Replace / rollback episodes

Premium user control

Provider & API configuration


Built with React and consumes the Node.js backend APIs.


---

🗄️ Storage & Streaming



Videos: DoodStream / DoomStream

Subtitles: Google Drive / Object Storage

Metadata: MongoDB

Caching: CDN + Edge cache



---

⚙️ Tech Stack

Frontend: React + Vite

Backend: Node.js + Express

Database: MongoDB

AI: Gemini (video-based subtitle generation)

Bot: Telegram (Webhook + Polling)



---

📌 Philosophy

AnimeCrew is built for quality over quantity:

No clutter

No forced ads

No reloads

Premium-first design



---

> Replace images in ./assets/ with your own visuals. This README is structured for GitHub, investors, and collaborators.
> 
