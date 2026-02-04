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
  'Не',
  'Ама наистина ли?',
  'Помисли пак! 💔',
  'Ще плача...',
  'Последен шанс!',
  'Моля те! 🥺',
  'Не може да бъде!',
  'Ще ми е много тъжно...',
  'Помисли още малко!',
  'Не ме отказвай! 💔',
  'Ще се разстроя много...',
  'Моля, помисли отново!',
  'Недей да отказваш!',
  'Ще ми счупиш сърцето...',
  'Последна молба! 🙏',
];

const HEART_EMOJIS = ['❤️', '💕', '💖', '💗', '💓', '💝'];

// Secret key for token validation (must match admin page)
const SECRET_KEY = 'valentine-secret-2024';

// Simple hash function to generate a token (must match admin page)
const generateToken = (name: string): string => {
  let hash = 0;
  const str = name + SECRET_KEY;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

// Helper function to check if URL has name parameter
const hasNameParameter = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return !!(params.get('name') || params.get('Name') || params.get('NAME') || 
    Array.from(params.entries()).some(([key]) => key.toLowerCase() === 'name'));
};

// Helper function to get and validate name from URL
// Returns null if no name, throws error if invalid token
const getNameFromURL = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  
  // Try different case variations: 'name', 'Name', 'NAME'
  let nameParam = params.get('name') || params.get('Name') || params.get('NAME');
  
  // If not found, iterate through all params to find case-insensitive match
  if (!nameParam) {
    for (const [key, value] of params.entries()) {
      if (key.toLowerCase() === 'name') {
        nameParam = value;
        break;
      }
    }
  }
  
  // If no name parameter, return null (valid - will use default)
  if (!nameParam) {
    return null;
  }
  
  // Name parameter exists - must have valid token
  const token = params.get('token') || params.get('Token') || params.get('TOKEN');
  
  // If no token found, try case-insensitive search
  let foundToken = token;
  if (!foundToken) {
    for (const [key, value] of params.entries()) {
      if (key.toLowerCase() === 'token') {
        foundToken = value;
        break;
      }
    }
  }
  
  // Validate token matches the name
  const expectedToken = generateToken(nameParam);
  if (!foundToken || foundToken !== expectedToken) {
    // Invalid or missing token - should show 404
    throw new Error('INVALID_TOKEN');
  }
  
  return nameParam;
};

export default function Home() {
  const [name, setName] = useState<string>(() => {
    // Try to read name immediately on client-side
    if (typeof window !== 'undefined') {
      try {
        const urlName = getNameFromURL();
        return urlName || '';
      } catch {
        // Invalid token - will show 404
        return '';
      }
    }
    return '';
  });
  const [show404, setShow404] = useState<boolean>(() => {
    // Check if we should show 404 on initial load
    if (typeof window !== 'undefined') {
      const hasName = hasNameParameter();
      if (!hasName) {
        return true; // No name parameter - show 404
      }
      // Has name parameter - check if valid
      try {
        getNameFromURL();
        return false; // Valid token
      } catch {
        return true; // Invalid token - show 404
      }
    }
    return true; // Show 404 by default until we check
  });
  const [isLoadingName, setIsLoadingName] = useState<boolean>(true);
  const [state, setState] = useState<AppState>({
    accepted: false,
    noButtonClicks: 0,
    yesButtonScale: 1,
  });
  const [hearts, setHearts] = useState<Heart[]>([]);
  const heartIdRef = useRef(0);

  useEffect(() => {
    // Check for 404 condition and validate name
    if (typeof window !== 'undefined') {
      const hasName = hasNameParameter();
      
      if (hasName) {
        try {
          const urlName = getNameFromURL();
          if (urlName) {
            setName(urlName);
          }
          setShow404(false);
        } catch {
          // Invalid token - show 404
          setShow404(true);
          setIsLoadingName(false);
          return;
        }
      } else {
        // No name parameter - show 404 (block empty index page)
        setShow404(true);
        setIsLoadingName(false);
        return;
      }
    }
    
    // Brief loading animation for visual feedback
    const timer = setTimeout(() => {
      setIsLoadingName(false);
    }, 400);
    return () => clearTimeout(timer);

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

  // Show 404 page if invalid token
  if (show404) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#fff5f5] px-4">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="text-8xl">💔</div>
          <h1 className="text-6xl font-bold text-[#b91c1c]">404</h1>
          <h2 className="text-3xl font-bold text-[#b91c1c]">Страницата не е намерена</h2>
          <p className="text-lg text-[#b91c1c] opacity-80 max-w-md">
            Извиняваме се, но тази страница не съществува или линкът е невалиден.
          </p>
          <a
            href="/"
            className="mt-4 px-6 py-3 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold rounded-lg transition-all duration-200"
          >
            Назад към главната страница
          </a>
        </div>
      </div>
    );
  }

  if (state.accepted) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#fff5f5] px-4">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <div className="text-8xl animate-bounce">❤️</div>
          <div className="w-64 h-64 bg-contain bg-center bg-no-repeat">
            <img
              src="https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif"
              alt="Happy GIF"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-4xl font-bold text-[#b91c1c]">Йей! Знаех си! ❤️</h2>
          <p className="text-3xl font-bold text-[#b91c1c]">Обичам те!</p>
        </div>
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
        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[#b91c1c] leading-tight transition-opacity duration-300 ${isLoadingName ? 'opacity-0' : 'opacity-100'}`}>
          {isLoadingName ? (
            <span className="inline-flex items-center gap-2 animate-pulse">
              <span className="opacity-70">Зареждане...</span>
            </span>
          ) : (
            <>
              {name}, ще бъдеш ли моята Валентинка? 🌹
            </>
          )}
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
            Да
          </button>
          
          <button
            onClick={handleNoClick}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all duration-200 text-lg sm:text-xl flex-1 sm:flex-initial"
          >
            {getNoButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
