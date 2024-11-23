import React, { useMemo, useCallback } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import { MediaFile } from '../../../main/fileUtils';
import { FolderIcon, PhotoIcon, DocumentIcon, FilmIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import useTheme from '../../hooks/useTheme';
import ListItem from './ListViewItem';
import GridItem from './GridViewItem';

interface ThumbnailViewerProps {
  files: MediaFile[];
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  viewType: 'grid' | 'list';
}

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
          return colors.textIcon;
        case 'other':
        default:
          return 'text-gray-400';
      }
    };

    const iconClass = `w-8 h-8 flex-shrink-0 ${getIconColor(file.type)}`;
    
    switch (file.type) {
      case 'directory':
        return <FolderIcon className={iconClass} />;
      case 'image':
        return <PhotoIcon className={iconClass} />;
      case 'video':
        return <FilmIcon className={iconClass} />;
      case 'text':
        return <DocumentTextIcon className={iconClass} />;
      case 'other':
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

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-gray-400">
        <p>暂无文件</p>
      </div>
    );
  }

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
              overscanRowCount={5}
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
