'use client';

import { useQuery } from '@tanstack/react-query';
import { deckApi, flashcardApi, Flashcard } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Keyboard, Eye, EyeOff } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { Confetti } from '@/components/Confetti';
import toast from 'react-hot-toast';

interface TypingResult {
  flashcard: Flashcard;
  userInput: string;
  isCorrect: boolean;
  timeSpent: number;
}

// Array of funny wrong answer messages
const WRONG_MESSAGES = [
  "Ngu zạy 😂",
  "Ối giồi ơi! 😅",
  "Sai bét nhè! 🤪",
  "Học lại đi bạn êi! 📚",
  "Trật rồi bạn ơi! 😆",
  "Gần đúng... nhưng vẫn sai! 😝",
  "Ui chà chà! 🙈",
  "Hơi ngu tí! 😂",
  "Sai mất rồi kìa! 🤦",
  "Ối dồi ôi! 😬",
  "Trượt rồi bạn êi! 🎿",
  "Học bài đâu hả bạn? 🤔",
  "Ui giời! 😱",
  "Nhầm to rồi đó! 🎯",
  "Ai dạy bạn vậy? 😂",
  "Chưa được đâu! 👎",
  "Suy nghĩ lại đi! 🤯",
  "Bó tay với bạn! 🙌",
  "Cố lên bạn êi! 💪",
  "Học thêm đi nha! 🎓",
  "Ôi trời ơi! 🤭",
  "Sai quá sai! 😵",
  "Nhầm lẫn rồi bạn! 🙃",
  "Chưa phải đâu! 😅",
  "Thử lại coi! 🔄",
  "Ối zời ơi! 😳",
  "Học bài kỹ hơn nhé! 📖",
  "Sai lầm này! 🚫",
  "Chưa đúng nè! ❌",
  "Nhầm to rồi cậu! 😆",
  "Học hành chưa chăm! 🤓",
  "Ê trật mất rồi! 🎪",
  "Xem lại đi bạn! 👀",
  "Bạn sai rồi đó! 🛑",
  "Gỗ quá bạn êi! 🪵",
  "Ngu như bò! 🐄",
  "Não cá vàng hả? 🐟",
  "IQ âm rồi bạn êi! 📉",
  "Cần đi học thêm! 🏫",
  "Xấu hổ quá! 🙈"
];

export default function TypingPracticePage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);
  const deckId = parseInt(params.deckId as string);
  const inputRef = useRef<HTMLInputElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [results, setResults] = useState<TypingResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showAnswer, setShowAnswer] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWrongMessage, setShowWrongMessage] = useState(false);
  const [wrongMessage, setWrongMessage] = useState('');

  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => deckApi.getById(deckId).then((res) => res.data),
  });

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => flashcardApi.getByDeck(deckId).then((res) => res.data),
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPressedKey(e.key);
      setTimeout(() => setPressedKey(null), 150);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!flashcards || !userInput.trim()) {
      toast.error('Vui lòng nhập câu trả lời');
      return;
    }

    const currentCard = flashcards[currentIndex];
    const isCorrect = userInput.trim() === currentCard.target_language.trim();
    const timeSpent = Date.now() - startTime;

    const result: TypingResult = {
      flashcard: currentCard,
      userInput: userInput.trim(),
      isCorrect,
      timeSpent,
    };

    setResults([...results, result]);

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } else {
      // Pick random wrong message
      const randomMessage = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
      setWrongMessage(randomMessage);
      setShowWrongMessage(true);
      setTimeout(() => setShowWrongMessage(false), 2000);
    }

    // Move to next card or show results
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setUserInput('');
        setShowAnswer(false);
        setStartTime(Date.now());
      }, 1500);
    } else {
      setTimeout(() => {
        setShowResults(true);
      }, 1500);
    }
  };

  const handleSkip = () => {
    if (!flashcards) return;

    const currentCard = flashcards[currentIndex];
    const result: TypingResult = {
      flashcard: currentCard,
      userInput: '',
      isCorrect: false,
      timeSpent: Date.now() - startTime,
    };

    setResults([...results, result]);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserInput('');
      setShowAnswer(false);
      setStartTime(Date.now());
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setUserInput('');
    setResults([]);
    setShowResults(false);
    setShowAnswer(false);
    setStartTime(Date.now());
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors">
            <Keyboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4 text-foreground">Deck trống</h2>
            <p className="text-muted-foreground mb-6">Thêm flashcard để bắt đầu luyện gõ</p>
            <Button onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              Thêm flashcard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (deck?.language !== 'KO' && deck?.language !== 'JA') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors">
            <Keyboard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Chức năng chỉ dành cho tiếng Hàn và tiếng Nhật
            </h2>
            <p className="text-muted-foreground mb-6">
              Deck này sử dụng ngôn ngữ {deck?.language}, không cần luyện gõ phím
            </p>
            <Button onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              Quay về deck
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (showResults) {
    const correctCount = results.filter((r) => r.isCorrect).length;
    const percentage = Math.round((correctCount / results.length) * 100);
    const avgTime = Math.round(
      results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length / 1000
    );
    const wrongResults = results.filter((r) => !r.isCorrect);

    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button variant="ghost" onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại deck
            </Button>
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 text-center transition-colors">
            <h1 className="text-3xl font-bold mb-4 text-foreground">⌨️ Hoàn thành!</h1>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-4xl font-bold text-primary">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Độ chính xác</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-500">{correctCount}</div>
                <div className="text-sm text-muted-foreground">Đúng</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-500">{avgTime}s</div>
                <div className="text-sm text-muted-foreground">Trung bình/từ</div>
              </div>
            </div>
            {percentage >= 80 && <p className="text-green-600 dark:text-green-400 font-medium">Tuyệt vời! ⌨️🌟</p>}
            {percentage >= 50 && percentage < 80 && <p className="text-yellow-600 dark:text-yellow-400 font-medium">Khá tốt! 👍</p>}
            {percentage < 50 && <p className="text-red-600 dark:text-red-400 font-medium">Luyện thêm nhé! 💪</p>}
          </div>

          {wrongResults.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
              <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                Cần luyện thêm ({wrongResults.length})
              </h2>
              <div className="space-y-3">
                {wrongResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">Tiếng Việt:</span>
                        <p className="text-lg font-semibold text-foreground">
                          {result.flashcard.vietnamese}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Đáp án đúng:</span>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {result.flashcard.target_language}
                        </p>
                      </div>
                    </div>
                    {result.userInput && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Bạn đã gõ:</span>
                        <p className="text-lg text-red-600 dark:text-red-400">
                          {result.userInput}
                        </p>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">
                      Phiên âm: {result.flashcard.pronunciation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={handleRetry} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Luyện lại
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}
              className="flex-1"
            >
              Quay về deck
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      {/* Confetti Effect */}
      <Confetti active={showConfetti} />

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">
              ⌨️ Luyện gõ - {deck?.name}
            </h1>
            <span className="text-lg font-semibold text-foreground">
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors">
              <div className="text-center mb-6">
                <p className="text-sm text-muted-foreground mb-2">Gõ từ này:</p>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  {currentCard.vietnamese}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Phiên âm: {currentCard.pronunciation}
                </p>
              </div>

              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án'}
                </Button>
              </div>

              {showAnswer && (
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Đáp án:</p>
                  <p className="text-3xl font-bold text-primary">
                    {currentCard.target_language}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">
                    Nhập câu trả lời:
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Gõ ở đây..."
                    className="w-full px-4 py-3 text-2xl border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-center font-bold"
                    autoComplete="off"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={!userInput.trim()}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Kiểm tra
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSkip}>
                    Bỏ qua
                  </Button>
                </div>
              </form>

              {/* Wrong Message - Show below form */}
              {showWrongMessage && (
                <div className="mt-4 flex justify-center animate-bounce">
                  <div className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl transform transition-all">
                    <p className="text-2xl font-bold text-center">{wrongMessage}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 transition-colors">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowKeyboard(!showKeyboard)}
              >
                <Keyboard className="w-4 h-4 mr-2" />
                {showKeyboard ? 'Ẩn bàn phím' : 'Hiện bàn phím'}
              </Button>
            </div>
          </div>

          {showKeyboard && (
            <div className="lg:sticky lg:top-8 h-fit">
              <VirtualKeyboard
                language={deck?.language as 'KO' | 'JA'}
                pressedKey={pressedKey}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}