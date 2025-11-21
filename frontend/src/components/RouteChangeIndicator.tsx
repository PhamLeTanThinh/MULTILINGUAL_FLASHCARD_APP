'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function RouteChangeIndicator() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Bỏ lần render đầu tiên (initial load)
    if (previousPathRef.current === null) {
      previousPathRef.current = pathname;
      return;
    }

    // Nếu URL đổi => bật loading
    if (pathname !== previousPathRef.current) {
      previousPathRef.current = pathname;
      setIsLoading(true);

      // Tắt loading sau ~0.6s cho mượt
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-card px-8 py-6 shadow-xl border border-border">
        {/* Track chạy */}
        <div className="relative w-40 h-16 flex items-end justify-center">
          {/* Đường chạy */}
          <div className="absolute bottom-2 left-4 right-4 h-[2px] bg-muted" />
          {/* Nhân vật chạy */}
          <div className="relative h-10 w-full">
            <div className="absolute bottom-2 left-0 text-4xl animate-[runner_0.8s_ease-in-out_infinite]">
              🐾
            </div>
          </div>
        </div>

        {/* Text dễ thương */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm font-medium">
            Đừng dí em, em tới lèn...
          </p>
          <p className="text-xs text-muted-foreground">
            Chờ xíu nho 🐶✨
          </p>
        </div>
      </div>
    </div>
  );
}
