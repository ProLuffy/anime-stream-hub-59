import React, { useState } from 'react';
import { adminService } from '../../lib/api';

export default function AdminDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [animeId, setAnimeId] = useState('');
  const [episodeNum, setEpisodeNum] = useState('');
  const [language, setLanguage] = useState('English');
  const [type, setType] = useState('subtitle');
  const [status, setStatus] = useState('');

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('animeId', animeId);
    formData.append('episodeNumber', episodeNum);
    formData.append('seasonNumber', '1'); // Default for now
    formData.append('language', language);
    formData.append('type', type);
    formData.append('label', language);

    setStatus('Uploading...');
    try {
      await adminService.uploadMedia(formData);
      setStatus('Upload Successful!');
    } catch (error) {
      console.error(error);
      setStatus('Upload Failed');
    }
  };

  return (
    <div className="p-8 text-white bg-zinc-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-purple-500">Admin Control Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700">
          <h2 className="text-xl font-semibold mb-4">Upload Media</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Anime ID (HiAnime)</label>
              <input
                type="text"
                value={animeId} onChange={e => setAnimeId(e.target.value)}
                className="w-full bg-zinc-700 rounded p-2 text-white"
                placeholder="e.g., one-piece-100"
              />
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm text-zinc-400 mb-1">Episode #</label>
                    <input
                        type="number"
                        value={episodeNum} onChange={e => setEpisodeNum(e.target.value)}
                        className="w-full bg-zinc-700 rounded p-2 text-white"
                    />
                </div>
                <div className="flex-1">
                     <label className="block text-sm text-zinc-400 mb-1">Type</label>
                     <select
                        value={type} onChange={e => setType(e.target.value)}
                        className="w-full bg-zinc-700 rounded p-2 text-white"
                     >
                         <option value="subtitle">Subtitle</option>
                         <option value="audio">Audio Track</option>
                     </select>
                </div>
            </div>

            <div>
                <label className="block text-sm text-zinc-400 mb-1">Language</label>
                <input
                  type="text"
                  value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-zinc-700 rounded p-2 text-white"
                  placeholder="e.g., Hindi"
                />
            </div>

            <div>
                 <label className="block text-sm text-zinc-400 mb-1">File</label>
                 <input
                    type="file"
                    onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full bg-zinc-700 rounded p-2 text-white"
                 />
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded font-bold transition-colors">
                Upload
            </button>

            {status && <p className="text-center text-sm mt-2">{status}</p>}
          </form>
        </div>

        <div className="bg-zinc-800 p-6 rounded-xl border border-zinc-700 opacity-50 pointer-events-none">
            <h2 className="text-xl font-semibold mb-4">AI Subtitle Generator (Coming Soon)</h2>
            <p className="text-zinc-400 text-sm">Automated pipeline using Gemini Studio to generate subtitles for any language.</p>
        </div>
      </div>
    </div>
  );
}
