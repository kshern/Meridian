import React, { useCallback, useState } from 'react';
import { PlayIcon, PauseIcon, SpeakerXMarkIcon, SpeakerWaveIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid';
import styles from './MediaItem.module.scss';

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
    onToggleFullscreen
}) => {
    return (
        <div className={styles.video_controls}>
            <button onClick={onPlayToggle}>
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
                    onMouseDown={onSeekMouseDown}
                    onChange={(e) => onSeekChange(parseFloat(e.target.value))}
                    onMouseUp={(e) => onSeekMouseUp(parseFloat((e.target as HTMLInputElement).value))}
                    style={{ '--progress': `${played * 100}%` } as React.CSSProperties}
                />
            </div>

            <div className={styles.volume_control}>
                <button onClick={onToggleMute}>
                    {muted || volume === 0 ? (
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
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        style={{ '--volume': `${volume * 100}%` } as React.CSSProperties}
                    />
                </div>
            </div>

            <div className={styles.right_controls}>
                <select
                    value={playbackRate}
                    onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
                >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                </select>

                <button onClick={onToggleFullscreen}>
                    {isFullscreen ? (
                        <ArrowsPointingInIcon className="w-5 h-5" />
                    ) : (
                        <ArrowsPointingOutIcon className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};
