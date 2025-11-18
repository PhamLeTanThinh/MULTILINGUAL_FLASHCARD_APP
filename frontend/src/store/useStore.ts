import { create } from 'zustand';
import { User, Deck } from '@/lib/api';

interface AppState {
  currentUser: User | null;
  currentDeck: Deck | null;
  setCurrentUser: (user: User | null) => void;
  setCurrentDeck: (deck: Deck | null) => void;
}

export const useStore = create<AppState>((set) => ({
  currentUser: null,
  currentDeck: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentDeck: (deck) => set({ currentDeck: deck }),
}));