"use client";

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';

type ImageItem = { pathname: string; url?: string };

interface Props {
  title: string;
  images: ImageItem[];
  intervalMs?: number;
}

export default function ImageCarousel({ title, images, intervalMs = 7000 }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
    // pick a random starting image when images change
    if (images.length) setCurrentIndex(Math.floor(Math.random() * images.length));
  }, [images]);

  useEffect(() => {
    if (!imagesRef.current || imagesRef.current.length === 0) return;
    const t = setInterval(() => {
      setCurrentIndex((i) => {
        if (imagesRef.current.length <= 1) return 0;
        let next = Math.floor(Math.random() * imagesRef.current.length);
        let attempts = 0;
        while (next === i && attempts < 5) {
          next = Math.floor(Math.random() * imagesRef.current.length);
          attempts++;
        }
        return next;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, imagesRef.current?.length]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        <span className="text-sm text-gray-500">No images</span>
      </div>
    );
  }

  const img = images[currentIndex];

  const loader = ({ src }: { src: string }) => src;

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-md shadow-md">
      <Image
        loader={loader}
        src={img.url || `/${img.pathname}`}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover object-center transition-opacity duration-700"
        draggable={false}
      />
      <div className="absolute left-0 bottom-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent text-white">
        <div className="text-sm font-medium">{title}</div>
      </div>
    </div>
  );
}
