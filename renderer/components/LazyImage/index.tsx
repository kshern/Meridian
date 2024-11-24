import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadQueue } from '../../common/LoadQueue';
import { throttle } from '../../common/utils';

// 创建缩略图缓存
const thumbnailCache = new Map<string, string>();

// 创建图片加载队列，限制并发数为5
const imageQueue = new LoadQueue(5, async (path: string) => {
  try {
    // 移除 file:// 前缀
    const filePath = path.replace('file://', '');
    
    // 检查缓存
    if (thumbnailCache.has(filePath)) {
      return true;
    }

    // 使用IPC调用主进程生成缩略图
    const thumbnail = await window.electron.generateThumbnail(filePath, 400);
    if (thumbnail) {
      thumbnailCache.set(filePath, thumbnail);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to load image:', error);
    return false;
  }
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
      <div ref={imgRef} className={`${className} bg-gray-800 flex items-center justify-center`}>
        <span className="text-gray-400">Failed to load image</span>
      </div>
    );
  }

  const filePath = src.replace('file://', '');
  const thumbnailSrc = thumbnailCache.get(filePath);

  return (
    <div ref={imgRef} className={`${className} relative bg-gray-800`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {isLoaded && thumbnailSrc && (
        <img
          src={thumbnailSrc}
          alt={alt}
          className={`${className} object-cover`}
          loading="lazy"
        />
      )}
    </div>
  );
});

export default LazyImage;
