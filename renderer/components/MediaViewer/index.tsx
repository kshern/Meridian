import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { MediaFile } from '../../../main/fileUtils';
import {
  ArrowPathIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowUturnLeftIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import styles from './index.module.scss';

interface MediaViewerProps {
  files: MediaFile[];
  initialIndex?: number;
}

type LayoutMode = 'horizontal' | 'vertical';

const MediaViewer: React.FC<MediaViewerProps> = ({ files, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const [scale, setScale] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mediaRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentItemRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (layoutMode === 'horizontal') {
        switch (event.key) {
          case 'ArrowLeft':
            handlePrevious();
            break;
          case 'ArrowRight':
            handleNext();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [files, currentIndex, layoutMode]);

  useEffect(() => {
    if (layoutMode === 'vertical') {
      // 创建 Intersection Observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            // 找到最上面的可见元素
            const firstVisible = visibleEntries.reduce((prev, current) => {
              return prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current;
            });
            const index = parseInt(firstVisible.target.getAttribute('data-index') || '0');
            setCurrentIndex(index);
          }
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.5,
        }
      );

      mediaRefs.current.forEach((element) => {
        if (observerRef.current) {
          observerRef.current.observe(element);
        }
      });

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [layoutMode, files]);

  useEffect(() => {
    if (layoutMode === 'vertical' && containerRef.current && currentItemRef.current) {
      containerRef.current.scrollTop = currentItemRef.current.offsetTop;
    }
  }, [currentIndex, layoutMode]);

  // Reset scale when changing images or layout mode
  useEffect(() => {
    setScale(1);
  }, [currentIndex, layoutMode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (layoutMode === 'horizontal') {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale(prevScale => {
        const newScale = Math.min(Math.max(0.1, prevScale + delta), 5);
        return newScale;
      });
    }
  }, [layoutMode]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  const setMediaRef = useCallback((element: HTMLDivElement | null, index: number) => {
    if (element) {
      mediaRefs.current.set(index, element);
    } else {
      mediaRefs.current.delete(index);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (layoutMode === 'horizontal') {
      setScale(prevScale => Math.min(prevScale + 0.2, 5));
    }
  }, [layoutMode]);

  const handleZoomOut = useCallback(() => {
    if (layoutMode === 'horizontal') {
      setScale(prevScale => Math.max(prevScale - 0.2, 0.1));
    }
  }, [layoutMode]);

  const handleResetZoom = useCallback(() => {
    setScale(1);
  }, []);

  const handleFitToScreen = useCallback(() => {
    // 这里可以根据实际需求调整适应屏幕的缩放比例
    setScale(1);
  }, []);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        没有找到媒体文件
      </div>
    );
  }

  const currentFile = files[currentIndex];

  const renderMediaItem = (file: MediaFile, index: number) => {
    const isActive = index === currentIndex;
    const isImage = file.type === 'image';
    const imageStyle = layoutMode === 'horizontal' && isImage ? {
      transform: `scale(${scale})`,
      transition: 'transform 0.1s ease-out'
    } : undefined;

    return (
      <div 
        key={file.path}
        ref={(el) => setMediaRef(el, index)}
        data-index={index}
        className={`${styles.media_container} ${isActive ? styles.active : ''}`}
        onClick={() => setCurrentIndex(index)}
        onWheel={isActive && isImage ? handleWheel : undefined}
      >
        {isImage ? (
          <img
            src={`file://${file.path}`}
            alt={file.name}
            draggable={false}
            style={imageStyle}
          />
        ) : file.type === 'video' ? (
          <div className="w-full h-full flex items-center justify-center">
            <ReactPlayer
              url={`file://${file.path}`}
              width="100%"
              height="100%"
              controls
              playing={false}
              style={{ maxHeight: '100%' }}
              className={styles.react_player}
            />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef} 
      className={`${styles.media_viewer} ${styles.fade_in} ${styles[layoutMode]}`}
    >
            {/* 顶部工具栏 */}
            <div className={styles.toolbar}>
        <div className={styles.file_counter}>
          {currentIndex + 1} / {files.length}
        </div>
        <div className={styles.controls}>
          <button
            className={styles.layout_toggle}
            onClick={toggleLayout}
            data-tooltip={layoutMode === 'horizontal' ? '切换到垂直布局' : '切换到水平布局'}
          >
            {layoutMode === 'horizontal' ? '⇅' : '⇄'}
          </button>
          <div className={styles.filename}>
            {currentFile.name}
          </div>
        </div>
      </div>
            {/* 水平布局的导航按钮 */}
            {layoutMode === 'horizontal' && (
        <>
          <button
            onClick={handlePrevious}
            className={`${styles.nav_button} ${styles.prev}`}
          >
            ◀
          </button>
          <button
            onClick={handleNext}
            className={`${styles.nav_button} ${styles.next}`}
          >
            ▶
          </button>
        </>
      )}
      {layoutMode === 'horizontal' ? (
        <div className={styles.horizontal_container}>
          {renderMediaItem(currentFile, currentIndex)}
          <div className={styles.bottom_toolbar}>
            <button onClick={handleZoomOut} title="缩小">
              <MinusIcon />
              缩小
            </button>
            <button onClick={handleZoomIn} title="放大">
              <PlusIcon />
              放大
            </button>
            <button onClick={handleResetZoom} title="重置缩放">
              <ArrowPathIcon />
              重置
            </button>
            <button onClick={handleFitToScreen} title="适应屏幕">
              <ArrowsPointingInIcon />
              适应
            </button>
            <button onClick={() => setScale(2)} title="200%">
              <ArrowsPointingOutIcon />
              200%
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.vertical_container}>
          {files.map((file, index) => renderMediaItem(file, index))}
        </div>
      )}
      <div className={styles.controls}>
        <button onClick={handlePrevious}>上一张</button>
        <button onClick={toggleLayout}>切换布局</button>
        <button onClick={handleNext}>下一张</button>
      </div>
    </div>
  );
};

export default MediaViewer;
