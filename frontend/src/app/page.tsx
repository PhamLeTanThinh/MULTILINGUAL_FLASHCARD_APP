'use client';

import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Plus, User, Clock, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';
import { UserModal } from '@/components/UserModal';


export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userApi.getAll().then((res) => res.data),
    refetchInterval: 60000, // Refresh mỗi 1 phút để cập nhật countdown
  });

  const getCountdownColor = (days: number | undefined) => {
    if (!days) return 'text-gray-500';
    if (days <= 3) return 'text-red-500';
    if (days <= 7) return 'text-orange-500';
    if (days <= 14) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getCountdownBadge = (days: number | undefined) => {
    if (!days) return null;
    if (days <= 3) return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    if (days <= 7) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
    if (days <= 14) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              📚 Flashcard App
            </h1>
            <p className="text-muted-foreground">
              Chọn người dùng để bắt đầu học
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <Button onClick={() => setShowModal(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Tạo người dùng
            </Button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                ⚠️ Chính sách xóa dữ liệu tự động
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Tài khoản không hoạt động quá <strong>30 ngày</strong> sẽ bị xóa tự động cùng toàn bộ dữ liệu. 
                Đăng nhập định kỳ để giữ tài khoản của bạn.
              </p>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
          </div>
        ) : users && users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => router.push(`/users/${user.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer transform hover:scale-105 border border-transparent hover:border-primary"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                      {user.avatar || user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {user.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {user.deck_count || 0} decks
                      </p>
                    </div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${getCountdownBadge(user.days_until_deletion)}`}>
                  <Clock className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Xóa tự động sau:</p>
                    <p className={`text-lg font-bold ${getCountdownColor(user.days_until_deletion)}`}>
                      {user.days_until_deletion !== undefined 
                        ? `${user.days_until_deletion} ngày` 
                        : 'Đang tải...'}
                    </p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="mt-3 text-xs text-muted-foreground">
                  Hoạt động cuối: {new Date(user.last_activity_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Chưa có người dùng
            </h3>
            <p className="text-muted-foreground mb-6">
              Tạo người dùng đầu tiên để bắt đầu học
            </p>
            <Button onClick={() => setShowModal(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Tạo người dùng ngay
            </Button>
          </div>
        )}
      </div>

      <UserModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </main>
  );
}