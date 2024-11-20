import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { MediaFile } from '../../main/fileUtils';

interface MediaViewerProps {
  files: MediaFile[];
  initialIndex?: number;
  onDirectoryClick?: (path: string) => void;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ files, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // 当 initialIndex 改变时更新 currentIndex
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [files, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-secondary">
        没有找到媒体文件
      </div>
    );
  }

  const currentFile = files[currentIndex];

  return (
    <div className="relative h-full bg-background fade-in">
      {/* 导航信息 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-background/80 to-transparent">
        <div className="text-text-secondary">
          {currentIndex + 1} / {files.length}
        </div>
        <div className="text-text truncate max-w-[50%]">
          {currentFile.name}
        </div>
      </div>

      {/* 左右箭头 */}
      <button
        onClick={handlePrevious}
        className="absolute left-0 top-1/2 -translate-y-1/2 btn bg-background/50 hover:bg-background/80 rounded-r-lg z-10"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 btn bg-background/50 hover:bg-background/80 rounded-l-lg z-10"
      >
        ▶
      </button>

      {/* 媒体内容 */}
      <div className="flex items-center justify-center h-full p-8">
        {currentFile.type === 'image' && (
          <img
            src={`file://${currentFile.path}`}
            alt={currentFile.name}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
        )}
        {currentFile.type === 'video' && (
          <div className="w-full h-full flex items-center justify-center">
            <ReactPlayer
              url={`file://${currentFile.path}`}
              width="100%"
              height="100%"
              controls
              playing={false}
              style={{ maxHeight: '100%' }}
            />
          </div>
        )}
        {currentFile.type === 'text' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              padding: '1rem',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            <pre>{currentFile.content}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
