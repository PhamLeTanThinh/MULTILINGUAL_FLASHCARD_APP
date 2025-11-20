export type Language = 'EN' | 'ZH' | 'KO' | 'JA';

export interface Deck {
  id: number;
  name: string;
  language: Language;
  user_id: number;
  created_at: string;
  updated_at: string;
  flashcard_count: number;
}

export interface Flashcard {
  id: number;
  deck_id: number;
  vietnamese: string;
  pronunciation?: string;
  target_language: string;
  created_at: string;
}
