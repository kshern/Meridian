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
    handleMouseDown?: (e: React.MouseEvent) => void;
    handleMouseMove?: (e: React.MouseEvent) => void;
    handleMouseUp?: (e: React.MouseEvent) => void;
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
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
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
    const isPlaying = playingStates[index] || false;

    const imageClasses = [
        isDragging && CSS_CLASSES.DRAGGING,
        rotation !== 0 && CSS_CLASSES.ROTATING
    ].filter(Boolean).join(' ');

    const mediaStyle = {
        transform: `
            translate(${position.x}px, ${position.y}px)
            scale(${scale})
            rotate(${rotation}deg)
        `,
    };

    useEffect(() => {
        setVideoError(null);
    }, [index]);

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

    return (
        <div
            className={`${styles.media_item} ${isCurrent ? CSS_CLASSES.CURRENT : ''}`}
            data-index={index}
            onMouseDown={isCurrent && isImage && handleMouseDown ? handleMouseDown : undefined}
            onMouseMove={isCurrent && isImage && handleMouseMove ? handleMouseMove : undefined}
            onMouseUp={isCurrent && isImage && handleMouseUp ? handleMouseUp : undefined}
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
                        isFullscreen={isFullscreen}
                        videoError={videoError}
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
