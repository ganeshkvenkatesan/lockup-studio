'use client';

import { useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { theme } = useTheme();
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen font-sans overflow-hidden`}>
      <Header />

      <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center px-6">
          <h2 className={`text-4xl md:text-5xl font-serif font-light leading-tight tracking-wide mb-8 ${textColor}`}>
            Where moments become timeless treasures.
          </h2>

          <div className="flex items-center justify-center">
            <Link href="/gallery" className="inline-block px-6 py-3 rounded-md bg-black text-white hover:opacity-90">Explore gallery</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
