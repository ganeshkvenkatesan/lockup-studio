'use client';

import React, { useEffect, useState, useLayoutEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { setGroups as setClientGroups } from '@/lib/clientCache';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

type ImageItem = { pathname: string; url: string };

export default function GalleryIndex() {
  const { theme } = useTheme();
  const [groups, setGroups] = useState<Record<string, ImageItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  // Determine orientation before paint to avoid flashing the wrong layout.
  // Start as null until we can read the window size on the client.
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    // run synchronously after DOM mutation but before paint on the client
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setIsMobile(window.innerWidth < 768), 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (t) window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (isMobile === null) return; // wait until orientation resolved
    let mounted = true;
    setIsLoading(true);
    async function fetchGroups() {
      try {
        const orientation = isMobile ? 'portrait' : 'landscape';
        const res = await fetch(`/api/list-images?orientation=${orientation}`);
        const data = await res.json();
          if (mounted) {
          setGroups(data || {});
          // populate client cache so folder pages don't need to call S3
          try { setClientGroups(data || {}); } catch { /* ignore */ }
        }
      } catch {
        console.error('Failed to fetch groups');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    fetchGroups();
    return () => { mounted = false; };
  }, [isMobile]);

  // debug output removed

  const bgColor = theme === 'light' ? 'bg-white' : 'bg-black';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';

  const folderNames = Object.keys(groups || {});
  const folderCount = folderNames.length;
  const content = isLoading
    ? <div className="text-center">Loading...</div>
    : folderNames.length === 0
      ? <div className="text-center text-gray-500">No categories found. (Debug: check API response in console)</div>
      : (
        <div>
          {/* <div className="mb-4 text-sm text-gray-500">Found {folderNames.length} categories</div> */}
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {folderNames.map((g) => {
              const items = groups[g] || [];
              const thumb = items.length ? items[0] : undefined;
              const tileHeightClass = !isMobile && folderCount <= 2 ? 'h-[70vh]' : !isMobile && folderCount === 3 ? 'h-[48vh]' : isMobile && folderCount <= 2 ? 'h-[60vh]' : 'h-48 sm:h-64';
              return (
                <Link
                  key={g}
                  href={`/gallery/${encodeURIComponent(g)}`}
                  aria-label={`Open ${g} gallery`}
                  className={`block relative overflow-hidden rounded-md bg-gray-100 dark:bg-gray-800 text-center hover:shadow cursor-pointer`}
                  role="link"
                  tabIndex={0}
                >
                  {thumb ? (
                    <div className={`w-full ${tileHeightClass} overflow-hidden relative`}> 
                      <Image unoptimized loader={({ src, width }) => src} src={thumb.url} alt={g} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover object-center pointer-events-none" />
                    </div>
                  ) : (
                    <div className={`w-full ${tileHeightClass} bg-gray-200`} />
                  )}

                  <div className="absolute left-1/2 bottom-4 transform -translate-x-1/2 text-white bg-black/40 px-3 py-1 rounded pointer-events-none">{g}</div>
                  <div className="sr-only">{items.length} images</div>
                </Link>
              );
            })}
          </div>
        </div>
      );

  return (
    <div className={`${bgColor} ${textColor} min-h-screen font-sans`}>
      <Header />
      <main className="pt-24 overflow-auto">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className={`text-3xl mb-6 ${textColor} text-center`}>
            <span className="font-serif text-3xl">Gallery</span>
            <span className="sr-only"> - collections</span>
          </h1>
          {content}
        </div>
      </main>
    </div>
  );
}
