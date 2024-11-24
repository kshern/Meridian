import React, { useState } from 'react';
import { PlayIcon, PauseIcon, SpeakerXMarkIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import ReactPlayer from 'react-player';
import styles from '../index.module.scss';
import { MediaFile } from '@/main/fileUtils';

interface MediaItemProps {
  file: MediaFile;
  index: number;
  currentIndex: number;
  isDragging: boolean;
  rotation: number;
  scale: number;
  position: { x: number; y: number };
  layoutMode: 'horizontal' | 'vertical';
  playingStates: { [key: number]: boolean };
  playbackRate: number;
  volume: number;
  muted: boolean;
  aspectRatio: string;
  played: number;
  videoError: { [key: number]: string };
  mediaRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
  currentItemRef: React.MutableRefObject<HTMLDivElement | null>;
  imageRef: React.MutableRefObject<HTMLImageElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: (e: React.MouseEvent) => void;
  handleWheel: (e: React.WheelEvent) => void;
  togglePlay: (index: number) => void;
  handleProgress: (state: { played: number }) => void;
  handleSeekMouseDown: () => void;
  handleSeekChange: (value: number) => void;
  handleSeekMouseUp: (value: number) => void;
  handleToggleMute: () => void;
  handleVolumeChange: (value: number) => void;
  getCurrentTime: () => string;
  setVideoError: (value: string) => void;
}

const MediaItem: React.FC<MediaItemProps> = ({
  file,
  index,
  currentIndex,
  isDragging,
  rotation,
  scale,
  position,
  layoutMode,
  playingStates,
  playbackRate,
  volume,
  muted,
  aspectRatio,
  played,
  videoError,
  mediaRefs,
  currentItemRef,
  imageRef,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  handleWheel,
  togglePlay,
  handleProgress,
  handleSeekMouseDown,
  handleSeekChange,
  handleSeekMouseUp,
  handleToggleMute,
  handleVolumeChange,
  getCurrentTime,
  setVideoError,
}) => {
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
              muted={muted}
              style={{ maxHeight: '100%', aspectRatio }}
              onProgress={isCurrent ? handleProgress : undefined}
              onError={(error) => {
                console.error('Video playback error:', error);
                setVideoError(prev => ({
                  ...prev,
                  [index]: '无法播放此视频，可能是由于缺少所需的编解码器。请安装相应的编解码器后重试。'
                }));
              }}
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
          {videoError[index] && (
            <div className={styles.error_message}>
              {videoError[index]}
            </div>
          )}
          {!isPlaying && isCurrent && !videoError[index] && (
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
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    style={{ '--volume': `${volume * 100}%` } as React.CSSProperties}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaItem;
