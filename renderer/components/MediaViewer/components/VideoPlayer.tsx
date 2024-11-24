import React from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';
import styles from './MediaItem.module.scss';
import { VideoControls } from './VideoControls';
import { CSS_CLASSES, PROGRESS_INTERVAL } from '../utils/constants';

interface VideoPlayerProps {
    path: string;
    isPlaying: boolean;
    playbackRate: number;
    volume: number;
    muted: boolean;
    played: number;
    isFullscreen: boolean;
    videoError: string | null;
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
}) => {
    return (
        <div className={`${styles.media_container} ${!isPlaying ? CSS_CLASSES.PAUSED : ''}`}>
            <div
                className={styles.video_wrapper}
                onClick={onTogglePlay}
            >
                <ReactPlayer
                    url={`file://${path}`}
                    playing={isPlaying}
                    loop={false}
                    playbackRate={playbackRate}
                    volume={volume}
                    muted={muted}
                    style={{ maxHeight: '100%' }}
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
                />
            )}
        </div>
    );
};

export default VideoPlayer;
