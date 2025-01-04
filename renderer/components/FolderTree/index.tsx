import React, { useState, useEffect } from 'react';
import { FolderIcon, ChevronRightIcon, ChevronDownIcon, PhotoIcon, FilmIcon, DocumentTextIcon, DocumentIcon } from '@heroicons/react/24/outline';
import path from 'path';
import useTheme from '../../hooks/useTheme';
import { naturalCompare } from '../../utils/sorting';
import ContextMenu from '../ContextMenu';
import { useContextMenu } from '../ContextMenu/hooks';
import { useFileContextMenu } from '../../hooks/useFileContextMenu';

interface FolderTreeProps {
  onSelect: (path: string) => void;
  showMediaOnly?: boolean;
  currentPath?: string;
  sortByTime?: boolean;
}

interface TreeItem {
  name: string;
  path: string;
  type: 'directory' | 'image' | 'video' | 'text';
  isExpanded?: boolean;
  children?: TreeItem[];
  size?: number;
  modifiedTime?: Date;
}

interface TreeNodeProps {
  item: TreeItem;
  level?: number;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  showMediaOnly?: boolean;
  currentPath?: string;
}

const FileIcon = ({ type }: { type: string }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  switch (type) {
    case 'directory':
      return <FolderIcon className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'} flex-shrink-0`} />;
    case 'image':
      return <PhotoIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-500'} flex-shrink-0`} />;
    case 'video':
      return <FilmIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-500'} flex-shrink-0`} />;
    case 'text':
      return <DocumentTextIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />;
    default:
      return <DocumentIcon className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0`} />;
  }
};

const TreeNode: React.FC<TreeNodeProps> = ({ 
  item, 
  level = 0, 
  onSelect, 
  onToggle, 
  showMediaOnly,
  currentPath
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const { getContextMenuItems } = useFileContextMenu();

  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    showContextMenu(e, getContextMenuItems({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size,
      modifiedTime: item.modifiedTime || new Date()
    }));
  };

  const isSelected = currentPath === item.path;
  const paddingLeft = level * 16 + 8 + 'px';

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (!item) return null;

  return (
    <>
      <div
        className={`flex items-center py-1.5 px-2 cursor-pointer rounded-md mx-1 my-0.5 group transition-colors duration-150
          ${isSelected 
            ? isDark 
              ? 'bg-gray-700 text-gray-100' 
              : 'bg-gray-200 text-gray-900'
            : isDark
              ? 'text-gray-300 hover:bg-gray-700/50'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        style={{ paddingLeft }}
        onClick={() => onSelect(item.path)}
        onContextMenu={handleContextMenu}
        title={item.type === 'directory' 
          ? item.name
          : `${item.name}${item.size ? '\n' + formatFileSize(item.size) : ''}`}
      >
        <div className="flex items-center min-w-0 flex-1">
          {item.type === 'directory' && (
            <button
              className={`p-0.5 rounded-sm mr-1 transition-colors
                ${isDark 
                  ? 'hover:bg-gray-600 text-gray-400' 
                  : 'hover:bg-gray-200 text-gray-500'
                }`}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item.path);
              }}
            >
              {item.isExpanded ? (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronRightIcon className="w-3.5 h-3.5" />
              )}
            </button>
          )}
          <FileIcon type={item.type} />
          <span className="ml-1.5 truncate text-sm">
            {item.name}
          </span>
          {item.size && item.type !== 'directory' && (
            <span className={`ml-auto text-xs tabular-nums pl-3
              ${isDark ? 'text-gray-500' : 'text-gray-400'}
            `}>
              {formatFileSize(item.size)}
            </span>
          )}
        </div>
      </div>
      {item.isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <TreeNode
              key={child.path}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              showMediaOnly={showMediaOnly}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={hideContextMenu}
        />
      )}
    </>
  );
};

const FolderTree: React.FC<FolderTreeProps> = ({ onSelect, showMediaOnly, currentPath, sortByTime }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [folders, setFolders] = useState<TreeItem[]>([]);

  const loadDrives = async (): Promise<TreeItem[]> => {
    try {
      const drives = await window.ipc.getDrives();
      return drives.map(drive => ({
        name: drive,
        path: drive,  
        type: 'directory',
        isExpanded: false,
        children: []
      }));
    } catch (error) {
      console.error('Error loading drives:', error);
      return [];
    }
  };

  useEffect(() => {
    loadDrives().then(setFolders);
  }, []); // 只在组件挂载时加载驱动器列表

  const loadFolders = async (parentPath: string): Promise<TreeItem[]> => {
    try {
      const systemPath = window.ipc.convertToSystemPath(parentPath);
      console.log('Loading folders for path:', systemPath);

      const normalizedPath = systemPath.match(/^[A-Z]:$/) 
        ? systemPath + '\\'
        : systemPath;

      console.log('Normalized path:', normalizedPath);
      const items = await window.ipc.scanDirectory(normalizedPath);
      console.log('Scan results:', items);

      const mappedItems = items.map((item: any) => ({
        name: item.name,
        path: window.ipc.convertToAppPath(item.path),
        type: item.type,
        ...(item.type !== 'directory' && { size: item.size }),
        modifiedTime: item.modifiedTime,
        isExpanded: false,
        children: item.type === 'directory' ? [] : undefined
      }));

      // 对文件列表进行排序
      return sortItems(mappedItems);
    } catch (error) {
      console.error('Error loading folders:', error);
      return [];
    }
  };

  const sortItems = (items: TreeItem[]): TreeItem[] => {
    return [...items].sort((a, b) => {
      // 文件夹始终排在前面
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;

      // 如果都是文件夹或都是文件，按照指定的排序方式排序
      if (sortByTime) {
        // 按修改时间倒序
        const timeA = a.modifiedTime?.getTime() || 0;
        const timeB = b.modifiedTime?.getTime() || 0;
        return timeB - timeA;
      } else {
        // 按文件名正序（使用自然排序）
        return naturalCompare(a.name, b.name);
      }
    });
  };

  const handleToggle = async (folderPath: string) => {
    console.log('Toggle folder:', folderPath); // 添加日志
    const updateFolders = async (items: TreeItem[]): Promise<TreeItem[]> => {
      return await Promise.all(
        items.map(async (item) => {
          if (item.path === folderPath) {
            const newIsExpanded = !item.isExpanded;
            // 如果已经展开并且需要加载子文件夹
            if (newIsExpanded && (!item.children || item.children.length === 0)) {
              console.log('Loading children for:', item.path); // 添加日志
              const children = await loadFolders(item.path);
              console.log('Loaded children:', children); // 添加日志
              return {
                ...item,
                isExpanded: newIsExpanded,
                children
              };
            }
            return {
              ...item,
              isExpanded: newIsExpanded
            };
          }
          if (item.children) {
            return {
              ...item,
              children: await updateFolders(item.children)
            };
          }
          return item;
        })
      );
    };

    try {
      const updatedFolders = await updateFolders(folders);
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Error updating folders:', error);
    }
  };

  return (
    <div className={`h-full overflow-auto ${isDark ? 'bg-gray-800' : 'bg-white'} ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      {sortItems(folders).map((folder) => (
        <TreeNode
          key={folder.path}
          item={folder}
          onSelect={onSelect}
          onToggle={handleToggle}
          level={0}
          showMediaOnly={showMediaOnly}
          currentPath={currentPath}
        />
      ))}
    </div>
  );
};

export default FolderTree;
