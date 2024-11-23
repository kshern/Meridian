import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadQueue } from '../common/LoadQueue';
import { throttle } from '../common/utils';

// 创建图片加载队列
const imageQueue = new LoadQueue(10, async (path: string) => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = path;
  });
});

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
}

const LazyImage: React.FC<LazyImageProps> = React.memo(({ src, alt, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleVisibilityChange = useCallback(
    throttle((isIntersecting: boolean) => {
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
        visibilityTimerRef.current = null;
      }

      if (isIntersecting) {
        visibilityTimerRef.current = setTimeout(() => {
          setIsVisible(true);
        }, 500);
      } else {
        setIsVisible(false);
      }
    }, 100),
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        handleVisibilityChange(entry.isIntersecting);
      },
      {
        rootMargin: '200px',
        threshold: 0
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
      }
      observer.disconnect();
    };
  }, [handleVisibilityChange]);

  useEffect(() => {
    const loadImage = async () => {
      if (!isVisible || loadingRef.current || isLoaded) {
        return;
      }

      loadingRef.current = true;
      try {
        setIsLoading(true);
        const success = await imageQueue.add(src);
        if (success) {
          setIsLoaded(true);
        } else {
          setError(true);
        }
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    if (isVisible) {
      loadImage();
    }
  }, [src, isVisible, isLoaded]);

  if (!isVisible) {
    return <div ref={imgRef} className={`${className} bg-gray-800`} />;
  }

  if (error) {
    return (
      <div ref={imgRef} className={`flex items-center justify-center h-full ${className} bg-gray-800`}>
        <span className="text-sm text-gray-400">Failed to load image</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className="relative w-full h-full">
      {isLoading && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {(isLoaded || !isLoading) && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className || ''}`}
        />
      )}
    </div>
  );
});

export default LazyImage;
