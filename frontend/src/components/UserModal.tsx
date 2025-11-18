'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { X, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_SUGGESTIONS = ['👤', '😊', '🎓', '💡', '🚀', '⭐', '🌟', '✨'];

export function UserModal({ isOpen, onClose }: UserModalProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const createUserMutation = useMutation({
    mutationFn: (data: { name: string; avatar?: string }) => 
      userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Tạo người dùng thành công! 🎉');
      setName('');
      setAvatar('');
      onClose();
    },
    onError: () => {
      toast.error('Lỗi khi tạo người dùng');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên');
      return;
    }
    createUserMutation.mutate({
      name: name.trim(),
      avatar: avatar.trim() || undefined,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Tạo người dùng mới
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Tên người dùng <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                autoFocus
              />
            </div>
          </div>

          {/* Avatar Input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Avatar (emoji hoặc chữ cái)
            </label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="VD: 👤 hoặc A"
              maxLength={2}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
            />
            
            {/* Emoji Suggestions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-xl transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              💡 Để trống sẽ dùng chữ cái đầu của tên
            </p>
          </div>

          {/* Preview */}
          {(name || avatar) && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-border">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {avatar || name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground">Preview</p>
                <p className="text-lg font-bold text-foreground">{name || 'Tên người dùng'}</p>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              ⚠️ <strong>Lưu ý:</strong> Tài khoản không hoạt động quá 30 ngày sẽ bị xóa tự động
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={createUserMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createUserMutation.isPending || !name.trim()}
            >
              {createUserMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Tạo ngay
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}