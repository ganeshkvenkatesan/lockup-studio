'use client';

import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

export default function AboutPage() {
  const { theme } = useTheme();
  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const pColor = theme === 'light' ? 'text-gray-700' : 'text-gray-300';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen font-sans`}>
      <Header />

      <main className="pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto my-16">
            <h2 className="text-4xl font-serif font-light mb-8">About Lockup Studio</h2>
            <p className={`text-lg ${pColor} leading-relaxed mb-4`}>
              Lockup Studio is a passionate team of photographers dedicated to capturing the beauty and emotion of your most precious moments. We believe that every event, big or small, tells a unique story, and our goal is to tell that story through our lenses.
            </p>
            <p className={`text-lg ${pColor} leading-relaxed`}>
              With a focus on a classic and timeless style, we strive to create images that you will cherish for a lifetime. From weddings and engagements to family portraits and special events, we are here to document your memories with artistry and care.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

