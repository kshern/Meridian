import React, { useState, useEffect } from 'react';
import { FolderIcon, ChevronRightIcon, ChevronDownIcon, PhotoIcon, FilmIcon, DocumentTextIcon, DocumentIcon } from '@heroicons/react/24/outline';
import path from 'path';

interface FolderTreeProps {
  onSelect: (path: string) => void;
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

const FileIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'directory':
      return <FolderIcon className="w-5 h-5 text-yellow-500" />;
    case 'image':
      return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    case 'video':
      return <FilmIcon className="w-5 h-5 text-purple-500" />;
    case 'text':
      return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
    default:
      return <DocumentIcon className="w-5 h-5 text-gray-400" />;
  }
};

const TreeNode = ({ item, level = 0, onSelect, onToggle }: { item: TreeItem; level?: number; onSelect: (path: string) => void; onToggle: (path: string) => void }) => {
  const indent = level * 20;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(window.ipc.convertToSystemPath(item.path));
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(item.path);
  };

  return (
    <div>
      <div
        className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer"
        style={{ paddingLeft: `${indent}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center flex-1 min-w-0">
          {item.type === 'directory' && (
            <button
              onClick={handleToggleClick}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              {item.isExpanded ? (
                <ChevronDownIcon className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 mr-1" />
              )}
            </button>
          )}
          <FileIcon type={item.type} />
          <span className="ml-2 truncate">{item.name}</span>
          {item.size && item.type !== 'directory' && (
            <span className="ml-2 text-xs text-gray-500">
              {formatFileSize(item.size)}
            </span>
          )}
        </div>
      </div>
      {item.isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <TreeNode
              key={child.path + index}
              item={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 文件大小格式化函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const FolderTree: React.FC<FolderTreeProps> = ({ onSelect }) => {
  const [folders, setFolders] = useState<TreeItem[]>([]);

  const loadDrives = async (): Promise<TreeItem[]> => {
    try {
      const drives = await window.ipc.getDrives();
      return drives.map(drive => ({
        name: drive,
        path: window.ipc.convertToAppPath(drive + '\\'),
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

      return items.map((item: any) => ({
        name: item.name,
        path: window.ipc.convertToAppPath(item.path),
        type: item.type,
        ...(item.type !== 'directory' && { size: item.size }),
        modifiedTime: item.modifiedTime,
        isExpanded: false,
        children: item.type === 'directory' ? [] : undefined
      }));
    } catch (error) {
      console.error('Error loading folders:', error);
      return [];
    }
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
    <div className="h-full overflow-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {folders.map((folder) => (
        <TreeNode
          key={folder.path}
          item={folder}
          level={0}
          onSelect={onSelect}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
};

export default FolderTree;
