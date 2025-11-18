'use client';

import { useQuery } from '@tanstack/react-query';
import { deckApi, flashcardApi, Flashcard, ExampleSentence, DialogueLine } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, ArrowLeftRight, Sparkles, BookOpen, MessageCircle, Loader2, Volume2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FlashCard } from '@/components/FlashCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import toast from 'react-hot-toast';

export default function StudyModePage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);
  const deckId = parseInt(params.deckId as string);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [startWithTargetLanguage, setStartWithTargetLanguage] = useState(true);
  
  // AI Examples states
  const [showExamples, setShowExamples] = useState(false);
  const [exampleType, setExampleType] = useState<'sentence' | 'dialogue'>('sentence');
  const [examples, setExamples] = useState<ExampleSentence[] | DialogueLine[] | null>(null);
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: deck } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => deckApi.getById(deckId).then((res) => res.data),
  });

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => flashcardApi.getByDeck(deckId).then((res) => res.data),
  });

  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      setShuffledCards(flashcards);
    }
  }, [flashcards]);

  const handleShuffle = () => {
    if (!flashcards) return;
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsShuffled(true);
    setCardKey(prev => prev + 1);
    setShowExamples(false);
    setExamples(null);
  };

  const handleReset = () => {
    if (!flashcards) return;
    setShuffledCards(flashcards);
    setCurrentIndex(0);
    setIsShuffled(false);
    setCardKey(prev => prev + 1);
    setShowExamples(false);
    setExamples(null);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setCardKey(prev => prev + 1);
    setShowExamples(false);
    setExamples(null);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(shuffledCards.length - 1, prev + 1));
    setCardKey(prev => prev + 1);
    setShowExamples(false);
    setExamples(null);
  };

  const toggleCardSide = () => {
    setStartWithTargetLanguage(prev => !prev);
    setCardKey(prev => prev + 1);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shuffledCards.length]);

  // AI Examples functions
  const handleGenerateExamples = async (type: 'sentence' | 'dialogue') => {
    if (!shuffledCards) return;
    
    const currentCard = shuffledCards[currentIndex];
    setExampleType(type);
    setLoadingExamples(true);
    
    try {
      const response = await flashcardApi.generateExample(currentCard.id, type);
      setExamples(response.data.examples);
      setShowExamples(true);
      toast.success('Đã tạo ví dụ! ✨');
    } catch (error) {
      toast.error('Lỗi khi tạo ví dụ');
      console.error(error);
    } finally {
      setLoadingExamples(false);
    }
  };

  const playAudio = async (text: string, language: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const audioUrl = `${apiUrl}/tts/speak?text=${encodeURIComponent(text)}&language=${language}`;
      
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = () => {
        toast.error('Không thể phát âm thanh');
        setIsPlaying(false);
      };
      
      await audio.play();
    } catch (error) {
      toast.error('Lỗi khi phát âm thanh');
      setIsPlaying(false);
    }
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Deck trống</h2>
            <p className="text-muted-foreground mb-6">
              Hãy thêm flashcard trước khi bắt đầu học
            </p>
            <Button onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              Thêm flashcard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex justify-center gap-2 mb-6">
          <Button 
            variant={startWithTargetLanguage ? "default" : "outline"} 
            onClick={toggleCardSide}
          >
            <ArrowLeftRight className="w-4 h-4 mr-2" />
            {startWithTargetLanguage ? 'Ngôn ngữ đích trước' : 'Tiếng Việt trước'}
          </Button>
          <Button variant="outline" onClick={handleShuffle}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Xáo trộn
          </Button>
          {isShuffled && (
            <Button variant="outline" onClick={handleReset}>
              Khôi phục
            </Button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">{deck?.name}</h1>
            <span className="text-lg font-semibold text-foreground">
              {currentIndex + 1} / {shuffledCards.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* FLASHCARD VỚI NÚT ĐIỀU HƯỚNG - GLASS MORPHISM */}
        <div className="relative mb-8">
          {/* Flashcard */}
          <div className="px-20">
            {currentCard && deck && (
              <FlashCard 
                key={cardKey} 
                flashcard={currentCard} 
                language={deck.language}
                startWithTargetLanguage={startWithTargetLanguage}
              />
            )}
          </div>

          {/* Nút Trước - Glass Morphism */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              w-14 h-14 rounded-full
              backdrop-blur-md bg-white/80 dark:bg-gray-800/80
              border border-white/20 dark:border-gray-700/20
              shadow-xl
              flex items-center justify-center
              transition-all duration-300
              ${currentIndex === 0 
                ? 'opacity-20 cursor-not-allowed' 
                : 'hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-800/90 active:scale-95 hover:shadow-2xl'
              }
            `}
          >
            <ChevronLeft className={`w-7 h-7 ${currentIndex === 0 ? 'text-gray-400' : 'text-primary'}`} />
          </button>

          {/* Nút Tiếp - Glass Morphism */}
          <button
            onClick={handleNext}
            disabled={currentIndex === shuffledCards.length - 1}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              w-14 h-14 rounded-full
              backdrop-blur-md bg-white/80 dark:bg-gray-800/80
              border border-white/20 dark:border-gray-700/20
              shadow-xl
              flex items-center justify-center
              transition-all duration-300
              ${currentIndex === shuffledCards.length - 1
                ? 'opacity-20 cursor-not-allowed'
                : 'hover:scale-110 hover:bg-white/90 dark:hover:bg-gray-800/90 active:scale-95 hover:shadow-2xl'
              }
            `}
          >
            <ChevronRight className={`w-7 h-7 ${currentIndex === shuffledCards.length - 1 ? 'text-gray-400' : 'text-primary'}`} />
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-center text-sm text-muted-foreground mb-6">
          Sử dụng phím ← → để điều hướng
        </div>

        {/* AI EXAMPLES SECTION */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8 transition-colors">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Tạo ví dụ bằng AI</h3>
          </div>

          <div className="flex gap-3 justify-center mb-4">
            <Button
              variant="outline"
              onClick={() => handleGenerateExamples('sentence')}
              disabled={loadingExamples}
            >
              {loadingExamples && exampleType === 'sentence' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4 mr-2" />
              )}
              Tạo câu ví dụ
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGenerateExamples('dialogue')}
              disabled={loadingExamples}
            >
              {loadingExamples && exampleType === 'dialogue' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 mr-2" />
              )}
              Tạo hội thoại
            </Button>
          </div>

          {showExamples && examples && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-foreground">
                  {exampleType === 'sentence' ? 'Câu ví dụ từ AI' : 'Hội thoại từ AI'}
                </h4>
              </div>

              <div className="space-y-4">
                {exampleType === 'sentence' && (examples as ExampleSentence[]).map((example, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded">
                        {example.context}
                      </span>
                      <button
                        onClick={() => playAudio(example.target, deck?.language || 'EN')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-foreground mb-2">{example.target}</p>
                    <p className="text-sm text-muted-foreground mb-1">{example.pronunciation}</p>
                    <p className="text-sm text-muted-foreground italic">{example.vietnamese}</p>
                  </div>
                ))}

                {exampleType === 'dialogue' && (examples as DialogueLine[]).map((line, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {line.speaker}
                      </span>
                      <button
                        onClick={() => playAudio(line.target, deck?.language || 'EN')}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xl font-bold text-foreground mb-2">{line.target}</p>
                    <p className="text-sm text-muted-foreground mb-1">{line.pronunciation}</p>
                    <p className="text-sm text-muted-foreground italic">{line.vietnamese}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {currentIndex === shuffledCards.length - 1 && (
          <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center transition-colors">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-400 mb-2">
              🎉 Hoàn thành!
            </h3>
            <p className="text-green-600 dark:text-green-300 mb-4">
              Bạn đã xem hết {shuffledCards.length} thẻ
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Học lại
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}
              >
                Quay về deck
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}