'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/Button';

export function ThemeToggle() {
  // Add try-catch để handle khi dùng ngoài provider
  try {
    const { theme, toggleTheme } = useTheme();

    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full"
        title={theme === 'light' ? 'Chuyển sang dark mode' : 'Chuyển sang light mode'}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </Button>
    );
  } catch (error) {
    // Fallback nếu không có ThemeProvider
    return null;
  }
}