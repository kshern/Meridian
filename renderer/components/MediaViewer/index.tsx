import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MediaFile } from '../../../main/fileUtils';
import { ArrowsRightLeftIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';
import styles from './index.module.scss';
import { useVolume } from '../../hooks/useVolume';
import { HorizontalViewer } from './components/HorizontalViewer';
import { VerticalViewer } from './components/VerticalViewer';

interface MediaViewerProps {
  files: MediaFile[];
  initialIndex?: number;
}

type LayoutMode = 'horizontal' | 'vertical';

const MediaViewer: React.FC<MediaViewerProps> = ({ files, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (layoutMode === 'horizontal' && !isVideoPlaying) {
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
  }, [layoutMode, isVideoPlaying]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
  };

  const renderLayoutToggle = () => (
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
  );

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        没有找到媒体文件
      </div>
    );
  }

  const sharedProps = {
    files,
    currentIndex,
    onIndexChange: setCurrentIndex,
    onPlayingChange: setIsVideoPlaying,
  };

  return (
    <div className={`${styles.media_viewer} ${styles.fade_in} ${styles[layoutMode]}`}>
      {layoutMode === 'horizontal' ? (
        <HorizontalViewer {...sharedProps} renderLayoutToggle={renderLayoutToggle} />
      ) : (
        <VerticalViewer {...sharedProps} renderLayoutToggle={renderLayoutToggle} />
      )}
    </div>
  );
};

export default MediaViewer;