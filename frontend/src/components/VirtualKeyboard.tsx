'use client';

import { useEffect, useState } from 'react';

interface VirtualKeyboardProps {
  language: 'KO' | 'JA';
  pressedKey: string | null;
}

// Korean Keyboard Layout (Hangul)
const koreanLayout = {
  row1: [
    { key: 'q', hangul: 'ㅂ' },
    { key: 'w', hangul: 'ㅈ' },
    { key: 'e', hangul: 'ㄷ' },
    { key: 'r', hangul: 'ㄱ' },
    { key: 't', hangul: 'ㅅ' },
    { key: 'y', hangul: 'ㅛ' },
    { key: 'u', hangul: 'ㅕ' },
    { key: 'i', hangul: 'ㅑ' },
    { key: 'o', hangul: 'ㅐ' },
    { key: 'p', hangul: 'ㅔ' },
  ],
  row2: [
    { key: 'a', hangul: 'ㅁ' },
    { key: 's', hangul: 'ㄴ' },
    { key: 'd', hangul: 'ㅇ' },
    { key: 'f', hangul: 'ㄹ' },
    { key: 'g', hangul: 'ㅎ' },
    { key: 'h', hangul: 'ㅗ' },
    { key: 'j', hangul: 'ㅓ' },
    { key: 'k', hangul: 'ㅏ' },
    { key: 'l', hangul: 'ㅣ' },
  ],
  row3: [
    { key: 'z', hangul: 'ㅋ' },
    { key: 'x', hangul: 'ㅌ' },
    { key: 'c', hangul: 'ㅊ' },
    { key: 'v', hangul: 'ㅍ' },
    { key: 'b', hangul: 'ㅠ' },
    { key: 'n', hangul: 'ㅜ' },
    { key: 'm', hangul: 'ㅡ' },
  ],
};

// Japanese Keyboard Layout (Hiragana)
const japaneseLayout = {
  row1: [
    { key: 'q', hiragana: 'た' },
    { key: 'w', hiragana: 'て' },
    { key: 'e', hiragana: 'い' },
    { key: 'r', hiragana: 'す' },
    { key: 't', hiragana: 'か' },
    { key: 'y', hiragana: 'ん' },
    { key: 'u', hiragana: 'な' },
    { key: 'i', hiragana: 'に' },
    { key: 'o', hiragana: 'ら' },
    { key: 'p', hiragana: 'せ' },
  ],
  row2: [
    { key: 'a', hiragana: 'ち' },
    { key: 's', hiragana: 'と' },
    { key: 'd', hiragana: 'し' },
    { key: 'f', hiragana: 'は' },
    { key: 'g', hiragana: 'き' },
    { key: 'h', hiragana: 'く' },
    { key: 'j', hiragana: 'ま' },
    { key: 'k', hiragana: 'の' },
    { key: 'l', hiragana: 'り' },
  ],
  row3: [
    { key: 'z', hiragana: 'つ' },
    { key: 'x', hiragana: 'さ' },
    { key: 'c', hiragana: 'そ' },
    { key: 'v', hiragana: 'ひ' },
    { key: 'b', hiragana: 'こ' },
    { key: 'n', hiragana: 'み' },
    { key: 'm', hiragana: 'も' },
  ],
};

export function VirtualKeyboard({ language, pressedKey }: VirtualKeyboardProps) {
  const layout = language === 'KO' ? koreanLayout : japaneseLayout;
  const charKey = language === 'KO' ? 'hangul' : 'hiragana';

  const isKeyPressed = (key: string) => {
    return pressedKey?.toLowerCase() === key.toLowerCase();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Bàn phím {language === 'KO' ? 'Tiếng Hàn' : 'Tiếng Nhật'}
        </h3>
        <span className="text-sm text-muted-foreground">
          {language === 'KO' ? '한글' : 'ひらがな'}
        </span>
      </div>

      <div className="space-y-2">
        {/* Row 1 */}
        <div className="flex justify-center gap-1">
          {layout.row1.map((item) => (
            <div
              key={item.key}
              className={`
                relative w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center
                transition-all duration-150 font-medium
                ${
                  isKeyPressed(item.key)
                    ? 'bg-primary border-primary text-white scale-95 shadow-lg'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-foreground hover:border-primary/50'
                }
              `}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.key.toUpperCase()}
              </span>
              <span className="text-xl">{item[charKey as keyof typeof item]}</span>
            </div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="flex justify-center gap-1 ml-6">
          {layout.row2.map((item) => (
            <div
              key={item.key}
              className={`
                relative w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center
                transition-all duration-150 font-medium
                ${
                  isKeyPressed(item.key)
                    ? 'bg-primary border-primary text-white scale-95 shadow-lg'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-foreground hover:border-primary/50'
                }
              `}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.key.toUpperCase()}
              </span>
              <span className="text-xl">{item[charKey as keyof typeof item]}</span>
            </div>
          ))}
        </div>

        {/* Row 3 */}
        <div className="flex justify-center gap-1 ml-12">
          {layout.row3.map((item) => (
            <div
              key={item.key}
              className={`
                relative w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center
                transition-all duration-150 font-medium
                ${
                  isKeyPressed(item.key)
                    ? 'bg-primary border-primary text-white scale-95 shadow-lg'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-foreground hover:border-primary/50'
                }
              `}
            >
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.key.toUpperCase()}
              </span>
              <span className="text-xl">{item[charKey as keyof typeof item]}</span>
            </div>
          ))}
        </div>

        {/* Spacebar */}
        <div className="flex justify-center mt-2">
          <div
            className={`
              w-64 h-12 rounded-lg border-2 flex items-center justify-center
              transition-all duration-150
              ${
                isKeyPressed(' ')
                  ? 'bg-primary border-primary text-white scale-95 shadow-lg'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-muted-foreground'
              }
            `}
          >
            <span className="text-sm">Space</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        💡 Tip: Nhìn bàn phím và gõ theo, phím sẽ sáng lên khi bạn nhấn
      </div>
    </div>
  );
}