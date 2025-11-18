import React from 'react';
import { Deck } from '../types';

type Props = {
  deck: Deck;
  onClick?: () => void;
};

export default function DeckCard({ deck, onClick }: Props) {
  return (
    <div className="p-4 border rounded shadow hover:bg-blue-50 cursor-pointer" onClick={onClick}>
      <div className="font-bold text-lg">{deck.name}</div>
      <div className="text-xs text-gray-500">Ngôn ngữ: {deck.language}</div>
      <div className="text-xs text-gray-500">Số thẻ: {deck.flashcard_count}</div>
    </div>
  );
}
