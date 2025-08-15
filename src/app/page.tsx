'use client';

import { useTheme } from './contexts/ThemeContext';
import Header from './components/Header';

export default function HomePage() {
  const { theme } = useTheme();

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen font-sans overflow-hidden`}>
      <div className="relative z-10">
        <Header />
      </div>
      
      {/* Background pattern for light theme */}
      {theme === 'light' && (
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div>
        </div>
      )}

      <main className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="text-center">
          <h2 className={`text-5xl md:text-6xl font-serif font-light leading-tight tracking-wide ${textColor}`}>
            Where moments become timeless treasures.
          </h2>
        </div>
      </main>
    </div>
  );
}
