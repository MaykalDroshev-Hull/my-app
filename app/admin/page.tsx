'use client';

import { useState } from 'react';

// Secret key for token generation (in production, this should be in an env variable)
const SECRET_KEY = 'valentine-secret-2024';

// Simple hash function to generate a token
const generateToken = (name: string): string => {
  // Create a simple hash from name + secret
  let hash = 0;
  const str = name + SECRET_KEY;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to positive hex string
  return Math.abs(hash).toString(16);
};

export default function AdminPage() {
  const [name, setName] = useState<string>('');
  const [generatedUrl, setGeneratedUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateUrl = () => {
    if (!name.trim()) {
      alert('Моля, въведете име!');
      return;
    }

    // Get the current origin (localhost:3000 or production URL)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    // Encode the name parameter
    const encodedName = encodeURIComponent(name.trim());
    // Generate validation token
    const token = generateToken(name.trim());
    // Create URL with both name and token
    const url = `${origin}/?name=${encodedName}&token=${token}`;
    setGeneratedUrl(url);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!generatedUrl) return;
    
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = generatedUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert('Неуспешно копиране. Моля, копирайте ръчно.');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#fff5f5] px-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#b91c1c] mb-6 text-center">
          Админ Панел - Генериране на URL
        </h1>
        
        <div className="space-y-6">
          <div>
            <label 
              htmlFor="name-input" 
              className="block text-lg font-semibold text-[#b91c1c] mb-2"
            >
              Въведете име (на английски или български):
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  generateUrl();
                }
              }}
              placeholder="Например: Христо, Maria, Иван..."
              className="w-full px-4 py-3 border-2 border-[#b91c1c] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#b91c1c] text-lg"
            />
          </div>

          <button
            onClick={generateUrl}
            className="w-full px-6 py-3 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold rounded-lg transition-all duration-200 text-lg"
          >
            Генерирай URL
          </button>

          {generatedUrl && (
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-semibold text-[#b91c1c] mb-2">
                  Генериран URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedUrl}
                    readOnly
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-sm break-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-6 py-3 font-bold rounded-lg transition-all duration-200 ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-[#b91c1c] hover:bg-[#991b1b] text-white'
                    }`}
                  >
                    {copied ? '✓ Копирано!' : 'Копирай'}
                  </button>
                </div>
              </div>

              <div className="bg-pink-50 border-2 border-pink-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Инструкции:</strong>
                </p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Копирайте URL адреса по-горе</li>
                  <li>Споделете го с желаното лице</li>
                  <li>Когато отворят линка, тяхното име ще се покаже автоматично</li>
                </ul>
              </div>

              <div className="text-center">
                <a
                  href={generatedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all duration-200"
                >
                  Отвори в нов прозорец
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href="/"
            className="text-[#b91c1c] hover:text-[#991b1b] font-semibold transition-colors"
          >
            ← Назад към главната страница
          </a>
        </div>
      </div>
    </div>
  );
}
