import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://multilingualflashcardapp-production.up.railway.app/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 400
});

// Types
export interface User {
  id: number;
  name: string;
  avatar?: string;
  created_at: string;
  last_activity_at: string;  // ← MỚI
  days_until_deletion?: number;  // ← MỚI
  deck_count?: number;
}
export interface Deck {
  id: number;
  name: string;
  language: 'EN' | 'ZH' | 'KO' | 'JA';
  user_id: number;
  flashcard_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: number;
  deck_id: number;
  vietnamese: string;
  pronunciation: string;
  target_language: string;
  created_at: string;
}

export interface DictionaryResult {
  vietnamese: string;
  pronunciation: string;
  target_language: string;
  language: string;
}

export interface QuizOption {
  text: string;
  pronunciation: string;
  vietnamese: string;
}

export interface ExampleSentence {
  target: string;
  pronunciation: string;
  vietnamese: string;
  context: string;
}

export interface DialogueLine {
  speaker: string;
  target: string;
  pronunciation: string;
  vietnamese: string;
}

export interface ExampleResponse {
  flashcard_id: number;
  type: 'sentence' | 'dialogue';
  examples: ExampleSentence[] | DialogueLine[];
}

// User API
export const userApi = {
  getAll: () => api.get<User[]>('/users/'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (data: { name: string; avatar?: string }) => 
    api.post<User>('/users', data),
  update: (id: number, data: { name: string; avatar?: string }) => 
    api.put<User>(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Deck API
export const deckApi = {
  getByUser: (userId: number) => api.get<Deck[]>(`/decks/user/${userId}`),
  getById: (id: number) => api.get<Deck>(`/decks/${id}`),
  create: (data: { name: string; language: string; user_id: number }) => 
    api.post<Deck>('/decks/', data),
  update: (id: number, data: { name: string }) => 
    api.put<Deck>(`/decks/${id}`, data),
  delete: (id: number) => api.delete(`/decks/${id}`),
};

// Flashcard API
export const flashcardApi = {
  getByDeck: (deckId: number) => 
    api.get<Flashcard[]>(`/flashcards/deck/${deckId}`),
  getById: (id: number) => api.get<Flashcard>(`/flashcards/${id}`),
  create: (data: {
    deck_id: number;
    vietnamese: string;
    pronunciation?: string;
    target_language: string;
  }) => api.post<Flashcard>('/flashcards/', data),
  bulkCreate: (data: {
    deck_id: number;
    flashcards: Array<{
      vietnamese: string;
      pronunciation: string;
      target_language: string;
    }>;
  }) => api.post('/flashcards/bulk', data),
  uploadCSV: (deckId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/flashcards/upload-csv/${deckId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: number, data: {
    vietnamese: string;
    pronunciation: string;
    target_language: string;
  }) => api.put<Flashcard>(`/flashcards/${id}`, data),
  delete: (id: number) => api.delete(`/flashcards/${id}`),
  generateExample: (flashcardId: number, exampleType: 'sentence' | 'dialogue') =>
    api.post<ExampleResponse>(`/flashcards/${flashcardId}/generate-example`, null, {
      params: { example_type: exampleType }
    }),
};

// Dictionary API
export const dictionaryApi = {
  search: (query: string, language: string, limit: number = 10) =>
    api.get<DictionaryResult[]>('/dictionary/search', {
      params: { query, language, limit },
    }),
};

// Quiz API
export const quizApi = {
  generateOptions: (
    deckId: number, 
    word: string, 
    wordVietnamese: string,
    language: string, 
    count: number = 3
  ) =>
    api.get<{ options: QuizOption[] }>('/quiz/generate-options/' + deckId, {
      params: { 
        word, 
        word_vietnamese: wordVietnamese,
        language, 
        count 
      },
    }),
};

// TTS API
export const ttsApi = {
  speak: (text: string, language: string) =>
    `${API_URL}/tts/speak?text=${encodeURIComponent(text)}&language=${language}`,
};