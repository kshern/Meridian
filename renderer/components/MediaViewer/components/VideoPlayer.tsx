import React, { useEffect, useCallback, useRef } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';
import styles from './MediaItem.module.scss';
import { VideoControls } from './VideoControls';
import { 
    CSS_CLASSES, 
    PROGRESS_INTERVAL, 
    KEY_CODES, 
    VIDEO_SEEK_TIME 
} from '../utils/constants';

interface VideoPlayerProps {
    path: string;
    isPlaying: boolean;
    playbackRate: number;
    volume: number;
    muted: boolean;
    played: number;
    isFullscreen: boolean;
    videoError: string | null;
    scale: number;
    position: { x: number; y: number };
    onProgress: (state: { played: number }) => void;
    onError: (error: any) => void;
    onTogglePlay: () => void;
    onSeekMouseDown: () => void;
    onSeekChange: (value: number) => void;
    onSeekMouseUp: (value: number) => void;
    onVolumeChange: (value: number) => void;
    onToggleMute: () => void;
    onPlaybackRateChange: (rate: number) => void;
    onToggleFullscreen: () => void;
    getCurrentTime: () => string;
    isCurrent: boolean;
    handleMouseDown?: (e: React.MouseEvent) => void;
    handleMouseMove?: (e: React.MouseEvent) => void;
    handleMouseUp?: (e: React.MouseEvent) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    path,
    isPlaying,
    playbackRate,
    volume,
    muted,
    played,
    isFullscreen,
    videoError,
    scale,
    position,
    onProgress,
    onError,
    onTogglePlay,
    onSeekMouseDown,
    onSeekChange,
    onSeekMouseUp,
    onVolumeChange,
    onToggleMute,
    onPlaybackRateChange,
    onToggleFullscreen,
    getCurrentTime,
    isCurrent,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
}) => {
    const playerRef = useRef<ReactPlayer>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (playerRef.current) {
            const videoElement = playerRef.current.getInternalPlayer();
            if (videoElement instanceof HTMLVideoElement) {
                videoRef.current = videoElement;
            }
        }
    }, [playerRef.current]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isCurrent || !playerRef.current) return;

        const video = playerRef.current.getInternalPlayer();
        if (!video) return;

        const currentTime = video.currentTime;
        const duration = video.duration;

        switch (e.code) {
            case KEY_CODES.SPACE:
                e.preventDefault();
                onTogglePlay();
                break;
            case KEY_CODES.LEFT_ARROW:
                if (isPlaying) {
                    e.preventDefault();
                    const newTime = Math.max(0, currentTime - VIDEO_SEEK_TIME);
                    video.currentTime = newTime;
                    onSeekChange(newTime / duration);
                }
                break;
            case KEY_CODES.RIGHT_ARROW:
                if (isPlaying) {
                    e.preventDefault();
                    const newTime = Math.min(duration, currentTime + VIDEO_SEEK_TIME);
                    video.currentTime = newTime;
                    onSeekChange(newTime / duration);
                }
                break;
        }
    }, [isPlaying, isCurrent, onSeekChange, onTogglePlay]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return (
        <div className={`${styles.media_container} ${!isPlaying ? CSS_CLASSES.PAUSED : ''}`}>
            <div
                className={styles.video_wrapper}
                style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    cursor: scale > 1 ? 'grab' : 'default',
                    userSelect: 'none'
                }}
            >
                <ReactPlayer
                    key={path}
                    ref={playerRef}
                    url={`file://${path}`}
                    playing={isPlaying}
                    loop={false}
                    playbackRate={playbackRate}
                    volume={volume}
                    muted={muted}
                    style={{ maxHeight: '100%', pointerEvents: 'none' }}
                    onProgress={onProgress}
                    onError={onError}
                    progressInterval={PROGRESS_INTERVAL}
                    controls={false}
                    width="100%"
                    height="100%"
                    config={{
                        file: {
                            attributes: {
                                controlsList: 'nodownload',
                                disablePictureInPicture: true,
                            },
                        },
                    }}
                />
            </div>
            {videoError && (
                <div className={styles.error_message}>
                    {videoError}
                </div>
            )}
            {!isPlaying && !videoError && (
                <div
                    className={styles.center_play_button}
                    onClick={onTogglePlay}
                >
                    <PlayIcon className="w-16 h-16" />
                </div>
            )}
            {!videoError && (
                <VideoControls
                    isPlaying={isPlaying}
                    played={played}
                    volume={volume}
                    muted={muted}
                    playbackRate={playbackRate}
                    isFullscreen={isFullscreen}
                    getCurrentTime={getCurrentTime}
                    onPlayToggle={onTogglePlay}
                    onSeekMouseDown={onSeekMouseDown}
                    onSeekChange={onSeekChange}
                    onSeekMouseUp={onSeekMouseUp}
                    onVolumeChange={onVolumeChange}
                    onToggleMute={onToggleMute}
                    onPlaybackRateChange={onPlaybackRateChange}
                    onToggleFullscreen={onToggleFullscreen}
                    videoRef={videoRef}
                />
            )}
        </div>
    );
};

export default VideoPlayer;
