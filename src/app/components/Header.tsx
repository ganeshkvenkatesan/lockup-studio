'use client';

import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggleButton from './ThemeToggleButton';

export default function Header() {
  const { theme } = useTheme();
  
  const aboutColor = theme === 'light' ? 'text-gray-600' : 'text-gray-400';
  const aboutHoverColor = theme === 'light' ? 'hover:text-gray-900' : 'hover:text-white';

  return (
    <header className="fixed top-0 left-0 right-0 bg-transparent z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight cursor-pointer">
              <span className="font-serif">Lockup</span>{' '}
              <span className="text-lg font-light">Studio</span>
            </h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link href="/about" className={`${aboutColor} ${aboutHoverColor} transition-colors`}>
              About
            </Link>
            <ThemeToggleButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
