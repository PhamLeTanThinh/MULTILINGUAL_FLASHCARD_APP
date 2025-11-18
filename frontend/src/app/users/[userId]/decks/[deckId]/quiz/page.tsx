'use client';

import { useQuery } from '@tanstack/react-query';
import { deckApi, flashcardApi, quizApi, Flashcard, QuizOption } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Volume2, Loader2, Sparkles } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Confetti } from '@/components/Confetti';
import toast from 'react-hot-toast';

type QuestionType = 'viet-to-target' | 'target-to-viet' | 'pronunciation-to-target' | 'target-to-pronunciation';

interface QuizQuestion {
  flashcard: Flashcard;
  questionType: QuestionType;
  question: string;
  questionLabel: string;
  options: QuizOption[];
  correctAnswer: string;
}

interface QuizAnswer {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
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

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.userId as string);
  const deckId = parseInt(params.deckId as string);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
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
    if (flashcards && flashcards.length >= 4 && deck) {
      generateQuiz(flashcards, deck.language);
    }
  }, [flashcards, deck]);

  const getQuestionTypes = (language: string): QuestionType[] => {
    if (language === 'KO' || language === 'JA') {
      return ['viet-to-target', 'target-to-viet'];
    }
    
    const types: QuestionType[] = ['viet-to-target', 'target-to-viet'];
    
    if (language === 'ZH') {
      types.push('pronunciation-to-target', 'target-to-pronunciation');
    }
    
    return types;
  };

  const generateQuiz = async (cards: Flashcard[], language: string) => {
    setIsGenerating(true);
    setLoadingProgress(0);
    setTotalCards(cards.length);
    setCurrentCardIndex(0);
    
    const questionTypes = getQuestionTypes(language);
    
    try {
      const quizQuestions: QuizQuestion[] = [];

      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        setCurrentCardIndex(i + 1);
        setLoadingProgress(Math.round(((i + 1) / cards.length) * 100));
        
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        let question: string;
        let questionLabel: string;
        let correctAnswer: string;
        let options: QuizOption[] = [];

        try {
          const response = await quizApi.generateOptions(
            deckId, 
            card.target_language, 
            card.vietnamese,
            language, 
            3
          );
          const aiOptions = response.data.options;

          switch (questionType) {
            case 'viet-to-target':
              question = card.vietnamese;
              questionLabel = 'Tiếng Việt';
              correctAnswer = card.target_language;
              options = aiOptions;
              break;

            case 'target-to-viet':
              question = card.target_language;
              questionLabel = getLanguageName(language);
              correctAnswer = card.vietnamese;
              options = aiOptions;
              break;

            case 'pronunciation-to-target':
              question = card.pronunciation;
              questionLabel = 'Phiên âm';
              correctAnswer = card.target_language;
              options = aiOptions;
              break;

            case 'target-to-pronunciation':
              question = card.target_language;
              questionLabel = getLanguageName(language);
              correctAnswer = card.pronunciation;
              options = aiOptions;
              break;
          }

          const correctOption: QuizOption = {
            text: card.target_language,
            pronunciation: card.pronunciation,
            vietnamese: card.vietnamese
          };

          const allOptions = [...options, correctOption]
            .filter((opt, index, self) => 
              opt && opt.text && 
              self.findIndex(o => o.text === opt.text) === index
            )
            .sort(() => Math.random() - 0.5);

          if (allOptions.length >= 2) {
            quizQuestions.push({
              flashcard: card,
              questionType,
              question,
              questionLabel,
              options: allOptions,
              correctAnswer,
            });
          }
        } catch (error) {
          console.error('Failed to generate options for card:', card.id, error);
        }
      }

      setQuestions(quizQuestions.sort(() => Math.random() - 0.5));
    } catch (error) {
      toast.error('Lỗi khi tạo quiz');
      console.error(error);
    } finally {
      setIsGenerating(false);
      setLoadingProgress(0);
      setCurrentCardIndex(0);
    }
  };

  const getLanguageName = (code: string): string => {
    const names: Record<string, string> = {
      'EN': 'Tiếng Anh',
      'ZH': 'Tiếng Trung',
      'JA': 'Tiếng Nhật',
      'KO': 'Tiếng Hàn',
    };
    return names[code] || code;
  };

  const getOptionDisplay = (option: QuizOption, questionType: QuestionType): string => {
    switch (questionType) {
      case 'viet-to-target':
        return option.text;
      case 'target-to-viet':
        return option.vietnamese;
      case 'pronunciation-to-target':
        return option.text;
      case 'target-to-pronunciation':
        return option.pronunciation;
      default:
        return option.text;
    }
  };

  const getOptionDetails = (option: QuizOption, questionType: QuestionType, language: string): string => {
    switch (questionType) {
      case 'viet-to-target':
        return `${option.pronunciation} • ${option.vietnamese}`;
      
      case 'target-to-viet':
        return `${option.text} • ${option.pronunciation}`;
      
      case 'pronunciation-to-target':
        return `${option.vietnamese} • ${option.text}`;
      
      case 'target-to-pronunciation':
        return `${option.vietnamese} • ${option.text}`;
      
      default:
        return `${option.vietnamese} • ${option.pronunciation}`;
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;

    const newAnswer: QuizAnswer = {
      question: currentQuestion,
      userAnswer: answer,
      isCorrect,
    };

    setAnswers([...answers, newAnswer]);

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
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRetry = () => {
    if (flashcards && deck) {
      generateQuiz(flashcards, deck.language);
    }
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setAnswers([]);
    setShowResults(false);
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

  if (isGenerating) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 transition-colors">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Sparkles className="w-20 h-20 text-primary animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Sparkles className="w-6 h-6 text-pink-400 animate-ping" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2 text-foreground bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Đang tạo quiz...
            </h2>
            
            <p className="text-center text-muted-foreground mb-8 text-lg italic">
              "Đợi chờ là hạnh phúc" ✨
            </p>

            <div className="text-center mb-4">
              <span className="text-5xl font-bold text-primary">{loadingProgress}%</span>
              <p className="text-sm text-muted-foreground mt-2">
                Đang xử lý thẻ {currentCardIndex} / {totalCards}
              </p>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner mb-6">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out rounded-full relative overflow-hidden"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" 
                     style={{
                       backgroundSize: '200% 100%',
                       animation: 'shimmer 2s infinite'
                     }}
                />
              </div>
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="inline-block w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <p className="text-xs text-muted-foreground">
                AI đang suy nghĩ cật lực để tạo câu hỏi hay cho bạn...
              </p>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
      </main>
    );
  }

  if (!flashcards || flashcards.length < 4) {
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
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {!flashcards ? 'Deck trống' : 'Không đủ flashcard'}
            </h2>
            <p className="text-muted-foreground mb-6">
              Cần ít nhất 4 flashcard để tạo quiz. {flashcards && `Hiện có ${flashcards.length} thẻ.`}
            </p>
            <Button onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
              Thêm flashcard
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (showResults) {
    const wrongAnswers = answers.filter((a) => !a.isCorrect);
    const correctCount = answers.length - wrongAnswers.length;
    const percentage = Math.round((correctCount / answers.length) * 100);

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
            <h1 className="text-3xl font-bold mb-4 text-foreground">🎉 Hoàn thành!</h1>
            <div className="text-6xl font-bold mb-4">
              <span className={percentage >= 80 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}>
                {percentage}%
              </span>
            </div>
            <p className="text-xl text-muted-foreground mb-2">
              {correctCount}/{answers.length} câu đúng
            </p>
            {percentage >= 80 && <p className="text-green-600 dark:text-green-400 font-medium">Xuất sắc! 🌟</p>}
            {percentage >= 50 && percentage < 80 && <p className="text-yellow-600 dark:text-yellow-400 font-medium">Khá tốt! 👍</p>}
            {percentage < 50 && <p className="text-red-600 dark:text-red-400 font-medium">Cần cố gắng thêm! 💪</p>}
          </div>

          {wrongAnswers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
              <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-500" />
                Các câu sai ({wrongAnswers.length})
              </h2>
              <div className="space-y-4">
                {wrongAnswers.map((answer, index) => (
                  <div
                    key={index}
                    className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/20"
                  >
                    <div className="mb-3">
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {answer.question.questionLabel}
                      </span>
                      <p className="text-xl font-bold text-foreground flex items-center gap-2">
                        {answer.question.question}
                        {answer.question.questionType === 'target-to-viet' && deck && (
                          <button
                            onClick={() => playAudio(answer.question.question, deck.language)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </p>
                    </div>

                    <div className="space-y-2 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Bạn chọn:</span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          {answer.userAnswer}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">Đáp án đúng:</span>
                        <span className="text-green-600 dark:text-green-400 font-medium text-lg">
                          {answer.question.correctAnswer}
                        </span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t text-sm space-y-1">
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">Tiếng Việt:</span>
                          <span className="text-foreground font-medium">{answer.question.flashcard.vietnamese}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">{getLanguageName(deck?.language || '')}:</span>
                          <span className="text-foreground font-medium text-lg">{answer.question.flashcard.target_language}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-muted-foreground">Phiên âm:</span>
                          <span className="text-foreground">{answer.question.flashcard.pronunciation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button onClick={handleRetry} className="flex-1" disabled={isGenerating}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Làm lại quiz
            </Button>
            <Button variant="outline" onClick={() => router.push(`/users/${userId}/decks/${deckId}`)} className="flex-1">
              Quay về deck
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8 transition-colors">
      {/* Confetti Effect */}
      <Confetti active={showConfetti} />

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.push(`/users/${userId}/decks/${deckId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">{deck?.name} - Quiz</h1>
            <span className="text-lg font-semibold text-foreground">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6 transition-colors">
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground mb-2">{currentQuestion.questionLabel}:</p>
              <h2 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
                {currentQuestion.question}
                {currentQuestion.questionType === 'target-to-viet' && deck && (
                  <button
                    onClick={() => playAudio(currentQuestion.question, deck.language)}
                    disabled={isPlaying}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                  </button>
                )}
              </h2>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Chọn đáp án đúng:
              </p>
              {currentQuestion.options.map((option, index) => {
                const displayText = getOptionDisplay(option, currentQuestion.questionType);
                const isSelected = selectedAnswer === displayText;
                const isCorrect = displayText === currentQuestion.correctAnswer;
                const showResult = isAnswered;

                let buttonClass = 'w-full p-4 rounded-lg border-2 transition-all text-left ';
                
                if (showResult) {
                  if (isSelected && isCorrect) {
                    buttonClass += 'border-green-500 bg-green-100 dark:bg-green-900/30';
                  } else if (isSelected && !isCorrect) {
                    buttonClass += 'border-red-500 bg-red-100 dark:bg-red-900/30';
                  } else if (isCorrect) {
                    buttonClass += 'border-green-500 bg-green-100 dark:bg-green-900/30';
                  } else {
                    buttonClass += 'border-border bg-background opacity-50';
                  }
                } else {
                  buttonClass += isSelected
                    ? 'border-primary bg-primary/20'
                    : 'border-border hover:border-primary/50 bg-background';
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(displayText)}
                    disabled={isAnswered}
                    className={buttonClass}
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-block w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-center leading-8 text-sm font-bold flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1">
                        <div className="text-xl font-medium text-foreground">
                          {displayText}
                        </div>
                        {showResult && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {getOptionDetails(option, currentQuestion.questionType, deck?.language || '')}
                          </div>
                        )}
                      </div>
                      {showResult && isSelected && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                      {showResult && !isSelected && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button
          onClick={handleNext}
          size="lg"
          className="w-full"
          disabled={!isAnswered}
        >
          {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
        </Button>

        {/* Wrong Message - Show below button */}
        {showWrongMessage && (
          <div className="mt-4 flex justify-center animate-bounce">
            <div className="bg-red-500 text-white px-8 py-4 rounded-2xl shadow-2xl transform transition-all">
              <p className="text-2xl font-bold text-center">{wrongMessage}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}