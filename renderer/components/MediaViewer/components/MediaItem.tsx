import React, { useState, useCallback, forwardRef, useEffect, memo } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';
import styles from './MediaItem.module.scss';
import { MediaItemProps } from '../types';
import useVolume from '../../../hooks/useVolume';
import { VideoControls } from './VideoControls';

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
}, ref) => {
  const isImage = file.type === 'image';
  const isCurrent = index === currentIndex;
  const [videoError, setVideoError] = useState<string | null>(null);
  const [played, setPlayed] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [playingStates, setPlayingStates] = useState<{ [key: number]: boolean }>({});

  const { volume, muted, saveVolume, saveMuted } = useVolume();
  const isPlaying = playingStates[index] || false;
  const imageClasses = [
    isDragging && 'dragging',
    rotation !== 0 && 'rotating'
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

  const getCurrentTime = useCallback(() => {
    const video = document.querySelector('video');
    if (video) {
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

      return formatTime(video.currentTime);
    }
    return '0:00';
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const videoContainer = document.querySelector(`.${styles.media_container}`);
    if (!document.fullscreenElement && videoContainer) {
      videoContainer.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const togglePlay = useCallback((index: number) => {
    setPlayingStates(prev => {
      const newStates = { ...prev };
      Object.keys(prev).forEach(key => {
        newStates[parseInt(key)] = false;
      });
      newStates[index] = !prev[index];
      return newStates;
    });
  }, []);

  const handleVolumeChange = (value: number) => {
    saveVolume(value);
    if (value === 0) {
      saveMuted(true);
    } else {
      saveMuted(false);
    }
  };

  const handleToggleMute = () => {
    saveMuted(!muted);
  };

  return (
    <div
      className={`${styles.media_item} ${isCurrent ? styles.current : ''}`}
      data-index={index}
      onMouseDown={isCurrent && isImage && handleMouseDown ? handleMouseDown : undefined}
      onMouseMove={isCurrent && isImage && handleMouseMove ? handleMouseMove : undefined}
      onMouseUp={isCurrent && isImage && handleMouseUp ? handleMouseUp : undefined}
    >
      {isImage ? (
        <img
          ref={isCurrent ? ref : null}
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
              playing={isPlaying}
              loop={false}
              playbackRate={playbackRate}
              volume={volume}
              muted={muted}
              style={{ maxHeight: '100%' }}
              onProgress={isCurrent ? handleProgress : undefined}
              onError={(error) => {
                console.error('Video playback error:', error);
                setVideoError('无法播放此视频，可能是由于缺少所需的编解码器。请安装相应的编解码器后重试。');
              }}
              progressInterval={1000}
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
          {!isPlaying && isCurrent && !videoError && (
            <div
              className={styles.center_play_button}
              onClick={() => togglePlay(index)}
            >
              <PlayIcon className="w-16 h-16" />
            </div>
          )}
          {isCurrent && !videoError && (
            <VideoControls
              isPlaying={isPlaying}
              played={played}
              volume={volume}
              muted={muted}
              playbackRate={playbackRate}
              isFullscreen={isFullscreen}
              getCurrentTime={getCurrentTime}
              onPlayToggle={() => togglePlay(index)}
              onSeekMouseDown={handleSeekMouseDown}
              onSeekChange={handleSeekChange}
              onSeekMouseUp={handleSeekMouseUp}
              onVolumeChange={handleVolumeChange}
              onToggleMute={handleToggleMute}
              onPlaybackRateChange={setPlaybackRate}
              onToggleFullscreen={handleToggleFullscreen}
            />
          )}
        </div>
      )}
    </div>
  );
}));

MediaItem.displayName = 'MediaItem';

export default MediaItem;
