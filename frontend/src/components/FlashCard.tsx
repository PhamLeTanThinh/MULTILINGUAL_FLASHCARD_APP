'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { Flashcard } from '@/lib/api';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';

interface FlashCardProps {
  flashcard: Flashcard;
  language: string;
  startWithTargetLanguage?: boolean;
}

export function FlashCard({ flashcard, language, startWithTargetLanguage = true }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async (text: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const audioUrl = `${apiUrl}/tts/speak?text=${encodeURIComponent(text)}&language=${language}`;
      
      console.log('Playing audio from:', audioUrl);
      
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
      
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        toast.error('Không thể phát âm thanh');
        setIsPlaying(false);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Play audio error:', error);
      toast.error('Lỗi khi phát âm thanh');
      setIsPlaying(false);
    }
  };

  const showTargetFirst = startWithTargetLanguage ? !isFlipped : isFlipped;

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto">
      <motion.div
        className="relative w-full h-96 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front - Ngôn ngữ đích + Speaker */}
        <div
          className={`absolute inset-0 rounded-xl shadow-2xl bg-gradient-to-br from-green-500 to-teal-600 p-8 flex flex-col items-center justify-center ${
            showTargetFirst ? 'visible' : 'invisible'
          }`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: startWithTargetLanguage ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}
        >
          <p className="text-sm text-white/70 mb-2">
            {language === 'ZH' && 'Tiếng Trung'}
            {language === 'JA' && 'Tiếng Nhật'}
            {language === 'KO' && 'Tiếng Hàn'}
            {language === 'EN' && 'Tiếng Anh'}
          </p>
          <h2 className="text-6xl font-bold text-white text-center mb-6">
            {flashcard.target_language}
          </h2>
          
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              playAudio(flashcard.target_language);
            }}
            disabled={isPlaying}
            className="rounded-full w-16 h-16"
          >
            <Volume2 className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
          </Button>
          
          <p className="text-white/60 text-sm mt-6">Click để xem nghĩa</p>
        </div>

        {/* Back - Tiếng Việt + Phiên âm */}
        <div
          className={`absolute inset-0 rounded-xl shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 flex flex-col items-center justify-center ${
            showTargetFirst ? 'invisible' : 'visible'
          }`}
          style={{ 
            transform: startWithTargetLanguage ? 'rotateY(180deg)' : 'rotateY(0deg)',
            backfaceVisibility: 'hidden'
          }}
        >
          <p className="text-sm text-white/70 mb-2">Tiếng Việt</p>
          <h2 className="text-5xl font-bold text-white text-center mb-4">
            {flashcard.vietnamese}
          </h2>
          
          {/* Phiên âm ở mặt sau (cùng với tiếng Việt) */}
          {flashcard.pronunciation && (
            <div className="mt-4 px-6 py-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <p className="text-xs text-white/70 mb-1">Phiên âm</p>
              <p className="text-xl text-white font-medium">
                {flashcard.pronunciation}
              </p>
            </div>
          )}
          
          <p className="text-white/60 text-sm mt-6">Click để lật lại</p>
        </div>
      </motion.div>
    </div>
  );
}