import React, { useState, useCallback, forwardRef, useEffect, memo, Suspense, lazy } from 'react';
import styles from './MediaItem.module.scss';
import useVolume from '../../../hooks/useVolume';
import { 
    CSS_CLASSES, 
    DEFAULT_PLAYBACK_RATE, 
    ERROR_MESSAGES, 
    MEDIA_TYPES,
    PROGRESS_INTERVAL 
} from '../utils/constants';
import { 
    getCurrentVideoTime, 
    toggleFullscreen, 
    updatePlayingStates,
    handleVolumeChange as handleVolumeChangeUtil
} from '../utils/mediaUtils';
import { MediaFile } from '@/main/fileUtils';

// 懒加载组件
const ImageViewer = lazy(() => import('./ImageViewer'));
const VideoPlayer = lazy(() => import('./VideoPlayer'));

const LoadingFallback = () => (
    <div className={styles.loading}>
        <div className={styles.spinner}></div>
    </div>
);

interface MediaItemProps {
    file: MediaFile;
    index: number;
    currentIndex: number;
    isDragging: boolean;
    rotation: number;
    scale: number;
    position: { x: number; y: number };
    layoutMode?: string;
    onPlayingChange?: (isPlaying: boolean) => void;
}

const MediaItem = memo(forwardRef<HTMLImageElement, MediaItemProps>(({
    file,
    index,
    currentIndex,
    isDragging,
    rotation,
    scale,
    position,
    onPlayingChange,
    layoutMode,
}, ref) => {
    const isImage = file.type === MEDIA_TYPES.IMAGE;
    const isCurrent = index === currentIndex;
    const [videoError, setVideoError] = useState<string | null>(null);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(DEFAULT_PLAYBACK_RATE);
    const [playingStates, setPlayingStates] = useState<{ [key: number]: boolean }>({});
    const { volume, muted, saveVolume, saveMuted } = useVolume();
    const [mediaScale, setScale] = useState(scale);
    const [isDraggingMedia, setIsDraggingMedia] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [mediaPosition, setMediaPosition] = useState(position);
    const isPlaying = playingStates[index] || false;

    const imageClasses = [
        isDraggingMedia && CSS_CLASSES.DRAGGING,
        rotation !== 0 && CSS_CLASSES.ROTATING
    ].filter(Boolean).join(' ');
    useEffect(() => {
        setScale(scale);
    }, [scale]);
    const mediaStyle = {
        transform: `
            translate(${mediaPosition.x}px, ${mediaPosition.y}px)
            scale(${mediaScale})
            rotate(${rotation}deg)
        `,
    };

    useEffect(() => {
        setVideoError(null);
    }, [index]);

    useEffect(() => {
        if (!isImage) {
            // 重置所有状态
            setPlayingStates({});
            setPlayed(0);
            setSeeking(false);
            setVideoError(null);
            setPlaybackRate(DEFAULT_PLAYBACK_RATE);
            setScale(1);
            setMediaPosition({ x: 0, y: 0 });
            onPlayingChange?.(false);

            // 重置视频元素
            const video = document.querySelector('video');
            if (video) {
                video.currentTime = 0;
                video.load();
            }
        }
    }, [currentIndex, isImage, onPlayingChange]);

    const handleProgress = useCallback((state: { played: number }) => {
        if (!seeking) {
            setPlayed(state.played);
        }
    }, [seeking]);

    const handleSeekMouseDown = useCallback(() => {
        setSeeking(true);
    }, []);

    const handleSeekChange = useCallback((value: number) => {
        setPlayed(value);
    }, []);

    const handleSeekMouseUp = useCallback((value: number) => {
        setSeeking(false);
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = value * video.duration;
        }
    }, []);

    const handleToggleFullscreen = useCallback(async () => {
        const newFullscreenState = await toggleFullscreen(`.${styles.media_container}`);
        setIsFullscreen(newFullscreenState);
    }, []);

    const togglePlay = useCallback((index: number) => {
        setPlayingStates(prev => {
            const newStates = updatePlayingStates(prev, index);
            onPlayingChange?.(newStates[index] || false);
            return newStates;
        });
    }, [onPlayingChange]);

    const handleVolumeChange = (value: number) => {
        handleVolumeChangeUtil(value, saveVolume, saveMuted);
    };

    const handleToggleMute = () => {
        saveMuted(!muted);
    };

    const handleWheel = useCallback((e: WheelEvent) => {
        // 只在网格模式下处理缩放
        if (layoutMode !== 'vertical' && isCurrent) {
            e.preventDefault();
            const delta = e.deltaY;
            const scaleChange = delta > 0 ? 0.9 : 1.1; // 缩小或放大10%
            const newScale = mediaScale * scaleChange;

            // 限制缩放范围在0.1到5之间
            if (newScale >= 0.1 && newScale <= 5) {
                setScale(newScale);
            }
        }
    }, [layoutMode, isCurrent, mediaScale]);

    useEffect(() => {
        const element = document.querySelector(`.${styles.media_item}[data-index="${index}"]`);
        if (element) {
            element.addEventListener('wheel', handleWheel, { passive: false });
            return () => {
                element.removeEventListener('wheel', handleWheel);
            };
        }
    }, [handleWheel, index]);

    const handleMediaMouseDown = useCallback((e: React.MouseEvent) => {
        if (isCurrent && mediaScale > 1) {
            e.preventDefault();
            setIsDraggingMedia(true);
            setDragStartPos({ 
                x: e.clientX - mediaPosition.x, 
                y: e.clientY - mediaPosition.y 
            });
        }
    }, [isCurrent, mediaScale, mediaPosition]);

    const handleMediaMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDraggingMedia && mediaScale > 1) {
            e.preventDefault();
            const newX = e.clientX - dragStartPos.x;
            const newY = e.clientY - dragStartPos.y;

            // 获取容器和媒体元素
            const container = document.querySelector(`.${styles.media_item}[data-index="${index}"]`);
            const media = container?.querySelector('video, img');
            
            if (container && media) {
                const containerRect = container.getBoundingClientRect();
                const mediaRect = media.getBoundingClientRect();

                const scaledWidth = mediaRect.width;
                const scaledHeight = mediaRect.height;

                const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
                const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);

                // 限制拖动范围
                const boundedX = Math.min(Math.max(newX, -maxX), maxX);
                const boundedY = Math.min(Math.max(newY, -maxY), maxY);

                setMediaPosition({ x: boundedX, y: boundedY });
            }
        }
    }, [isDraggingMedia, mediaScale, dragStartPos, index]);

    const handleMediaMouseUp = useCallback(() => {
        setIsDraggingMedia(false);
    }, []);

    return (
        <div
            className={`${styles.media_item} ${isCurrent ? CSS_CLASSES.CURRENT : ''}`}
            data-index={index}
            onMouseDown={handleMediaMouseDown}
            onMouseMove={handleMediaMouseMove}
            onMouseUp={handleMediaMouseUp}
            onMouseLeave={handleMediaMouseUp}
        >
            <Suspense fallback={<LoadingFallback />}>
                {isImage ? (
                    <ImageViewer
                        ref={isCurrent ? ref : null}
                        path={file.path}
                        name={file.name}
                        imageClasses={imageClasses}
                        mediaStyle={mediaStyle}
                    />
                ) : (
                    <VideoPlayer
                        path={file.path}
                        isPlaying={isPlaying}
                        playbackRate={playbackRate}
                        volume={volume}
                        muted={muted}
                        played={played}
                        videoError={videoError}
                        scale={mediaScale}
                        position={mediaPosition}
                        onProgress={handleProgress}
                        onError={(error) => {
                            console.error('Video playback error:', error);
                            setVideoError(ERROR_MESSAGES.VIDEO_CODEC);
                        }}
                        onTogglePlay={() => togglePlay(index)}
                        onSeekMouseDown={handleSeekMouseDown}
                        onSeekChange={handleSeekChange}
                        onSeekMouseUp={handleSeekMouseUp}
                        onVolumeChange={handleVolumeChange}
                        onToggleMute={handleToggleMute}
                        onPlaybackRateChange={setPlaybackRate}
                        onToggleFullscreen={handleToggleFullscreen}
                        getCurrentTime={getCurrentVideoTime}
                        isCurrent={isCurrent}
                    />
                )}
            </Suspense>
        </div>
    );
}));

MediaItem.displayName = 'MediaItem';

export default MediaItem;
