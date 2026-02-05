'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

interface AppState {
  accepted: boolean;
  noButtonClicks: number;
  yesButtonScale: number;
}

interface Heart {
  id: number;
  left: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  emoji: string;
}

const NO_BUTTON_TEXTS = [
  'No',
  'Are you sure?',
  'Think again! 💔',
  'I\'ll cry...',
  'Last chance!',
  'Please! 🥺',
  'It can\'t be!',
  'I\'ll be very sad...',
  'Think a bit more!',
  'Don\'t reject me! 💔',
  'I\'ll be very upset...',
  'Please, think again!',
  'Don\'t say no!',
  'You\'ll break my heart...',
  'Last request! 🙏',
];

const HEART_EMOJIS = ['❤️', '💕', '💖', '💗', '💓', '💝'];

export default function BaileyPage() {
  const name = 'Bailey';
  const [state, setState] = useState<AppState>({
    accepted: false,
    noButtonClicks: 0,
    yesButtonScale: 1,
  });
  const [hearts, setHearts] = useState<Heart[]>([]);
  const heartIdRef = useRef(0);

  useEffect(() => {
    // Create floating hearts
    const createHeart = () => {
      const newHeart: Heart = {
        id: heartIdRef.current++,
        left: Math.random() * 100,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 5,
        drift: (Math.random() - 0.5) * 100,
        rotation: Math.random() * 360,
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      };
      setHearts((prev) => [...prev, newHeart]);

      // Remove heart after animation
      setTimeout(() => {
        setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
      }, (newHeart.duration + newHeart.delay) * 1000);
    };

    // Create initial hearts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => createHeart(), i * 2000);
    }

    // Continue creating hearts periodically
    const interval = setInterval(() => {
      createHeart();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleYesClick = useCallback(() => {
    setState((prev) => ({ ...prev, accepted: true }));
    
    // Trigger confetti explosion
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  const handleNoClick = useCallback(() => {
    setState((prev) => ({
      ...prev,
      noButtonClicks: prev.noButtonClicks + 1,
      yesButtonScale: prev.yesButtonScale + 0.2,
    }));
  }, []);

  const getNoButtonText = () => {
    const index = Math.min(state.noButtonClicks, NO_BUTTON_TEXTS.length - 1);
    return NO_BUTTON_TEXTS[index];
  };

  if (state.accepted) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#fff5f5] px-4 relative">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="text-8xl animate-bounce">❤️</div>
          <div className="w-64 h-64 bg-contain bg-center bg-no-repeat">
            <img
              src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmM5bmxydzVmcjA4dmt1OWdqbjRsZW5jYXRiOHVnbzhmdm9tcGwzdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Bv76prPEWdr4nxovaK/giphy.gif"
              alt="Mickey and Minnie Mouse Kissing"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback to another Mickey and Minnie GIF
                const target = e.target as HTMLImageElement;
                if (target.src.includes('xT9IgG50Fb7Mi0prBC')) {
                  target.src = 'https://media.giphy.com/media/3o7aD2sa0sYxJYq1xu/giphy.gif';
                } else if (target.src.includes('3o7aD2sa0sYxJYq1xu')) {
                  target.src = 'https://media.giphy.com/media/l0MYC0LajVPo6DRi0/giphy.gif';
                } else {
                  // Final fallback to a happy celebration GIF
                  target.src = 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif';
                }
              }}
            />
          </div>
          <h2 className="text-4xl font-bold text-[#b91c1c]">Yes! I knew it! ❤️</h2>
        </div>
        <footer className="absolute bottom-4 left-0 right-0 text-center text-[#b91c1c] text-sm">
          <span>❤️ </span>
          <a 
            href="https://hmwspro.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline"
            title="HM WSPro"
          >
            HM WSPro
          </a>
          <span> ❤️</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#fff5f5] px-4 relative overflow-hidden">
      {/* Floating Hearts Background */}
      <div className="floating-hearts">
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="heart"
            style={{
              left: `${heart.left}%`,
              animationDuration: `${heart.duration}s`,
              animationDelay: `${heart.delay}s`,
              '--drift': `${heart.drift}px`,
              '--rotation': `${heart.rotation}deg`,
            } as React.CSSProperties}
          >
            {heart.emoji}
          </div>
        ))}
      </div>
      
      <div className="flex flex-col items-center justify-center gap-8 text-center z-10 max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#b91c1c] leading-tight">
          {name}, will you be my Valentine? 🌹
        </h1>
        
        <div className="w-48 h-48 sm:w-64 sm:h-64 bg-contain bg-center bg-no-repeat">
          <img
            src="https://media.giphy.com/media/3o7aCTPPm4OHfRLSH6/giphy.gif"
            alt="Valentine GIF"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-row gap-4 w-full items-center justify-center">
          <button
            onClick={handleYesClick}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-200 text-lg sm:text-xl whitespace-nowrap flex-1 sm:flex-initial"
            style={{
              transform: `scale(${state.yesButtonScale})`,
              transformOrigin: 'center',
              maxWidth: '45%',
            }}
          >
            Yes
          </button>
          
          <button
            onClick={handleNoClick}
            className={`px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 text-lg sm:text-xl flex-1 sm:flex-initial ${state.yesButtonScale > 1 ? 'text-right' : 'text-center'}`}
          >
            {getNoButtonText()}
          </button>
        </div>
      </div>
      
      <footer className="absolute bottom-4 left-0 right-0 text-center text-[#b91c1c] text-sm z-10">
        <span>❤️ </span>
        <a 
          href="https://hmwspro.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:underline"
          title="HM WSPro"
        >
          HM WSPro
        </a>
        <span> ❤️</span>
      </footer>
    </div>
  );
}
