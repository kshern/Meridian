import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LoadQueue } from '../../common/LoadQueue';
import { throttle } from '../../common/utils';
import { PlayIcon } from '@heroicons/react/24/outline';
import LazyImage from '../LazyImage';

// 创建视频缩略图加载队列
const thumbnailQueue = new LoadQueue(10, async (path: string) => {
  try {
    const thumbnailPath = await window.ipc.getVideoThumbnail(path);
    return !!thumbnailPath;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    return false;
  }
});

interface VideoThumbnailProps {
  videoPath: string;
  className?: string;
  showTag?: boolean;
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = React.memo(({ videoPath, className, showTag = true }) => {
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
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

    if (thumbnailRef.current) {
      observer.observe(thumbnailRef.current);
    }

    return () => {
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current);
      }
      observer.disconnect();
    };
  }, [handleVisibilityChange]);

  useEffect(() => {
    const loadThumbnail = async () => {
      if (!isVisible || loadingRef.current || thumbnailPath) {
        return;
      }

      loadingRef.current = true;
      try {
        setIsLoading(true);
        const success = await thumbnailQueue.add(videoPath);
        if (success) {
          const path = await window.ipc.getVideoThumbnail(videoPath);
          setThumbnailPath(`file://${path}`);
          setError(null);
        } else {
          setError('Failed to generate thumbnail');
        }
      } catch (error) {
        console.error('Error loading video thumbnail:', error);
        setError('Error loading thumbnail');
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    if (isVisible) {
      loadThumbnail();
    }
  }, [videoPath, isVisible, thumbnailPath]);

  if (!isVisible) {
    return <div ref={thumbnailRef} className={`${className} bg-gray-800`} />;
  }

  if (isLoading && !thumbnailPath) {
    return (
      <div ref={thumbnailRef} className={`flex items-center justify-center h-full ${className} bg-gray-800`}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !thumbnailPath) {
    return (
      <div ref={thumbnailRef} className={`flex items-center justify-center h-full ${className} bg-gray-800`}>
        <span className="text-sm text-gray-400">{error || 'No thumbnail'}</span>
      </div>
    );
  }

  return (
    <div ref={thumbnailRef} className="relative w-full h-full">
      <LazyImage src={thumbnailPath} alt="Video thumbnail" className={className} />
      {showTag && (
        <>
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white/90">
            Video
          </div>
        </>
      )}
    </div>
  );
});

export default VideoThumbnail;
