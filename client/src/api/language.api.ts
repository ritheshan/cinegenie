import { apiClient } from './axios';
import { discoverApi } from './discover.api';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',   flag: '🇺🇸', hero: 'Hollywood' },
  { code: 'ko', label: 'Korean',    flag: '🇰🇷', hero: 'K-Cinema' },
  { code: 'ja', label: 'Japanese',  flag: '🇯🇵', hero: 'J-Cinema & Anime' },
  { code: 'hi', label: 'Hindi',     flag: '🇮🇳', hero: 'Bollywood' },
  { code: 'ta', label: 'Tamil',     flag: '🇮🇳', hero: 'Kollywood' },
  { code: 'te', label: 'Telugu',    flag: '🇮🇳', hero: 'Tollywood' },
  { code: 'ml', label: 'Malayalam', flag: '🇮🇳', hero: 'Mollywood' },
  { code: 'kn', label: 'Kannada',   flag: '🇮🇳', hero: 'Sandalwood' },
  { code: 'es', label: 'Spanish',   flag: '🇪🇸', hero: 'Spanish Cinema' },
  { code: 'fr', label: 'French',    flag: '🇫🇷', hero: 'French Cinema' },
  { code: 'zh', label: 'Chinese',   flag: '🇨🇳', hero: 'Chinese Cinema' },
] as const;

export type LangCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const languageApi = {
  /** Popular movies in a language (paginated) */
  getMovies: async (code: string, page = 1) =>
    discoverApi.getByLanguage(code, 'movie', page),

  /** Popular TV in a language (paginated) */
  getTv: async (code: string, page = 1) =>
    discoverApi.getByLanguage(code, 'tv', page),

  /** Actors derived from popular titles in this language */
  getActors: async (code: string): Promise<any[]> => {
    const r = await apiClient.get(`/discover/language/${code}/actors`);
    return r.data.data as any[];
  },
};
