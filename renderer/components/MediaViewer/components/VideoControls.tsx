import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
    PlayIcon,
    PauseIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ArrowsPointingOutIcon,
} from '@heroicons/react/24/solid';
import styles from './VideoControls.module.scss';
import { VideoPreview } from './VideoPreview';
import { PLAYBACK_RATES } from '../utils/constants';

interface VideoControlsProps {
    isPlaying: boolean;
    played: number;
    volume: number;
    muted: boolean;
    playbackRate: number;
    isFullscreen: boolean;
    getCurrentTime: () => string;
    onPlayToggle: () => void;
    onSeekMouseDown: () => void;
    onSeekChange: (value: number) => void;
    onSeekMouseUp: (value: number) => void;
    onVolumeChange: (value: number) => void;
    onToggleMute: () => void;
    onPlaybackRateChange: (rate: number) => void;
    onToggleFullscreen: () => void;
    videoRef: React.RefObject<HTMLVideoElement>;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
    isPlaying,
    played,
    volume,
    muted,
    playbackRate,
    isFullscreen,
    getCurrentTime,
    onPlayToggle,
    onSeekMouseDown,
    onSeekChange,
    onSeekMouseUp,
    onVolumeChange,
    onToggleMute,
    onPlaybackRateChange,
    onToggleFullscreen,
    videoRef,
}) => {
    const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);
    const [previewTime, setPreviewTime] = useState<number>(0);
    const [showControls, setShowControls] = useState(false);
    const [isProgressBarDragging, setIsProgressBarDragging] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // 根据播放状态和鼠标移动控制显示
    useEffect(() => {
        if (!isPlaying || isProgressBarDragging) {
            setShowControls(true);
        } else if (!previewPosition) {
            setShowControls(false);
        }
    }, [isPlaying, previewPosition, isProgressBarDragging]);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        if (isPlaying && !isProgressBarDragging) {
            controlsTimeoutRef.current = setTimeout(() => {
                if (!previewPosition) {
                    setShowControls(false);
                }
            }, 2000);
        }
    }, [isPlaying, previewPosition, isProgressBarDragging]);

    const handleMouseLeave = useCallback(() => {
        if (isPlaying && !previewPosition) {
            setShowControls(false);
        }
    }, [isPlaying, previewPosition]);

    const handleSeekHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current || !progressBarRef.current || isProgressBarDragging) return;

        const bounds = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const percentage = x / bounds.width;
        const time = videoRef.current.duration * percentage;

        setPreviewPosition({ x: e.clientX, y: bounds.top });
        setPreviewTime(time);
    }, [isProgressBarDragging]);

    const handleSeekLeave = useCallback(() => {
        if (!isProgressBarDragging) {
            setPreviewPosition(null);
            setPreviewTime(0);
        }
    }, [isProgressBarDragging]);

    const handleSeekMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current) return;
        
        setIsProgressBarDragging(true);
        onSeekMouseDown();

        const bounds = progressBarRef.current.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const percentage = x / bounds.width;
        onSeekChange(percentage);
    }, [onSeekMouseDown, onSeekChange]);

    const handleSeekMouseMove = useCallback((e: MouseEvent) => {
        if (!isProgressBarDragging || !progressBarRef.current) return;

        const bounds = progressBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - bounds.left, bounds.width));
        const percentage = x / bounds.width;
        onSeekChange(percentage);

        // 更新预览位置
        setPreviewPosition({ x: e.clientX, y: bounds.top });
        if (videoRef.current) {
            setPreviewTime(videoRef.current.duration * percentage);
        }
    }, [isProgressBarDragging, onSeekChange, videoRef]);

    const handleSeekMouseUp = useCallback((e: MouseEvent) => {
        if (!isProgressBarDragging || !progressBarRef.current) return;

        const bounds = progressBarRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - bounds.left, bounds.width));
        const percentage = x / bounds.width;
        
        setIsProgressBarDragging(false);
        onSeekMouseUp(percentage);
        setPreviewPosition(null);
        setPreviewTime(0);
    }, [isProgressBarDragging, onSeekMouseUp]);

    // 添加全局鼠标事件监听
    useEffect(() => {
        if (isProgressBarDragging) {
            document.addEventListener('mousemove', handleSeekMouseMove);
            document.addEventListener('mouseup', handleSeekMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleSeekMouseMove);
            document.removeEventListener('mouseup', handleSeekMouseUp);
        };
    }, [isProgressBarDragging, handleSeekMouseMove, handleSeekMouseUp]);

    return (
        <div 
            className={`${styles.controls_container} ${showControls ? styles.visible : ''}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {videoRef.current && previewPosition && (
                <VideoPreview
                    videoElement={videoRef.current}
                    time={previewTime}
                    position={previewPosition}
                />
            )}
            <div className={styles.controls_wrapper}>
                <div className={styles.progress_container}>
                    <div
                        ref={progressBarRef}
                        className={styles.progress_bar}
                        onMouseMove={handleSeekHover}
                        onMouseLeave={handleSeekLeave}
                        onMouseDown={handleSeekMouseDown}
                    >
                        <div
                            className={styles.progress_played}
                            style={{ width: `${played * 100}%` }}
                        />
                    </div>
                </div>
                <div className={styles.buttons_container}>
                    <div className={styles.left_controls}>
                        <button className={styles.control_button} onClick={onPlayToggle}>
                            {isPlaying ? (
                                <PauseIcon className="w-6 h-6" />
                            ) : (
                                <PlayIcon className="w-6 h-6" />
                            )}
                        </button>
                        <button className={styles.control_button} onClick={onToggleMute}>
                            {muted ? (
                                <SpeakerXMarkIcon className="w-6 h-6" />
                            ) : (
                                <SpeakerWaveIcon className="w-6 h-6" />
                            )}
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.1}
                            value={muted ? 0 : volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className={`${styles.volume_slider} ${styles.volume_slider_thumb}`}
                        />
                        <span className={styles.time}>{getCurrentTime()}</span>
                    </div>
                    <div className={styles.right_controls}>
                        <select
                            value={playbackRate}
                            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
                            className={styles.playback_rate}
                        >
                            {PLAYBACK_RATES.map((rate) => (
                                <option key={rate} value={rate} className={styles.playback_option}>
                                    {rate}x
                                </option>
                            ))}
                        </select>
                        <button className={styles.control_button} onClick={onToggleFullscreen}>
                            <ArrowsPointingOutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
