// /types/anime.ts
export interface Anime {
id: string;
title: string;
titleJp?: string;
poster: string;
description: string;
genres: string[];
type: 'anime' | 'donghua';
status: 'ongoing' | 'completed' | 'upcoming';
rating: number;
year: number;
languages: string[];
}
