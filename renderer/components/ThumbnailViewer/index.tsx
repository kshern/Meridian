import React, { useMemo, useCallback } from 'react';
import { List, AutoSizer } from 'react-virtualized';
import { MediaFile } from '../../../main/fileUtils';
import {
  FolderIcon,
  PhotoIcon,
  DocumentIcon,
  FilmIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import useTheme from '../../hooks/useTheme';
import ListItem from './ListViewItem';
import GridItem from './GridViewItem';
import ContextMenu from '../ContextMenu';
import { useContextMenu } from '../ContextMenu/hooks';
import { useFileContextMenu } from '../../hooks/useFileContextMenu';
import InputDialog from '../InputDialog';

interface ThumbnailViewerProps {
  files: MediaFile[];
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  viewType: 'grid' | 'list';
  currentPath: string;
}

const ThumbnailViewer: React.FC<ThumbnailViewerProps> = ({ files, onDirectoryClick, onFileClick, viewType, currentPath }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const {
    getContextMenuItems,
    getEmptyContextMenuItems,
    handleConfirm,
    handleCancel,
    validateFileName,
    operation
  } = useFileContextMenu();

  const getFileIcon = useCallback((file: MediaFile) => {
    const getIconColor = (type: string) => {
      switch (type) {
        case 'directory':
          return isDark ? 'text-gray-400' : 'text-gray-600';
        case 'image':
          return isDark ? 'text-gray-400' : 'text-gray-600';
        case 'video':
          return isDark ? 'text-gray-400' : 'text-gray-600';
        case 'text':
          return isDark ? 'text-gray-400' : 'text-gray-600';
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
  }, [isDark]);

  const getColumnsCount = useCallback((width: number) => {
    if (viewType === 'list') return 1;
    return Math.max(Math.floor(width / 200), 2);
  }, [viewType]);

  const getRowHeight = useCallback((width: number) => {
    if (viewType === 'list') return 48;
    const columnWidth = width / getColumnsCount(width);
    return columnWidth + 40;
  }, [viewType, getColumnsCount]);

  // 处理文件/文件夹的右键菜单
  const handleContextMenu = useCallback((file: MediaFile, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e, getContextMenuItems(file));
  }, [showContextMenu, getContextMenuItems]);

  // 处理空白区域的右键菜单
  const handleEmptyAreaContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPath) {
      showContextMenu(e, getEmptyContextMenuItems(currentPath));
    }
  }, [showContextMenu, getEmptyContextMenuItems, currentPath]);

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
          onContextMenu={(e) => handleContextMenu(file, e)}
        >
          <ListItem
            file={file}
            onDirectoryClick={onDirectoryClick}
            onFileClick={onFileClick}
            getFileIcon={getFileIcon}
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
          <div
            key={file.path}
            style={{ width: columnWidth, minWidth: columnWidth, maxWidth: columnWidth }}
            onContextMenu={(e) => handleContextMenu(file, e)}
          >
            <GridItem
              file={file}
              onDirectoryClick={onDirectoryClick}
              onFileClick={onFileClick}
              getFileIcon={getFileIcon}
            />
          </div>
        ))}
      </div>
    );
  }, [files, viewType, getColumnsCount, onDirectoryClick, onFileClick, getFileIcon, isDark, handleContextMenu]);

  if (files.length === 0) {
    return (
      <div 
        className={`h-full flex items-center justify-center ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}
        onContextMenu={handleEmptyAreaContextMenu}
      >
        <div className="text-center">
          <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">此文件夹为空</p>
        </div>
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={contextMenu.items}
            onClose={hideContextMenu}
          />
        )}
        {operation && (
          <InputDialog
            isOpen={true}
            title={operation.type === 'newFolder' ? '新建文件夹' : '重命名'}
            defaultValue={operation.type === 'rename' && operation.file ? operation.file.name : ''}
            placeholder={operation.type === 'newFolder' ? '请输入文件夹名称' : '请输入新的名称'}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            validation={validateFileName}
          />
        )}
      </div>
    );
  }

  return (
    <div 
      className={`h-full ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}
      onContextMenu={handleEmptyAreaContextMenu}
    >
      <AutoSizer>
        {({ width, height }) => {
          const columnsCount = getColumnsCount(width);
          const rowHeight = getRowHeight(width);
          const rowCount = viewType === 'list' ? files.length : Math.ceil(files.length / columnsCount);

          return (
            <>
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
              {contextMenu && (
                <ContextMenu
                  x={contextMenu.x}
                  y={contextMenu.y}
                  items={contextMenu.items}
                  onClose={hideContextMenu}
                />
              )}
              {operation && (
                <InputDialog
                  isOpen={true}
                  title={operation.type === 'newFolder' ? '新建文件夹' : '重命名'}
                  defaultValue={operation.type === 'rename' && operation.file ? operation.file.name : ''}
                  placeholder={operation.type === 'newFolder' ? '请输入文件夹名称' : '请输入新的名称'}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                  validation={validateFileName}
                />
              )}
            </>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default React.memo(ThumbnailViewer);
