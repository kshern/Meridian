import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { MediaFile } from '../../../main/fileUtils';
import styles from './index.module.scss';

interface MediaViewerProps {
  files: MediaFile[];
  initialIndex?: number;
}

type LayoutMode = 'horizontal' | 'vertical';

const MediaViewer: React.FC<MediaViewerProps> = ({ files, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
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
          threshold: 0.5, // 当元素50%可见时触发
        }
      );

      // 观察所有媒体容器
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

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  // 保存媒体容器的引用
  const setMediaRef = useCallback((element: HTMLDivElement | null, index: number) => {
    if (element) {
      mediaRefs.current.set(index, element);
    } else {
      mediaRefs.current.delete(index);
    }
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
    return (
      <div 
        key={file.path}
        ref={(el) => setMediaRef(el, index)}
        data-index={index}
        className={`${styles.media_container} ${isActive ? styles.active : ''}`}
        onClick={() => setCurrentIndex(index)}
      >
        {file.type === 'image' ? (
          <img
            src={`file://${file.path}`}
            alt={file.name}
            draggable={false}
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
    <div className={`${styles.media_viewer} ${styles.fade_in} ${styles[layoutMode]}`}>
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

      {/* 媒体内容 */}
      <div className={`${styles.content} flex ${layoutMode === 'vertical' ? 'flex-col' : ''} h-full p-8`}>
        {layoutMode === 'vertical' ? (
          <div className={`${styles.wrapper}`} ref={containerRef}>
            {files.map((file, index) => (
              <div
                key={file.path}
                ref={index === currentIndex ? currentItemRef : null}
                className={styles.media_container}
              >
                {renderMediaItem(file, index)}
              </div>
            ))}
          </div>
        ) : (
          renderMediaItem(currentFile, currentIndex)
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
