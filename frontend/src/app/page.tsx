'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Plus, User, Clock, AlertTriangle, BookOpen, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';
import { UserModal } from '@/components/UserModal';
import LoyaltyShop from '@/components/LoyaltyShop';
import { HandwritingHello } from '@/components/HandwritingHello';

export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  const getCountdownColor = (days: number | undefined) => {
    if (!days) return 'text-gray-500 dark:text-gray-400';
    if (days <= 3) return 'text-red-600 dark:text-red-400';
    if (days <= 7) return 'text-orange-600 dark:text-orange-400';
    if (days <= 14) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getCountdownBadge = (days: number | undefined) => {
    if (!days) return 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700';
    if (days <= 3) return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
    if (days <= 7) return 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800';
    if (days <= 14) return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
  };

  const getProgressColor = (days: number | undefined) => {
    if (!days) return 'bg-gray-200 dark:bg-gray-700';
    if (days <= 3) return 'bg-red-500';
    if (days <= 7) return 'bg-orange-500';
    if (days <= 14) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Theme base class (không tính gradient custom)
  const getThemeClass = (theme: string | undefined) => {
    const key = theme?.startsWith('custom:') ? 'custom' : theme;
    if (key === 'sakura') return 'bg-pink-50 dark:bg-pink-950/40';
    if (key === 'dark') return 'bg-gray-900/90';
    if (key === 'forest') return 'bg-emerald-50 dark:bg-emerald-950/40';
    if (key === 'sunset')
      return 'bg-gradient-to-br from-orange-300 via-pink-400 to-rose-400 dark:from-orange-700 dark:via-pink-800 dark:to-rose-800';
    if (key === 'ocean')
      return 'bg-gradient-to-br from-blue-300 via-sky-300 to-cyan-300 dark:from-blue-800 dark:via-sky-900 dark:to-cyan-900';
    if (key === 'neon')
      return 'bg-gradient-to-br from-fuchsia-400 via-purple-400 to-sky-400 dark:from-fuchsia-800 dark:via-purple-800 dark:to-sky-800';
    if (key === 'custom') return 'bg-white/90 dark:bg-gray-900/80';
    return 'bg-white dark:bg-gray-800';
  };

  // Inline style cho custom theme: custom:#c1,#c2,#c3
  const getThemeStyle = (theme: string | undefined) => {
    if (!theme || !theme.startsWith('custom:')) return undefined;
    try {
      const raw = theme.slice('custom:'.length);
      const parts = raw.split(',');
      const from = parts[0] || '#4f46e5';
      const via = parts[1] || from;
      const to = parts[2] || via;
      return {
        backgroundImage: `linear-gradient(to bottom right, ${from}, ${via}, ${to})`,
      } as React.CSSProperties;
    } catch {
      return undefined;
    }
  };

  // Avatar pastel map từ theme (nhạt hơn)
  const getAvatarGradientClass = (theme: string | undefined) => {
    const key = theme?.startsWith("custom:") ? "custom" : theme;

    if (key === "sakura")
      return "from-pink-200 via-rose-200 to-amber-200";

    if (key === "forest")
      return "from-emerald-200 via-emerald-100 to-lime-200";

    if (key === "dark")
      return "from-slate-300 via-indigo-300 to-purple-300";

    if (key === "sunset")
      return "from-orange-100 via-pink-100 to-rose-100";

    if (key === "ocean")
      return "from-blue-100 via-sky-100 to-cyan-100";

    if (key === "neon")
      return "from-fuchsia-200 via-purple-200 to-sky-200";


    if (key === "custom") return "";

    // default
    return "from-blue-100 via-indigo-100 to-purple-100";
  };

  // Avatar pastel cho theme custom
  const getAvatarStyle = (theme: string | undefined) => {
    if (!theme || !theme.startsWith("custom:")) return undefined;

    try {
      const raw = theme.slice("custom:".length);
      const parts = raw.split(",");

      const from = parts[0] || "#4f46e5";
      const via = parts[1] || from;
      const to = parts[2] || via;

      return {
        backgroundImage: `
        linear-gradient(to bottom right,
          rgba(255,255,255,0.60),
          rgba(255,255,255,0.60)
        ),
        linear-gradient(to bottom right, ${from}, ${via}, ${to})
      `,
      } as React.CSSProperties;
    } catch {
      return undefined;
    }
  };


  const avatarEmojiMap: Record<string, string> = {
    default: '🙂',
    cat: '😼',
    panda: '🐼',
    dragon: '🐉',
    fox: '🦊',
    robot: '🤖',
    unicorn: '🦄',
    alien: '👽',
    ghost: '👻',
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section - Centered */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 mb-6 shadow-2xl shadow-blue-500/30">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1
            className="
              text-5xl font-bold mb-3 
              bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 
              bg-clip-text text-transparent
              leading-tight
              pb-1
            "
          >
            Multilingual Flashcard
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Nhỏ không học, lớn giống thằng làm app này!
          </p>
          <div className="flex items-center justify-center gap-3">
            <ThemeToggle />
            <Button
              onClick={() => setShowModal(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <HandwritingHello />
        </div>

        {/* Warning Banner */}
        <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800/50 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">
                Chính sách xóa dữ liệu tự động
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Tài khoản không hoạt động quá{' '}
                <strong className="font-bold text-yellow-700 dark:text-yellow-400">30 ngày</strong> sẽ bị xóa tự
                động cùng toàn bộ dữ liệu. Giống như trí nhớ của bạn vậy đó 😉!
              </p>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : users && users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => {
              const progressPercentage = user.days_until_deletion ? (user.days_until_deletion / 30) * 100 : 0;

              return (
                <div
                  key={user.id}
                  onClick={() => router.push(`/users/${user.id}`)}
                  className={
                    "relative group rounded-2xl cursor-pointer overflow-hidden " +
                    "border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 " +
                    getThemeClass(user.theme)
                  }
                  style={getThemeStyle(user.theme)}
                >
                  {/* CONTENT */}
                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div
                            className={
                              "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-300 " +
                              getAvatarGradientClass(user.theme)
                            }
                            style={getAvatarStyle(user.theme)}
                          >
                            {user.avatar && avatarEmojiMap[user.avatar]
                              ? avatarEmojiMap[user.avatar]
                              : user.avatar || user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {user.name}
                          </h3>

                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                              <BookOpen className="w-4 h-4" />
                              <span className="font-medium">{user.deck_count || 0}</span>
                              <span>decks</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-sm text-purple-600 dark:text-purple-300">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-medium">{user.points ?? 0}</span>
                              <span>bPoint</span>
                            </div>
                          </div>

                          {/* Nút đổi quà */}
                          <div className="mt-3">
                            <Button
                              size="sm"
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                setShowShop(true);
                              }}
                            >
                              Đổi quà 🎁
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Countdown Section */}
                    <div className="px-6 pb-6">
                      <div
                        className={`rounded-xl p-4 ${getCountdownBadge(
                          user.days_until_deletion
                        )} transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock
                              className={`w-4 h-4 ${getCountdownColor(
                                user.days_until_deletion
                              )}`}
                            />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              Thời gian còn lại
                            </span>
                          </div>
                          <span
                            className={`text-2xl font-bold ${getCountdownColor(
                              user.days_until_deletion
                            )}`}
                          >
                            {user.days_until_deletion !== undefined
                              ? `${user.days_until_deletion}d`
                              : "---"}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(
                              user.days_until_deletion
                            )} transition-all duration-500 rounded-full`}
                            style={{ width: `${Math.max(5, progressPercentage)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/40 border-t border-white/20 dark:border-gray-700">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Hoạt động cuối</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {new Date(user.last_activity_at).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-12 text-center max-w-md border border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Chưa có người dùng</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Tạo người dùng đầu tiên để bắt đầu hành trình học tập của bạn
              </p>
              <Button
                onClick={() => setShowModal(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tạo người dùng ngay
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Loyalty Shop Modal */}
      {showShop && selectedUser && (
        <LoyaltyShop
          userId={selectedUser.id}
          currentPoints={selectedUser.points ?? 0}
          currentAvatar={selectedUser.avatar || 'default'}
          currentTheme={selectedUser.theme || 'default'}
          onClose={() => setShowShop(false)}
          onUpdate={(_points, _avatar, _theme) => {
            refetch();
          }}
        />
      )}
    </main>
  );
}
