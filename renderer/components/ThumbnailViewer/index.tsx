import React from 'react';
import { List, AutoSizer } from 'react-virtualized';
import { MediaFile } from '../../../main/fileUtils';
import LazyImage from './LazyImage';
import { FolderIcon, PhotoIcon, DocumentIcon, FilmIcon } from '@heroicons/react/24/outline';
import useTheme from '../../hooks/useTheme';

interface ThumbnailViewerProps {
  files: MediaFile[];
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  viewType: 'grid' | 'list';
}

const ThumbnailViewer: React.FC<ThumbnailViewerProps> = ({
  files,
  onDirectoryClick,
  onFileClick,
  viewType,
}) => {
  const { colors } = useTheme();

  const getFileIcon = (file: MediaFile) => {
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
      case 'video':
        return <FilmIcon className={iconClass} />;
      case 'text':
        return <DocumentIcon className={iconClass} />;
      case 'image':
        return <PhotoIcon className={iconClass} />;
      default:
        return <DocumentIcon className={iconClass} />;
    }
  };

  const getColumnsCount = (width: number) => {
    if (viewType === 'list') return 1;
    return Math.max(Math.floor(width / 200), 2);
  };

  const getRowHeight = (width: number) => {
    if (viewType === 'list') return 48; // 匹配 py-3 (0.75rem * 2 = 24px) + 基础行高 24px
    const columnWidth = width / getColumnsCount(width);
    return columnWidth + 40;
  };

  const renderGridItem = (file: MediaFile) => (
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
  );

  const renderListItem = (file: MediaFile) => (
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
  );

  const rowRenderer = ({ index, key, style, width }: any) => {
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
          {renderListItem(file)}
        </div>
      );
    }

    const columnsCount = getColumnsCount(width);
    const startIdx = index * columnsCount;
    const rowFiles = files.slice(startIdx, startIdx + columnsCount);
    const columnWidth = (width - 40 - (columnsCount - 1) * 10) / columnsCount; // 减去总padding和间隔的宽度

    return (
      <div key={key} style={{ ...style, display: 'flex', gap: '10px', padding: '20px' }}>
        {rowFiles.map((file) => (
          <div key={file.path} style={{ width: columnWidth, minWidth: columnWidth, maxWidth: columnWidth }}>
            {renderGridItem(file)}
          </div>
        ))}
      </div>
    );
  };

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
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default ThumbnailViewer;
