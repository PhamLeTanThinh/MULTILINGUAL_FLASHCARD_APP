'use client';

import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dictionaryApi, DictionaryResult, flashcardApi } from '@/lib/api';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface DictionarySearchProps {
  deckId: number;
  language: string;
  onSuccess: () => void;
}

export function DictionarySearch({
  deckId,
  language,
  onSuccess,
}: DictionarySearchProps) {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: results, isLoading } = useQuery({
    queryKey: ['dictionary', searchTerm, language],
    queryFn: () => dictionaryApi.search(searchTerm, language).then((res) => res.data),
    enabled: searchTerm.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  const handleAddFlashcard = async (result: DictionaryResult) => {
    try {
      await flashcardApi.create({
        deck_id: deckId,
        vietnamese: result.vietnamese,
        pronunciation: result.pronunciation,
        target_language: result.target_language,
      });
      toast.success('Đã thêm flashcard!');
      onSuccess();
    } catch (error) {
      toast.error('Thêm flashcard thất bại!');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm từ bằng tiếng Việt..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <Button type="submit" disabled={!query}>
          Tìm kiếm
        </Button>
      </form>

      {isLoading && (
        <p className="text-center text-muted-foreground">Đang tìm kiếm...</p>
      )}

      {results && results.length > 0 && (
        <div className="border border-border rounded-lg divide-y">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{result.vietnamese}</p>
                <p className="text-2xl mt-1">{result.target_language}</p>
                <p className="text-sm text-muted-foreground">
                  {result.pronunciation}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleAddFlashcard(result)}
                className="ml-4"
              >
                <Plus className="w-4 h-4 mr-1" />
                Thêm
              </Button>
            </div>
          ))}
        </div>
      )}

      {results && results.length === 0 && (
        <p className="text-center text-muted-foreground">
          Không tìm thấy kết quả
        </p>
      )}
    </div>
  );
}