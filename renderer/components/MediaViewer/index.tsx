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
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const observerRef = useRef<IntersectionObserver | null>(null);
  const mediaRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentItemRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

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
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            const firstVisible = visibleEntries.reduce((prev, current) => {
              return prev.boundingClientRect.top < current.boundingClientRect.top ? prev : current;
            });
            const index = parseInt(firstVisible.target.getAttribute('data-index') || '0');
            // 只在用户滚动时更新索引，而不是布局切换时
            if (Math.abs(index - currentIndex) === 1) {
              setCurrentIndex(index);
            }
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
  }, [layoutMode, files, currentIndex]);

  useEffect(() => {
    // 给一个小延时确保DOM已更新
    const timer = setTimeout(() => {
      if (layoutMode === 'vertical' && containerRef.current && mediaRefs.current.get(currentIndex)) {
        const element = mediaRefs.current.get(currentIndex);
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [layoutMode, currentIndex]);

  useEffect(() => {
    if (layoutMode === 'vertical' && containerRef.current && currentItemRef.current) {
      containerRef.current.scrollTop = currentItemRef.current.offsetTop;
    }
  }, [currentIndex, layoutMode]);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 }); // 重置位置
  }, [currentIndex, layoutMode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 && layoutMode === 'horizontal' && imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // 只有当图片尺寸超过容器时才允许拖动
      const canDragX = imgRect.width > containerRect.width;
      const canDragY = imgRect.height > containerRect.height;

      if (canDragX || canDragY) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1 && imageRef.current && containerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // 计算新位置
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // 计算图片的实际尺寸（包含缩放）
      const scaledWidth = imgRect.width;
      const scaledHeight = imgRect.height;

      // 计算最大可拖动范围
      const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
      const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

      // 限制水平拖动范围
      if (scaledWidth > containerRect.width) {
        newX = Math.min(Math.max(newX, -maxX), maxX);
      } else {
        newX = 0;
      }

      // 限制垂直拖动范围
      if (scaledHeight > containerRect.height) {
        newY = Math.min(Math.max(newY, -maxY), maxY);
      } else {
        newY = 0;
      }

      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

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

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        没有找到媒体文件
      </div>
    );
  }

  const currentFile = files[currentIndex];

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // if (layoutMode === 'horizontal' && currentFile.type === 'image') {
    //   e.preventDefault();
    //   const delta = e.deltaY * -0.01;
    //   setScale(prevScale => {
    //     const newScale = Math.min(Math.max(0.1, prevScale + delta), 5);
    //     return newScale;
    //   });
    // }
  }, [layoutMode, currentFile]);

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
    setScale(1);
  }, []);

  const renderMediaItem = (file: MediaFile, index: number) => {
    const isImage = file.type === 'image';
    const isVideo = file.type === 'video';
    const isCurrent = index === currentIndex;

    const mediaStyle = layoutMode === 'horizontal' && isCurrent && isImage ? {
      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
      cursor: isDragging ? 'grabbing' : (scale > 1 ? 'grab' : 'default'),
    } : undefined;

    return (
      <div
        key={file.path}
        className={`${styles.media_item} ${isCurrent ? styles.current : ''}`}
        ref={(el) => {
          if (el) mediaRefs.current.set(index, el);
          if (isCurrent) currentItemRef.current = el;
        }}
        data-index={index}
        onMouseDown={isCurrent && isImage ? handleMouseDown : undefined}
        onMouseMove={isCurrent && isImage ? handleMouseMove : undefined}
        onMouseUp={isCurrent && isImage ? handleMouseUp : undefined}
      >
        {isImage ? (
          <img
            ref={isCurrent ? imageRef : null}
            src={`file://${file.path}`}
            alt={file.name}
            className={styles.image}
            style={mediaStyle}
            draggable={false}
          />
        ) : isVideo ? (
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
       {/* 底部工具栏 */}
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
    </div>
  );
};

export default MediaViewer;
