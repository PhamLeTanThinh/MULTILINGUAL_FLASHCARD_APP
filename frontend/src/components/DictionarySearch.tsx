'use client';

import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dictionaryApi, DictionaryResult, flashcardApi } from '@/lib/api';
import { Button } from './ui/Button';
import { Switch } from './ui/switch';
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

  // kanjiOnly: trạng thái toggle trên UI
  const [kanjiOnly, setKanjiOnly] = useState(false);
  // searchKanjiOnly: giá trị thực dùng khi call API (chỉ update khi bấm Tìm kiếm)
  const [searchKanjiOnly, setSearchKanjiOnly] = useState(false);

  // searchId: tăng mỗi lần bấm Tìm kiếm để luôn refetch API
  const [searchId, setSearchId] = useState(0);

  // Reset khi đổi ngôn ngữ
  useEffect(() => {
    setKanjiOnly(false);
    setSearchKanjiOnly(false);
    setQuery('');
    setSearchTerm('');
    setSearchId(0);
  }, [language]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['dictionary', searchId, searchTerm, language, searchKanjiOnly],
    queryFn: () =>
      dictionaryApi
        .search(searchTerm, language, searchKanjiOnly)
        .then((res) => res.data),
    enabled: searchTerm.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      // nếu bấm tìm kiếm khi input trống ⇒ clear luôn kết quả
      setSearchTerm('');
      setSearchId(0);
      return;
    }

    // Chỉ khi bấm Tìm kiếm mới áp dụng toggle & từ khoá cho API
    setSearchTerm(trimmed);
    setSearchKanjiOnly(kanjiOnly);
    setSearchId((prev) => prev + 1); // luôn đổi key ⇒ luôn refetch
  };

  const handleChangeInput = (value: string) => {
    setQuery(value);

    if (value.trim() === '') {
      // Khi xoá sạch input ⇒ clear luôn searchTerm để ẩn kết quả cũ
      setSearchTerm('');
      setSearchId(0);
    }
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

  const isJapanese = language === 'JA';

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChangeInput(e.target.value)}
            placeholder="Tìm từ bằng tiếng Việt..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
          />
        </div>

        <div className="flex items-center gap-3 justify-end">
          {/* Toggle Kanji – dạng Switch, không gọi API khi gạt */}
          {isJapanese && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                漢字
              </span>
              <Switch
                checked={kanjiOnly}
                onCheckedChange={(checked) => setKanjiOnly(checked)}
                aria-label="Chỉ hiển thị từ có Kanji (áp dụng khi bấm Tìm kiếm)"
              />
            </div>
          )}

          <Button type="submit" disabled={!query.trim()}>
            Tìm kiếm
          </Button>
        </div>
      </form>

      {isJapanese && (
        <p className="text-xs text-muted-foreground">
          Gạt toggle <span className="font-medium">漢字</span> để chỉ hiển thị từ có
          Kanji. Trạng thái này chỉ áp dụng khi bạn bấm &quot;Tìm kiếm&quot;.
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <p className="text-center text-muted-foreground">Đang tìm kiếm...</p>
      )}

      {/* Kết quả */}
      {searchTerm && results && results.length > 0 && (
        <div className="border border-border rounded-lg divide-y">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-4 flex items-center justify-between hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">{result.vietnamese}</p>
                <p className="text-2xl mt-1">{result.target_language}</p>
                <p className="text-sm text-muted-foreground mt-1">
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

      {searchTerm && results && results.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground">
          Không tìm thấy kết quả
        </p>
      )}
    </div>
  );
}
