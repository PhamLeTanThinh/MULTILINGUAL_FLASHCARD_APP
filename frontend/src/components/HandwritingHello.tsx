'use client';

import { useEffect, useState } from 'react';

const words = [
  'Hello',
  'Xin chào',
  'こんにちは',
  '你好',
  '안녕하세요',
];

export function HandwritingHello() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center py-10">
      {/* Viên thuốc chứa chữ + sweep, bo tròn + overflow-hidden */}
      <div className="relative h-12 sm:h-14 px-8 sm:px-10 rounded-full overflow-hidden flex items-center justify-center bg-transparent">
        {/* Sweep highlight chạy vô hạn */}
        <div
          className="
            pointer-events-none
            absolute inset-0 
            bg-gradient-to-r from-transparent via-white/60 to-transparent
            animate-[sweep_4s_linear_infinite]
            mix-blend-screen
          "
        />

        {/* Chữ gradient, nhún nhẹ lên xuống */}
        <h1
          key={index}
          className={`
            relative
            text-3xl sm:text-4xl font-light tracking-wide
            bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400
            bg-clip-text text-transparent
            opacity-0
            animate-[fadeInOut_3.2s_ease-in-out]
          `}
        >
          {words[index]}
        </h1>
      </div>
    </div>
  );
}
