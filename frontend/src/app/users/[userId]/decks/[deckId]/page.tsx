'use client';

import { useQuery } from '@tanstack/react-query';
import { deckApi, flashcardApi, Flashcard } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Trash2, Edit, Play, Upload, Search, CheckCircle2, Keyboard } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CSVImport } from '@/components/CSVImport';
import { DictionarySearch } from '@/components/DictionarySearch';
import { ThemeToggle } from '@/components/ThemeToggle';

type ActiveTab = 'manual' | 'csv' | 'dictionary' | null;

export default function DeckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);
  const deckId = parseInt(params.deckId as string);

  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

  const [vietnamese, setVietnamese] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');

  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => deckApi.getById(deckId).then((res) => res.data),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const { data: flashcards, refetch } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => flashcardApi.getByDeck(deckId).then((res) => res.data),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!vietnamese.trim()) {
      toast.error('Vui lòng nhập tiếng Việt');
      return;
    }

    if (!targetLanguage.trim()) {
      toast.error('Vui lòng nhập ngôn ngữ đích');
      return;
    }

    try {
      if (editingCard) {
        await flashcardApi.update(editingCard.id, {
          vietnamese: vietnamese.trim(),
          pronunciation: pronunciation.trim(),
          target_language: targetLanguage.trim(),
        });
        toast.success('Cập nhật flashcard thành công!');
        setEditingCard(null);
      } else {
        await flashcardApi.create({
          deck_id: deckId,
          vietnamese: vietnamese.trim(),
          pronunciation: pronunciation.trim(),
          target_language: targetLanguage.trim(),
        });
        toast.success('Tạo flashcard thành công!');
      }

      setVietnamese('');
      setPronunciation('');
      setTargetLanguage('');
      setActiveTab(null);
      refetch();
    } catch (error) {
      toast.error('Thao tác thất bại!');
    }
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setVietnamese(card.vietnamese);
    setPronunciation(card.pronunciation);
    setTargetLanguage(card.target_language);
    setActiveTab('manual');
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!confirm('Bạn có chắc muốn xóa thẻ này?')) return;

    try {
      await flashcardApi.delete(cardId);
      toast.success('Xóa flashcard thành công!');
      refetch();
    } catch (error) {
      toast.error('Xóa flashcard thất bại!');
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (activeTab === tab) {
      setActiveTab(null);
      setEditingCard(null);
      setVietnamese('');
      setPronunciation('');
      setTargetLanguage('');
    } else {
      setActiveTab(tab);
      if (tab !== 'manual') {
        setEditingCard(null);
        setVietnamese('');
        setPronunciation('');
        setTargetLanguage('');
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/users/${userId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">{deck?.name}</h1>
              <p className="text-muted-foreground">
                {flashcards?.length || 0} thẻ • {deck?.language}
              </p>
            </div>
            <div className="flex gap-3">
              {(deck?.language === 'KO' || deck?.language === 'JA') && (
                <Button
                  onClick={() => router.push(`/users/${userId}/decks/${deckId}/typing`)}
                  size="lg"
                  variant="outline"
                  disabled={!flashcards || flashcards.length === 0}
                >
                  <Keyboard className="w-5 h-5 mr-2" />
                  Luyện gõ
                </Button>
              )}
              <Button
                onClick={() => router.push(`/users/${userId}/decks/${deckId}/quiz`)}
                size="lg"
                variant="outline"
                disabled={!flashcards || flashcards.length < 4}
              >
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Làm Quiz
              </Button>
              <Button
                onClick={() => router.push(`/users/${userId}/decks/${deckId}/study`)}
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Bắt đầu học
              </Button>
            </div>
          </div>

        </div>


        <div className="mb-6 flex gap-4 flex-wrap">
          <Button
            variant={activeTab === 'manual' ? 'default' : 'outline'}
            onClick={() => handleTabChange('manual')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm thẻ thủ công
          </Button>
          <Button
            variant={activeTab === 'csv' ? 'default' : 'outline'}
            onClick={() => handleTabChange('csv')}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Button
            variant={activeTab === 'dictionary' ? 'default' : 'outline'}
            onClick={() => handleTabChange('dictionary')}
          >
            <Search className="w-4 h-4 mr-2" />
            Tìm từ điển
          </Button>
        </div>

        {activeTab === 'manual' && (
          <form
            onSubmit={handleCreateCard}
            className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors"
          >
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {editingCard ? 'Sửa flashcard' : 'Thêm flashcard mới'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Tiếng Việt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vietnamese}
                  onChange={(e) => setVietnamese(e.target.value)}
                  placeholder="Ví dụ: xin chào"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Phiên âm <span className="text-muted-foreground text-xs">(tùy chọn - tự động sinh nếu để trống)</span>
                </label>
                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="Ví dụ: nǐ hǎo"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Ngôn ngữ đích <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  placeholder="Ví dụ: 你好"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  {editingCard ? 'Cập nhật' : 'Thêm thẻ'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setActiveTab(null);
                    setEditingCard(null);
                    setVietnamese('');
                    setPronunciation('');
                    setTargetLanguage('');
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </form>
        )}

        {activeTab === 'csv' && (
          <div className="mb-6">
            <CSVImport deckId={deckId} onSuccess={refetch} />
          </div>
        )}

        {activeTab === 'dictionary' && deck && (
          <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Tìm từ trong từ điển</h3>
            <DictionarySearch
              deckId={deckId}
              language={deck.language}
              onSuccess={refetch}
            />
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tiếng Việt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ngôn ngữ đích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phiên âm
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {flashcards?.map((card: Flashcard) => (
                  <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-foreground">
                      {card.vietnamese}
                    </td>
                    <td className="px-6 py-4 text-2xl text-foreground">
                      {card.target_language}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {card.pronunciation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCard(card)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {flashcards?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Chưa có flashcard nào</p>
              <Button onClick={() => setActiveTab('manual')}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm flashcard đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}