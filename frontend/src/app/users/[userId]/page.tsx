'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi, deckApi, Deck } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Plus, BookOpen, ArrowLeft, Trash2, Download } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/ThemeToggle';

const LANGUAGES = [
  { code: 'EN', name: 'Tiếng Anh', flag: '🇬🇧', color: 'from-blue-500 to-cyan-500' },
  { code: 'ZH', name: 'Tiếng Trung', flag: '🇨🇳', color: 'from-red-500 to-orange-500' },
  { code: 'JA', name: 'Tiếng Nhật', flag: '🇯🇵', color: 'from-pink-500 to-rose-500' },
  { code: 'KO', name: 'Tiếng Hàn', flag: '🇰🇷', color: 'from-purple-500 to-indigo-500' },
];

// 👇 backend base để build link tải CSV
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function UserDecksPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);

  const [showCreateDeck, setShowCreateDeck] = useState(false);
  const [deckName, setDeckName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('EN');

  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userApi.getById(userId).then((res) => res.data),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const { data: decks, isLoading, refetch } = useQuery({
    queryKey: ['decks', userId],
    queryFn: () => deckApi.getByUser(userId).then((res) => res.data),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deckName.trim()) {
      toast.error('Vui lòng nhập tên bộ flashcard');
      return;
    }

    if (deckName.trim().length < 2) {
      toast.error('Tên bộ flashcard phải có ít nhất 2 ký tự');
      return;
    }

    if (deckName.trim().length > 100) {
      toast.error('Tên bộ flashcard không được quá 100 ký tự');
      return;
    }

    try {
      await deckApi.create({
        name: deckName.trim(),
        language: selectedLanguage,
        user_id: userId,
      });
      toast.success('Tạo deck thành công!');
      setDeckName('');
      setShowCreateDeck(false);
      refetch();
    } catch (error) {
      toast.error('Tạo deck thất bại!');
    }
  };

  const handleDeleteDeck = async (deckId: number) => {
    if (!confirm('Bạn có chắc muốn xóa deck này?')) return;

    try {
      await deckApi.delete(deckId);
      toast.success('Xóa deck thành công!');
      refetch();
    } catch (error) {
      toast.error('Xóa deck thất bại!');
    }
  };

  // ===== THEME HELPER (giống homepage) =====
  const getUserThemeClass = (theme?: string) => {
    if (theme === 'sakura')
      return 'bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/60 dark:to-rose-900/40';
    if (theme === 'dark')
      return 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
    if (theme === 'forest')
      return 'bg-gradient-to-br from-emerald-600 via-emerald-500 to-lime-400';
    if (theme === 'sunset')
      return 'bg-gradient-to-br from-orange-500 via-pink-500 to-red-500';
    if (theme === 'ocean')
      return 'bg-gradient-to-br from-sky-500 via-cyan-500 to-indigo-500';
    if (theme === 'neon')
      return 'bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400';
    if (theme === 'terminal')
      return 'bg-gradient-to-br from-black via-slate-900 to-emerald-500';
    if (theme === 'cafe')
      return 'bg-gradient-to-br from-amber-700 via-orange-500 to-stone-400';
    if (theme === 'default')
      return 'bg-white dark:bg-gray-800';
    // custom sẽ dùng inline style, nên chỉ cần nền trong suốt
    if (theme && theme.startsWith('custom:'))
      return 'bg-transparent';
    return 'bg-white dark:bg-gray-800';
  };

  const parseCustomTheme = (theme?: string) => {
    if (!theme || !theme.startsWith('custom:')) return null;
    const raw = theme.slice('custom:'.length);
    const parts = raw.split(',');
    if (parts.length < 3) return null;
    const [from, via, to] = parts;
    return { from, via, to };
  };

  const customTheme = parseCustomTheme(user?.theme);

  // ===== AVATAR HELPER (giống homepage) =====
  const renderUserAvatar = () => {
    if (!user) return null;

    const avatar = user.avatar;
    const DEFAULT_EMOJI = '🙂';

    if (avatar) {
      const looksLikeImage =
        avatar.startsWith('http') ||
        avatar.startsWith('/') ||
        avatar.startsWith('data:');

      if (looksLikeImage) {
        return (
          <img
            src={avatar}
            alt={user.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-md"
          />
        );
      }

      // avatar là key "default" hoặc emoji
      const display = avatar === 'default' ? DEFAULT_EMOJI : avatar;

      return (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
          <span className="text-3xl text-white">
            {display}
          </span>
        </div>
      );
    }

    // Fallback: chữ cái đầu tên
    return (
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-2xl text-white font-bold">
          {user.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground">Đang tải...</p>
      </div>
    );
  }

  const headerThemeClass = getUserThemeClass(user?.theme);
  const headerStyle = customTheme
    ? {
        backgroundImage: `linear-gradient(135deg, ${customTheme.from}, ${customTheme.via}, ${customTheme.to})`,
      }
    : undefined;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <ThemeToggle />
        </div>

        {/* HEADER: dùng theme + avatar giống homepage */}
        <div
          className={
            headerThemeClass +
            ' rounded-3xl shadow-xl p-6 mb-8 transition-colors border border-black/5 dark:border-white/10'
          }
          style={headerStyle}
        >
          <div className="flex items-center gap-4">
            {renderUserAvatar()}
            <div>
              <h1 className="text-3xl font-bold text-foreground drop-shadow-sm">
                {user?.name}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-3">
                {(decks?.length || 0) + ' bộ flashcard'}
                {typeof user?.points === 'number' && (
                  <span className="inline-flex items-center rounded-full bg-black/10 dark:bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-foreground">
                    bPoint: {user.points}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground">Bộ Flashcard</h2>
          <Button onClick={() => setShowCreateDeck(!showCreateDeck)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Deck Mới
          </Button>
        </div>

        {showCreateDeck && (
          <form
            onSubmit={handleCreateDeck}
            className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Tên bộ flashcard <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="Ví dụ: Từ vựng HSK 1"
                  className="w-full px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  minLength={2}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {deckName.length}/100 ký tự
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Chọn ngôn ngữ <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedLanguage === lang.code
                          ? 'border-primary bg-primary/20'
                          : 'border-border hover:border-primary/50 bg-background'
                      }`}
                    >
                      <div className="text-3xl mb-2 text-center">{lang.flag}</div>
                      <div className="text-center text-sm font-medium text-foreground">
                        {lang.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Tạo Deck
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDeck(false)}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks?.map((deck: Deck) => {
            const language = LANGUAGES.find((l) => l.code === deck.language);
            const downloadUrl =
              API_BASE && deck.id
                ? `${API_BASE}/decks/${deck.id}/export-csv`
                : null;
            return (
              <div
                key={deck.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div
                  className={`h-32 bg-gradient-to-br ${language?.color} p-6 flex items-center justify-center cursor-pointer`}
                  onClick={() => router.push(`/users/${userId}/decks/${deck.id}`)}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{language?.flag}</div>
                    <div className="text-white font-semibold">
                      {language?.name}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 line-clamp-1 text-foreground">
                    {deck.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {deck.flashcard_count || 0} thẻ
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/users/${userId}/decks/${deck.id}`)}
                    >
                      <BookOpen className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/users/${userId}/decks/${deck.id}/study`)}
                    >
                      Học
                    </Button>

                    {downloadUrl && (
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          CSV
                        </Button>
                      </a>
                    )}

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteDeck(deck.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {decks?.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg transition-colors">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Chưa có deck nào</p>
            <Button onClick={() => setShowCreateDeck(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo deck đầu tiên
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
