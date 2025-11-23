'use client';

import { useQuery } from '@tanstack/react-query';
import { deckApi, flashcardApi, Flashcard } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Trash2, Edit, Play, Upload, Search, CheckCircle2, Keyboard, Menu, X } from 'lucide-react';
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
        setActiveTab(null);
      } else {
        await flashcardApi.create({
          deck_id: deckId,
          vietnamese: vietnamese.trim(),
          pronunciation: pronunciation.trim(),
          target_language: targetLanguage.trim(),
        });
        toast.success('Tạo flashcard thành công!');
      }

      // Reset input sau mỗi lần submit
      setVietnamese('');
      setPronunciation('');
      setTargetLanguage('');

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
    // Scroll to form on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }, 100);
    }
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
    setShowMobileMenu(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Container với responsive padding */}
      <div className="container mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-6xl">
        
        {/* Header - Responsive */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/users/${userId}`)}
            className="tap-target"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Quay lại</span>
          </Button>
          <ThemeToggle />
        </div>

        {/* Deck Info Card - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 transition-colors">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground break-words">
                {deck?.name}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {flashcards?.length || 0} thẻ • {deck?.language}
              </p>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex gap-3 flex-shrink-0">
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

            {/* Mobile Action Buttons */}
            <div className="flex md:hidden gap-2 w-full">
              <Button
                onClick={() => router.push(`/users/${userId}/decks/${deckId}/study`)}
                className="flex-1 tap-target"
                disabled={!flashcards || flashcards.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Học ngay
              </Button>
              <Button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                variant="outline"
                className="tap-target"
              >
                {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="md:hidden flex flex-col gap-2 pt-4 border-t border-border animate-fade-soft">
              <Button
                onClick={() => {
                  router.push(`/users/${userId}/decks/${deckId}/quiz`);
                  setShowMobileMenu(false);
                }}
                variant="outline"
                className="w-full tap-target justify-start"
                disabled={!flashcards || flashcards.length < 4}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Làm Quiz
              </Button>
              {(deck?.language === 'KO' || deck?.language === 'JA') && (
                <Button
                  onClick={() => {
                    router.push(`/users/${userId}/decks/${deckId}/typing`);
                    setShowMobileMenu(false);
                  }}
                  variant="outline"
                  className="w-full tap-target justify-start"
                  disabled={!flashcards || flashcards.length === 0}
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Luyện gõ
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Action Tabs - Responsive */}
        <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-4 overflow-x-auto pb-2 hide-scrollbar">
          <Button
            variant={activeTab === 'manual' ? 'default' : 'outline'}
            onClick={() => handleTabChange('manual')}
            className="tap-target whitespace-nowrap flex-shrink-0 text-sm sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Thêm thẻ</span>
            <span className="xs:hidden">Thêm</span>
          </Button>
          <Button
            variant={activeTab === 'csv' ? 'default' : 'outline'}
            onClick={() => handleTabChange('csv')}
            className="tap-target whitespace-nowrap flex-shrink-0 text-sm sm:text-base"
          >
            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Import CSV</span>
            <span className="xs:hidden">CSV</span>
          </Button>
          <Button
            variant={activeTab === 'dictionary' ? 'default' : 'outline'}
            onClick={() => handleTabChange('dictionary')}
            className="tap-target whitespace-nowrap flex-shrink-0 text-sm sm:text-base"
          >
            <Search className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Tìm từ điển</span>
            <span className="xs:hidden">Từ điển</span>
          </Button>
        </div>

        {/* Manual Form - Responsive */}
        {activeTab === 'manual' && (
          <form
            onSubmit={handleCreateCard}
            className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md transition-colors animate-fade-soft"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              {editingCard ? 'Sửa flashcard' : 'Thêm flashcard mới'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Tiếng Việt <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vietnamese}
                  onChange={(e) => setVietnamese(e.target.value)}
                  placeholder="Ví dụ: xin chào"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground tap-target"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Phiên âm{' '}
                  <span className="text-muted-foreground text-xs block sm:inline">
                    (tùy chọn - tự động sinh nếu để trống)
                  </span>
                </label>
                <input
                  type="text"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="Ví dụ: nǐ hǎo"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground tap-target"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-base border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground tap-target"
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
                <Button type="submit" className="flex-1 tap-target">
                  {editingCard ? 'Cập nhật' : 'Thêm thẻ'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 tap-target"
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

        {/* CSV Import - Responsive */}
        {activeTab === 'csv' && (
          <div className="mb-4 sm:mb-6 animate-fade-soft">
            <CSVImport deckId={deckId} onSuccess={refetch} />
          </div>
        )}

        {/* Dictionary Search - Responsive */}
        {activeTab === 'dictionary' && deck && (
          <div className="mb-4 sm:mb-6 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md transition-colors animate-fade-soft">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-foreground">
              Tìm từ trong từ điển
            </h3>
            <DictionarySearch
              deckId={deckId}
              language={deck.language}
              onSuccess={refetch}
            />
          </div>
        )}

        {/* Flashcards Table - Desktop */}
        <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors">
          {/* Nút xóa tất cả flashcard */}
          <div className="flex justify-end p-4">
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!flashcards || flashcards.length === 0) return toast('Không có flashcard để xóa');
                if (confirm('Bạn có chắc muốn xóa tất cả các flashcard trong bộ này?')) {
                  try {
                    await flashcardApi.deleteAll(deckId);
                    toast.success('Đã xóa tất cả flashcard!');
                    refetch();
                  } catch {
                    toast.error('Xóa tất cả flashcard thất bại!');
                  }
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Xóa tất cả
            </Button>
          </div>
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

        {/* Flashcards Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {flashcards?.map((card: Flashcard) => (
            <div
              key={card.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-colors"
            >
              <div className="space-y-2 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tiếng Việt</p>
                  <p className="text-base font-medium text-foreground">{card.vietnamese}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ngôn ngữ đích</p>
                  <p className="text-2xl font-medium text-foreground">{card.target_language}</p>
                </div>
                {card.pronunciation && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phiên âm</p>
                    <p className="text-sm text-muted-foreground">{card.pronunciation}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCard(card)}
                  className="flex-1 tap-target"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteCard(card.id)}
                  className="flex-1 tap-target"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </div>
          ))}

          {flashcards?.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <p className="text-muted-foreground mb-4">Chưa có flashcard nào</p>
              <Button onClick={() => setActiveTab('manual')} className="tap-target">
                <Plus className="w-4 h-4 mr-2" />
                Thêm flashcard đầu tiên
              </Button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes fadeSoft {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-soft {
          animation: fadeSoft 0.58s ease-out;
        }
      `}</style>
    </main>
  );
}
