'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Header from '../../components/Header';

type BlobItem = {
  pathname: string;
  url: string;
};

export default function GalleryPage() {
  const { theme } = useTheme();
  const params = useParams();
  const folder = params.folder as string;
  const [images, setImages] = useState<BlobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!folder) return;

    async function fetchImages() {
      try {
        const res = await fetch(`/api/list-images`);
        if (!res.ok) {
          throw new Error('Failed to fetch images');
        }
        const filesByFolder: Record<string, BlobItem[]> = await res.json();
        setImages(filesByFolder[folder] || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchImages();
  }, [folder]);

  const openModal = (url: string) => setSelectedImage(url);
  const closeModal = () => setSelectedImage(null);

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const modalBgColor = theme === 'light' ? 'bg-white/80' : 'bg-black/50';

  return (
    <div className={`${bgColor} ${textColor} min-h-screen font-sans`}>
      {theme === 'light' && (
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div>
        </div>
      )}
      
      <Header />

      <main className="pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className={`text-3xl font-bold tracking-tight capitalize mb-8 text-center ${textColor}`}>
            {folder}
          </h1>
          {isLoading ? (
            <div className="text-center">Loading images...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.pathname} className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 cursor-pointer" onClick={() => openModal(image.url)}>
                  <img
                    src={image.url}
                    alt={`Image from ${folder}`}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedImage && (
        <div 
          className={`fixed inset-0 ${modalBgColor} backdrop-blur-md flex items-center justify-center z-50`}
          onClick={closeModal}
        >
          <button 
            className="absolute top-4 right-4 text-white text-4xl cursor-pointer hover:text-gray-300 transition-colors"
            onClick={closeModal}
          >
            &times;
          </button>
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage} 
              alt="Fullscreen" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
