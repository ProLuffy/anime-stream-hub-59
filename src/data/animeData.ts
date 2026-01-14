export interface Anime {
  id: string;
  title: string;
  titleJp?: string;
  poster: string;
  banner?: string;
  description: string;
  genres: string[];
  type: 'anime' | 'donghua';
  status: 'ongoing' | 'completed' | 'upcoming';
  rating: number;
  year: number;
  episodes: Episode[];
  languages: string[];
  isPremium?: boolean;
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  thumbnail?: string;
  duration: string;
  streamUrl: string;
  downloadUrl?: string;
  languages: string[];
  subtitles: string[];
  releaseDate: string;
}

export const mockAnimeList: Anime[] = [
  {
    id: '1',
    title: 'Solo Leveling',
    titleJp: '俺だけレベルアップな件',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&h=600&fit=crop',
    description: 'In a world where hunters with supernatural powers fight monsters from mysterious portals, Sung Jinwoo is the weakest of all hunters. But after a near-death experience, he gains a unique ability to level up.',
    genres: ['Action', 'Fantasy', 'Adventure'],
    type: 'anime',
    status: 'ongoing',
    rating: 9.2,
    year: 2024,
    languages: ['Japanese', 'English', 'Hindi'],
    episodes: [
      { id: 'sl-1', number: 1, title: 'I\'m Used to It', thumbnail: '', duration: '24:00', streamUrl: '', languages: ['Japanese', 'English'], subtitles: ['English', 'Hindi'], releaseDate: '2024-01-07' },
      { id: 'sl-2', number: 2, title: 'If I Had One More Chance', thumbnail: '', duration: '24:00', streamUrl: '', languages: ['Japanese', 'English'], subtitles: ['English', 'Hindi'], releaseDate: '2024-01-14' },
    ],
  },
  {
    id: '2',
    title: 'Demon Slayer',
    titleJp: '鬼滅の刃',
    poster: 'https://images.unsplash.com/photo-1607604276583-c4bd3de9ce51?w=400&h=600&fit=crop',
    description: 'Tanjiro Kamado joins the Demon Slayer Corps to find a cure for his sister Nezuko and avenge his family.',
    genres: ['Action', 'Supernatural', 'Drama'],
    type: 'anime',
    status: 'ongoing',
    rating: 9.0,
    year: 2023,
    languages: ['Japanese', 'English', 'Hindi', 'Tamil'],
    episodes: [
      { id: 'ds-1', number: 1, title: 'Cruelty', thumbnail: '', duration: '25:00', streamUrl: '', languages: ['Japanese', 'English'], subtitles: ['English', 'Hindi'], releaseDate: '2023-04-09' },
    ],
    isPremium: true,
  },
  {
    id: '3',
    title: 'Jujutsu Kaisen',
    titleJp: '呪術廻戦',
    poster: 'https://images.unsplash.com/photo-1612178537253-bccd437b730e?w=400&h=600&fit=crop',
    description: 'Yuji Itadori joins a secret organization to hunt curses after swallowing a powerful cursed object.',
    genres: ['Action', 'Horror', 'Supernatural'],
    type: 'anime',
    status: 'completed',
    rating: 8.9,
    year: 2023,
    languages: ['Japanese', 'English', 'Hindi'],
    episodes: [],
  },
  {
    id: '4',
    title: 'The Beginning After The End',
    titleJp: '디 비기닝 애프터 디 엔드',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    description: 'King Grey has unrivaled strength, but solitude lingers beside him. Reborn into a new world with magic, he gets a second chance at life.',
    genres: ['Fantasy', 'Action', 'Isekai'],
    type: 'donghua',
    status: 'ongoing',
    rating: 8.7,
    year: 2024,
    languages: ['English', 'Hindi'],
    episodes: [],
  },
  {
    id: '5',
    title: 'One Piece',
    titleJp: 'ワンピース',
    poster: 'https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&h=600&fit=crop',
    description: 'Monkey D. Luffy sets off on a journey to find the legendary One Piece and become the Pirate King.',
    genres: ['Action', 'Adventure', 'Comedy'],
    type: 'anime',
    status: 'ongoing',
    rating: 9.1,
    year: 1999,
    languages: ['Japanese', 'English', 'Hindi', 'Tamil', 'Telugu'],
    episodes: [],
  },
  {
    id: '6',
    title: 'Attack on Titan',
    titleJp: '進撃の巨人',
    poster: 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400&h=600&fit=crop',
    description: 'Humanity fights for survival against giant humanoid creatures known as Titans.',
    genres: ['Action', 'Drama', 'Dark Fantasy'],
    type: 'anime',
    status: 'completed',
    rating: 9.4,
    year: 2023,
    languages: ['Japanese', 'English', 'Hindi'],
    episodes: [],
    isPremium: true,
  },
  {
    id: '7',
    title: 'Soul Land',
    poster: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=600&fit=crop',
    description: 'Tang San, the outer disciple of the Tang Sect, commits suicide by jumping off a cliff after obtaining the sect\'s forbidden lore.',
    genres: ['Action', 'Fantasy', 'Martial Arts'],
    type: 'donghua',
    status: 'ongoing',
    rating: 8.5,
    year: 2024,
    languages: ['Chinese', 'English', 'Hindi'],
    episodes: [],
  },
  {
    id: '8',
    title: 'My Hero Academia',
    titleJp: '僕のヒーローアカデミア',
    poster: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?w=400&h=600&fit=crop',
    description: 'In a world where most people have superpowers called "Quirks," Izuku Midoriya dreams of becoming a hero.',
    genres: ['Action', 'Superhero', 'School'],
    type: 'anime',
    status: 'ongoing',
    rating: 8.4,
    year: 2024,
    languages: ['Japanese', 'English', 'Hindi'],
    episodes: [],
  },
];

export const genres = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Isekai', 'Martial Arts', 'Romance', 'Sci-Fi',
  'School', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

export const languages = [
  'Japanese', 'English', 'Hindi', 'Tamil', 'Telugu', 'Chinese', 'Korean'
];
