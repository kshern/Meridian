import React from 'react';
import { List, AutoSizer } from 'react-virtualized';
import { MediaFile } from '../../../main/fileUtils';
import LazyImage from './LazyImage';
import { FolderIcon, PhotoIcon, DocumentIcon, FilmIcon } from '@heroicons/react/24/outline';

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
  const getFileIcon = (file: MediaFile) => {
    switch (file.type) {
      case 'directory':
        return <FolderIcon className="w-8 h-8 flex-shrink-0" />;
      case 'video':
        return <FilmIcon className="w-8 h-8 flex-shrink-0" />;
      case 'text':
        return <DocumentIcon className="w-8 h-8 flex-shrink-0" />;
      case 'image':
        return <PhotoIcon className="w-8 h-8 flex-shrink-0" />;
      default:
        return <DocumentIcon className="w-8 h-8 flex-shrink-0" />;
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
      className="media-item group"
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
        <div className="flex items-center justify-center h-full bg-surface">
          {getFileIcon(file)}
        </div>
      )}
      <div className="media-item-name">
        {file.name}
      </div>
    </div>
  );

  const renderListItem = (file: MediaFile) => (
    <div
      className="group flex items-center gap-4 h-12 px-6 w-full cursor-pointer transition-colors hover:bg-white/10"
      onClick={() => {
        if (file.type === 'directory') {
          onDirectoryClick?.(file.path);
        } else {
          onFileClick?.(file);
        }
      }}
      title={file.name}
    >
      {getFileIcon(file)}
      <span className="flex-1 truncate hover:text-primary transition-colors">{file.name}</span>
    </div>
  );

  const rowRenderer = ({ index, key, style, width }: any) => {
    if (viewType === 'list') {
      const file = files[index];
      const isOdd = index % 2 === 1;
      const backgroundColor = isOdd ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)';
      return (
        <div key={key} style={{ ...style, backgroundColor }} className="flex items-center">
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
    <div className={`h-full overflow-auto ${viewType}`}>
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
