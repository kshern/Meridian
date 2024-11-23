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
  PlusCircleIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
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
  const [rotation, setRotation] = useState(0);
  const [isWidthFitted, setIsWidthFitted] = useState(false);
  // 新增视频控制状态
  const [playingStates, setPlayingStates] = useState<{ [key: number]: boolean }>({});
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16:9');
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
        const currentFile = files[currentIndex];
        const video = currentItemRef.current?.querySelector('video');
        
        switch (event.key) {
          case 'ArrowLeft':
            if (currentFile.type === 'video' && video) {
              video.currentTime = Math.max(0, video.currentTime - 10);
            } else {
              handlePrevious();
            }
            break;
          case 'ArrowRight':
            if (currentFile.type === 'video' && video) {
              video.currentTime = Math.min(video.duration, video.currentTime + 10);
            } else {
              handleNext();
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [files, currentIndex, layoutMode]);

  useEffect(() => {
    if (layoutMode === 'vertical') {
      // 确保在垂直模式下正确定位到当前index
      requestAnimationFrame(() => {
        const element = mediaRefs.current.get(currentIndex);
        if (element) {
          element.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      });

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // 使用节流来减少频繁更新
          const visibleEntries = entries.filter(entry => entry.isIntersecting);
          if (visibleEntries.length > 0) {
            const mostVisible = visibleEntries.reduce((prev, current) => {
              return prev.intersectionRatio > current.intersectionRatio ? prev : current;
            });
            const index = parseInt(mostVisible.target.getAttribute('data-index') || '0');
            if (index >= 0 && index < files.length && index !== currentIndex) {
              setCurrentIndex(index);
            }
          }
        },
        {
          root: containerRef.current,
          rootMargin: '0px',
          threshold: [0, 0.25, 0.5, 0.75, 1],
        }
      );

      // 延迟添加观察者，确保初始滚动已完成
      const timer = setTimeout(() => {
        mediaRefs.current.forEach((element) => {
          if (observerRef.current) {
            observerRef.current.observe(element);
          }
        });
      }, 100);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        clearTimeout(timer);
      };
    }
  }, [layoutMode, files.length]);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsWidthFitted(false);
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
      const maxY = Math.max(0, (scaledHeight - containerRef.current!.getBoundingClientRect().height) / 2);

      // 限制水平拖动范围
      if (scaledWidth > containerRect.width) {
        newX = Math.min(Math.max(newX, -maxX), maxX);
      } else {
        newX = 0;
      }

      // 限制垂直拖动范围
      if (scaledHeight > containerRef.current!.getBoundingClientRect().height) {
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

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
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

  const handleFitToScreen = useCallback(() => {
    setScale(1);
  }, []);

  const handleFitWidth = useCallback(() => {
    if (!isWidthFitted) {
      if (layoutMode === 'horizontal' && imageRef.current && containerRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const currentWidth = imgRect.width / scale;
        const newScale = containerRect.width / currentWidth;
        setScale(newScale);
        
        // 计算图片在新scale下的高度
        const newHeight = imgRect.height * (newScale / scale);
        // 如果图片高度大于容器，将其定位到顶部
        if (newHeight > containerRect.height) {
          const maxY = (newHeight - containerRect.height) / 2;
          setPosition({ x: 0, y: maxY });
        } else {
          setPosition({ x: 0, y: 0 });
        }
        
        setIsWidthFitted(true);
      }
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsWidthFitted(false);
    }
  }, [layoutMode, scale, isWidthFitted]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (layoutMode === 'horizontal' && isWidthFitted && imageRef.current && containerRef.current) {
      e.preventDefault();
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // 只有当图片高度大于容器高度时才允许滚动
      if (imgRect.height > containerRect.height) {
        const deltaY = e.deltaY;
        const maxY = Math.max(0, (imgRect.height - containerRect.height) / 2);
        
        // 计算新的Y位置
        let newY = position.y - deltaY;
        
        // 限制垂直滚动范围
        newY = Math.min(Math.max(newY, -maxY), maxY);
        
        setPosition(prev => ({ ...prev, y: newY }));
      }
    }
  }, [layoutMode, isWidthFitted, position.y]);

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (value === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgress = (state: { played: number }) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekChange = (value: number) => {
    setPlayed(value);
  };

  const handleSeekMouseUp = (value: number) => {
    setSeeking(false);
    if (currentItemRef.current) {
      const player = currentItemRef.current.querySelector('video');
      if (player) {
        player.currentTime = value * player.duration;
      }
    }
  };

  const handleAspectRatioChange = (ratio: string) => {
    setAspectRatio(ratio);
  };

  const togglePlay = (index: number) => {
    setPlayingStates(prev => {
      const newStates = { ...prev };
      Object.keys(prev).forEach(key => {
        newStates[parseInt(key)] = false;
      });
      newStates[index] = !prev[index];
      return newStates;
    });
  };

  const formatTime = (seconds: number) => {
    const pad = (num: number) => String(Math.floor(num)).padStart(2, '0');
    const hours = seconds / 3600;
    const minutes = (seconds % 3600) / 60;
    const secs = seconds % 60;
    
    if (hours >= 1) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
  };

  const getCurrentTime = () => {
    if (currentItemRef.current) {
      const video = currentItemRef.current.querySelector('video');
      if (video) {
        return formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
      }
    }
    return '00:00 / 00:00';
  };

  const renderToolbar = () => (
    <div className={styles.toolbar}>
      <div className={styles.file_counter}>
        {currentIndex + 1} / {files.length}
      </div>
      <div className={styles.top_controls}>
        {layoutMode === 'horizontal' && (
          <>
          <button
            className={styles.layout_toggle}
            onClick={handleRotate}
            data-tooltip="旋转"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
            <button
              className={styles.layout_toggle}
              onClick={handleZoomOut}
              data-tooltip="缩小"
            >
              <MinusIcon className="w-5 h-5" />
            </button>
            <button
              className={styles.layout_toggle}
              onClick={handleZoomIn}
              data-tooltip="放大"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
            <button
              className={styles.layout_toggle}
              onClick={handleFitWidth}
              data-tooltip={isWidthFitted ? "重置" : "横向铺满"}
            >
              {isWidthFitted ? (
                <ArrowsPointingInIcon className="w-5 h-5" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5 rotate-90" />
              )}
            </button>
          </>
        )}
        <button
          className={styles.layout_toggle}
          onClick={toggleLayout}
          data-tooltip={layoutMode === 'horizontal' ? '切换到垂直布局' : '切换到水平布局'}
        >
          {layoutMode === 'horizontal' ? (
            <ArrowsUpDownIcon className="w-5 h-5" />
          ) : (
            <ArrowsRightLeftIcon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );

  const renderMediaItem = (file: MediaFile, index: number) => {
    const isImage = file.type === 'image';
    const isCurrent = index === currentIndex;
    const isPlaying = playingStates[index] || false;
    const imageClasses = [
      isDragging && 'dragging',
      rotation !== 0 && 'rotating'
    ].filter(Boolean).join(' ');

    const mediaStyle = layoutMode === 'horizontal' && isCurrent && isImage ? {
      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px) rotate(${rotation}deg)`,
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
        onWheel={isCurrent && isImage ? handleWheel : undefined}
      >
        {isImage ? (
          <img
            ref={isCurrent ? imageRef : null}
            src={`file://${file.path}`}
            alt={file.name}
            className={imageClasses}
            style={mediaStyle}
            draggable={false}
          />
        ) : (
          <div className={`${styles.media_container} ${!isPlaying ? styles.paused : ''}`}>
            <div 
              className={styles.video_wrapper}
              onClick={isCurrent ? () => togglePlay(index) : undefined}
            >
              <ReactPlayer
                url={`file://${file.path}`}
                width="100%"
                height="100%"
                playing={isPlaying}
                playbackRate={playbackRate}
                volume={volume}
                muted={isMuted}
                style={{ maxHeight: '100%', aspectRatio }}
                onProgress={isCurrent ? handleProgress : undefined}
                progressInterval={1000}
                controls={false}
                config={{
                  file: {
                    attributes: {
                      controlsList: 'nodownload',
                      disablePictureInPicture: true,
                      style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }
                    }
                  }
                }}
              />
            </div>
            {!isPlaying && isCurrent && (
              <div 
                className={styles.center_play_button}
                onClick={() => togglePlay(index)}
              >
                <PlayIcon className="w-16 h-16" />
              </div>
            )}
            {isCurrent && (
              <div className={styles.video_controls}>
                <button onClick={() => togglePlay(index)}>
                  {isPlaying ? (
                    <PauseIcon className="w-5 h-5" />
                  ) : (
                    <PlayIcon className="w-5 h-5" />
                  )}
                </button>
                
                <div className={styles.progress_bar} data-time={getCurrentTime()}>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={played}
                    onMouseDown={handleSeekMouseDown}
                    onChange={(e) => handleSeekChange(parseFloat(e.target.value))}
                    onMouseUp={(e) => handleSeekMouseUp(parseFloat((e.target as HTMLInputElement).value))}
                    style={{ '--progress': `${played * 100}%` } as React.CSSProperties}
                  />
                </div>

                <div className={styles.volume_control}>
                  <button onClick={handleToggleMute}>
                    {isMuted || volume === 0 ? (
                      <SpeakerXMarkIcon className="w-5 h-5" />
                    ) : (
                      <SpeakerWaveIcon className="w-5 h-5" />
                    )}
                  </button>
                  <div className={styles.volume_slider}>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step="any"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      style={{ '--volume': `${volume * 100}%` } as React.CSSProperties}
                    />
                  </div>
                </div>

                <div className={styles.right_controls}>
                  <select
                    value={playbackRate}
                    onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  <select
                    value={aspectRatio}
                    onChange={(e) => handleAspectRatioChange(e.target.value)}
                  >
                    <option value="16:9">16:9</option>
                    <option value="4:3">4:3</option>
                    <option value="1:1">1:1</option>
                    <option value="auto">自动</option>
                  </select>

                  <button onClick={handleToggleFullscreen}>
                    {isFullscreen ? (
                      <ArrowsPointingInIcon className="w-5 h-5" />
                    ) : (
                      <ArrowsPointingOutIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (layoutMode === 'vertical') {
      const container = e.currentTarget;
      const items = Array.from(mediaRefs.current.values());
      const containerRect = container.getBoundingClientRect();

      // 找到最接近容器中心的元素
      let closestItem = null;
      let minDistance = Infinity;
      let closestIndex = currentIndex;

      items.forEach((item, index) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenter = itemRect.top + itemRect.height / 2;
        const containerCenter = containerRect.top + containerRect.height / 2;
        const distance = Math.abs(itemCenter - containerCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestItem = item;
          closestIndex = parseInt(item.getAttribute('data-index') || '0');
        }
      });

      if (closestIndex !== currentIndex) {
        setCurrentIndex(closestIndex);
      }
    }
  }, [layoutMode, currentIndex]);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        没有找到媒体文件
      </div>
    );
  }

  const currentFile = files[currentIndex];

  return (
    <div
      ref={containerRef}
      className={`${styles.media_viewer} ${styles.fade_in} ${styles[layoutMode]}`}
      onScroll={handleScroll}
    >
      {renderToolbar()}
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
