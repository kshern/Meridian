import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import { MediaFile } from '../../../main/fileUtils';
import LazyImage from './LazyImage';
import { FolderIcon, PhotoIcon, DocumentIcon, PlayIcon } from '@heroicons/react/24/outline';
import useTheme from '../../hooks/useTheme';

interface ThumbnailViewerProps {
  files: MediaFile[];
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  viewType: 'grid' | 'list';
}

const VideoThumbnail: React.FC<{
  videoPath: string;
  className?: string;
}> = React.memo(({ videoPath, className }) => {
  const [thumbnailPath, setThumbnailPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadThumbnail = async () => {
      try {
        setIsLoading(true);
        const path = await window.ipc.getVideoThumbnail(videoPath);
        if (path) {
          setThumbnailPath(`file://${path}`);
        } else {
          setError('Failed to generate thumbnail');
        }
      } catch (error) {
        console.error('Error loading video thumbnail:', error);
        setError('Error loading thumbnail');
      } finally {
        setIsLoading(false);
      }
    };

    loadThumbnail();
  }, [videoPath]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className} bg-gray-800`}>
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !thumbnailPath) {
    return (
      <div className={`flex items-center justify-center h-full ${className} bg-gray-800`}>
        <span className="text-sm text-gray-400">{error || 'No thumbnail'}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <LazyImage src={thumbnailPath} alt="Video thumbnail" className={className} />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
          <PlayIcon className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white/90">
        Video
      </div>
    </div>
  );
});

const GridItem: React.FC<{ 
  file: MediaFile; 
  onDirectoryClick: (path: string) => void; 
  onFileClick: (file: MediaFile) => void; 
  getFileIcon: (file: MediaFile) => JSX.Element;
  colors: any;
}> = React.memo(({ file, onDirectoryClick, onFileClick, getFileIcon, colors }) => (
  <div
    className="media-item group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    onClick={() => {
      if (file.type === 'directory') {
        onDirectoryClick?.(file.path);
      } else {
        onFileClick?.(file);
      }
    }}
    title={file.name}
  >
    {file.type === 'image' ? (
      <LazyImage
        src={`file://${file.path}`}
        alt={file.name}
        className="w-full h-full object-cover"
      />
    ) : file.type === 'video' ? (
      <VideoThumbnail
        videoPath={file.path}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className={`flex items-center justify-center h-full ${colors.backgroundSecondary} backdrop-blur-sm`}>
        <div className="transition-colors">
          {getFileIcon(file)}
        </div>
      </div>
    )}
    <div className={`absolute bottom-0 left-0 right-0 px-3 py-2 ${colors.overlay} backdrop-blur-sm`}>
      <p className="text-sm truncate text-white/90 group-hover:text-white transition-colors">
        {file.name}
      </p>
    </div>
  </div>
));

const ListItem: React.FC<{
  file: MediaFile;
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  getFileIcon: (file: MediaFile) => JSX.Element;
  colors: any;
}> = React.memo(({ file, onDirectoryClick, onFileClick, getFileIcon, colors }) => (
  <div
    className={`group flex items-center gap-4 h-12 px-4 w-full cursor-pointer transition-all duration-200 ${colors.backgroundHover}`}
    onClick={() => {
      if (file.type === 'directory') {
        onDirectoryClick?.(file.path);
      } else {
        onFileClick?.(file);
      }
    }}
    title={file.name}
  >
    <div className="transition-colors">
      {getFileIcon(file)}
    </div>
    <span className={`flex-1 truncate transition-colors ${colors.textSecondary} ${colors.textHover}`}>
      {file.name}
    </span>
  </div>
));

const ThumbnailViewer: React.FC<ThumbnailViewerProps> = ({ files, onDirectoryClick, onFileClick, viewType }) => {
  const { colors } = useTheme();

  const getFileIcon = useCallback((file: MediaFile) => {
    const getIconColor = (type: string) => {
      switch (type) {
        case 'directory':
          return colors.folderIcon;
        case 'image':
          return colors.imageIcon;
        case 'video':
          return colors.videoIcon;
        case 'text':
        default:
          return colors.textIcon;
      }
    };

    const iconClass = `w-8 h-8 flex-shrink-0 ${getIconColor(file.type)}`;
    
    switch (file.type) {
      case 'directory':
        return <FolderIcon className={iconClass} />;
      case 'text':
        return <DocumentIcon className={iconClass} />;
      case 'image':
        return <PhotoIcon className={iconClass} />;
      default:
        return <DocumentIcon className={iconClass} />;
    }
  }, [colors]);

  const getColumnsCount = useCallback((width: number) => {
    if (viewType === 'list') return 1;
    return Math.max(Math.floor(width / 200), 2);
  }, [viewType]);

  const getRowHeight = useCallback((width: number) => {
    if (viewType === 'list') return 48;
    const columnWidth = width / getColumnsCount(width);
    return columnWidth + 40;
  }, [viewType, getColumnsCount]);

  const rowRenderer = useCallback(({ index, key, style, width }: any) => {
    if (viewType === 'list') {
      const file = files[index];
      const isOdd = index % 2 === 1;
      const backgroundColor = isOdd 
        ? 'rgba(128, 128, 128, 0.03)' 
        : 'rgba(128, 128, 128, 0.01)';
      
      return (
        <div 
          key={key} 
          style={{ 
            ...style, 
            backgroundColor
          }} 
          className="flex items-center"
        >
          <ListItem
            file={file}
            onDirectoryClick={onDirectoryClick}
            onFileClick={onFileClick}
            getFileIcon={getFileIcon}
            colors={colors}
          />
        </div>
      );
    }

    const columnsCount = getColumnsCount(width);
    const startIdx = index * columnsCount;
    const rowFiles = files.slice(startIdx, startIdx + columnsCount);
    const columnWidth = (width - 40 - (columnsCount - 1) * 10) / columnsCount;

    return (
      <div key={key} style={{ ...style, display: 'flex', gap: '10px', padding: '20px' }}>
        {rowFiles.map((file) => (
          <div key={file.path} style={{ width: columnWidth, minWidth: columnWidth, maxWidth: columnWidth }}>
            <GridItem
              file={file}
              onDirectoryClick={onDirectoryClick}
              onFileClick={onFileClick}
              getFileIcon={getFileIcon}
              colors={colors}
            />
          </div>
        ))}
      </div>
    );
  }, [files, viewType, getColumnsCount, getFileIcon, colors, onDirectoryClick, onFileClick]);

  return (
    <div className={`h-full ${colors.background}`}>
      <AutoSizer>
        {({ width, height }) => {
          const columnsCount = getColumnsCount(width);
          const rowHeight = getRowHeight(width);
          const rowCount = viewType === 'list' ? files.length : Math.ceil(files.length / columnsCount);

          return (
            <List
              width={width}
              height={height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              rowRenderer={(props) => rowRenderer({ ...props, width })}
              overscanRowCount={3}
              scrollToAlignment="auto"
              style={{ outline: 'none' }}
              containerStyle={{ outline: 'none' }}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default React.memo(ThumbnailViewer);
