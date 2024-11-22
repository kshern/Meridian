import React, { useState, useEffect } from 'react';
import { FolderIcon, ChevronRightIcon, ChevronDownIcon, PhotoIcon, FilmIcon, DocumentTextIcon, DocumentIcon } from '@heroicons/react/24/outline';
import path from 'path';
import useTheme from '../../hooks/useTheme';

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
  const { colors } = useTheme();
  
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

  const iconClass = `w-5 h-5 flex-shrink-0 ${getIconColor(type)}`;

  switch (type) {
    case 'directory':
      return <FolderIcon className={iconClass} />;
    case 'image':
      return <PhotoIcon className={iconClass} />;
    case 'video':
      return <FilmIcon className={iconClass} />;
    case 'text':
      return <DocumentTextIcon className={iconClass} />;
    default:
      return <DocumentIcon className={iconClass} />;
  }
};

const TreeNode = ({ item, level = 0, onSelect, onToggle }: { item: TreeItem; level?: number; onSelect: (path: string) => void; onToggle: (path: string) => void }) => {
  const { colors } = useTheme();
  const indent = level * 20;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'directory') {
      if (!item.isExpanded) {
        onToggle(item.path);
      }
      onSelect(window.ipc.convertToSystemPath(item.path));
    } else if (item.type === 'image' || item.type === 'video') {
      try {
        const file = {
          name: item.name,
          path: window.ipc.convertToSystemPath(item.path),
          type: item.type,
          size: item.size || 0,
          modifiedTime: item.modifiedTime || new Date()
        };
        await window.ipc.handleFileClick(file);
      } catch (error) {
        console.error('Error handling file click:', error);
      }
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(item.path);
  };

  return (
    <div>
      <div
        className={`
          flex items-center py-1.5 px-3 
          ${colors.backgroundHover}
          cursor-pointer transition-colors duration-200
          rounded-lg mx-1 my-0.5
          ${item.type === 'directory' ? 'font-medium' : 'font-normal'}
          ${colors.textSecondary}
        `}
        style={{ paddingLeft: `${indent + 12}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center flex-1 min-w-0 space-x-2">
          {item.type === 'directory' && (
            <div 
              className={`p-0.5 -ml-1 ${colors.backgroundHover} rounded-sm cursor-pointer`}
              onClick={handleToggleClick}
            >
              {item.isExpanded ? (
                <ChevronDownIcon className={`w-3.5 h-3.5 ${colors.icon}`} />
              ) : (
                <ChevronRightIcon className={`w-3.5 h-3.5 ${colors.icon}`} />
              )}
            </div>
          )}
          <FileIcon type={item.type} />
          <span className={`truncate text-sm ${colors.textSecondary} ${colors.textHover}`}>
            {item.name}
          </span>
          {item.size && item.type !== 'directory' && (
            <span className={`ml-auto text-xs ${colors.textTertiary} tabular-nums`}>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const FolderTree: React.FC<FolderTreeProps> = ({ onSelect }) => {
  const { colors } = useTheme();
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
    <div className={`h-full overflow-auto ${colors.background} ${colors.text}`}>
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
