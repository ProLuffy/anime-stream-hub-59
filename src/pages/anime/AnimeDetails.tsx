import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { animeService } from '../../lib/api';
import AnimePlayer from '../../components/player/AnimePlayer';

export default function AnimeDetails() {
  const { id } = useParams();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
       if (!id) return;
       try {
           const info = await animeService.getAnimeDetails(id);
           setAnime(info.data.anime);

           const epData = await animeService.getEpisodes(id);
           setEpisodes(epData.data.episodes);

           if (epData.data.episodes.length > 0) {
               setCurrentEpisode(epData.data.episodes[0]);
           }
       } catch (error) {
           console.error("Failed to load anime", error);
       } finally {
           setLoading(false);
       }
    }
    loadData();
  }, [id]);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (!anime) return <div className="text-white p-10">Anime Not Found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
        {/* Banner */}
        <div className="relative h-[40vh] w-full overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
             <img src={anime.info.poster} alt={anime.info.title} className="w-full h-full object-cover blur-sm opacity-50" />
             <div className="absolute bottom-10 left-10 z-20 flex gap-6 items-end">
                 <img src={anime.info.poster} className="w-40 rounded-lg shadow-2xl" />
                 <div>
                     <h1 className="text-4xl font-bold mb-2">{anime.info.title}</h1>
                     <div className="flex gap-2 text-sm text-gray-300">
                        <span>{anime.info.stats.rating}</span>
                        <span>•</span>
                        <span>{anime.moreInfo.status}</span>
                     </div>
                 </div>
             </div>
        </div>

        <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 space-y-8">
                 {/* Player Section Removed - Separate Watch Page */}
                 <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                     <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
                     <p className="text-zinc-400 leading-relaxed text-lg">{anime.info.description}</p>
                 </div>
             </div>

             {/* Sidebar: Episodes List */}
             <div className="bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col h-[800px]">
                 <div className="p-4 border-b border-zinc-800">
                     <h3 className="font-bold">Episodes ({episodes.length})</h3>
                 </div>
                 <div className="overflow-y-auto flex-1 p-2 space-y-2">
                     {episodes.map(ep => (
                         <Link
                            key={ep.episodeId}
                            to={`/watch/${id}/${ep.episodeId}`}
                            className={`block w-full text-left p-3 rounded hover:bg-zinc-800 transition-colors flex justify-between items-center text-zinc-300`}
                         >
                             <span className="font-medium">EP {ep.number}</span>
                             <span className="text-sm truncate w-32 text-right opacity-60">{ep.title}</span>
                         </Link>
                     ))}
                 </div>
             </div>
        </div>
    </div>
  );
}
