'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getGroup } from '@/lib/clientCache';
import Image from 'next/image';
import Link from 'next/link';
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
    // Read images from client-side cache populated by the gallery index.
    const cached = getGroup(folder);
    if (cached) {
      setImages(cached as BlobItem[]);
      setIsLoading(false);
    } else {
      // If cache is missing, try to fetch from our server API as a safe fallback
      // (this hits our server which serves from server-side cache of S3 presigned urls).
      (async () => {
        try {
          const resp = await fetch(`/api/list-images`);
          if (!resp.ok) throw new Error('Failed to fetch list');
          const data = await resp.json();
          // find the folder in any orientation groups
          let found: BlobItem[] | undefined;
          for (const key of Object.keys(data || {})) {
            const group = data[key] as BlobItem[];
            if (!group) continue;
            if (group[0] && group[0].pathname.includes(`/${folder}/`)) {
              found = group.filter((g: BlobItem) => g.pathname.includes(`/${folder}/`));
              break;
            }
          }
          if (found) {
            setImages(found);
          } else {
            console.warn('No images found for folder', folder);
            setImages([]);
          }
        } catch (err) {
          console.error('Fallback fetch failed', err);
          setImages([]);
        } finally {
          setIsLoading(false);
        }
      })();
    }
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="relative mb-6">
            <h1 className={`text-3xl mb-6 ${textColor} text-center`}>
              <span className="font-serif text-3xl">{folder || ''}</span>
            </h1>
            <div className="absolute right-0 top-0">
              <Link href="/gallery" className="inline-flex items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md bg-black text-white hover:opacity-90">← Gallery</Link>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center">Loading images...</div>
          ) : (
            <div className="w-full">
              {images.length === 0 ? (
                <div className="text-center">No images available</div>
              ) : (
                <>
                  {/* Hero image - show the first image large */}
                  <div className="w-full mb-6">
                    <button onClick={() => openModal(images[0].url)} className="w-full h-[60vh] overflow-hidden rounded-md relative focus:outline-none">
                      <Image unoptimized loader={({ src, width }) => src} src={images[0].url} alt={folder} fill className="object-cover object-center pointer-events-none" sizes="100vw" />
                    </button>
                  </div>

                  <div className={`grid gap-4 ${images.length <= 2 ? 'grid-cols-1 sm:grid-cols-2' : images.length <= 6 ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                    {images.slice(1).map((image) => (
                        <button
                          key={image.pathname}
                          onClick={() => openModal(image.url)}
                          className="w-full overflow-hidden rounded-lg bg-gray-200 cursor-pointer focus:outline-none"
                        >
                          <div className="w-full h-64 sm:h-80 md:h-64 overflow-hidden relative">
                            <Image unoptimized loader={({ src, width }) => src} src={image.url} alt={`Image from ${folder}`} fill className="object-center object-cover pointer-events-none" sizes="(max-width: 640px) 100vw, 33vw" />
                          </div>
                        </button>
                    ))}
                  </div>
                </>
              )}
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
          <div className="relative max-w-7xl max-h-[95vh] w-full h-full" onClick={(e) => e.stopPropagation()}>
            <Image unoptimized loader={({ src, width }) => src} src={selectedImage || ''} alt="Fullscreen" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  );
}
