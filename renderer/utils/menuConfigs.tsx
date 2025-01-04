import React from 'react';
import {
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  ClipboardIcon,
  ArrowPathIcon,
  PencilIcon,
  PlayIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  FolderPlusIcon,
} from '@heroicons/react/24/outline';
import { MenuItem } from '../components/ContextMenu/types';
import { MediaFile } from '../../main/fileUtils';

// 创建菜单图标的辅助函数
const createMenuIcon = (Icon: any, className: string = 'w-5 h-5') => (
  <Icon className={className} />
);

// 基础菜单项 - 所有类型通用
const getBaseMenuItems = (file: MediaFile): MenuItem[] => [
  {
    label: '在资源管理器中打开',
    icon: createMenuIcon(ArrowTopRightOnSquareIcon),
    onClick: () => {
      const filePath = window.ipc.convertToSystemPath(file.path);
      window.ipc.openInExplorer(filePath);
    }
  },
  {
    label: '复制路径',
    icon: createMenuIcon(ClipboardIcon),
    onClick: () => {
      navigator.clipboard.writeText(window.ipc.convertToSystemPath(file.path));
    }
  },
  {
    label: '重命名',
    icon: createMenuIcon(PencilIcon),
    onClick: () => {
      // TODO: 实现重命名功能
    }
  }
];

// 目录特有的菜单项
const getDirectoryMenuItems = (file: MediaFile): MenuItem[] => [
  {
    label: '刷新',
    icon: createMenuIcon(ArrowPathIcon),
    onClick: () => {
      // TODO: 实现刷新功能
    }
  },
  {
    label: '新建文件夹',
    icon: createMenuIcon(FolderPlusIcon),
    onClick: () => {
      // TODO: 实现新建文件夹功能
    }
  }
];

// 图片文件特有的菜单项
const getImageMenuItems = (file: MediaFile): MenuItem[] => [
  {
    label: '复制',
    icon: createMenuIcon(DocumentDuplicateIcon),
    onClick: () => {
      // TODO: 实现复制功能
    }
  },
  {
    label: '删除',
    icon: createMenuIcon(TrashIcon, 'w-5 h-5 text-red-500'),
    onClick: () => {
      // TODO: 实现删除功能
    }
  }
];

// 视频文件特有的菜单项
const getVideoMenuItems = (file: MediaFile): MenuItem[] => [
  {
    label: '播放',
    icon: createMenuIcon(PlayIcon),
    onClick: () => {
      // TODO: 实现播放功能
    }
  },
  {
    label: '删除',
    icon: createMenuIcon(TrashIcon, 'w-5 h-5 text-red-500'),
    onClick: () => {
      // TODO: 实现删除功能
    }
  }
];

// 文本文件特有的菜单项
const getTextMenuItems = (file: MediaFile): MenuItem[] => [
  {
    label: '编辑',
    icon: createMenuIcon(PencilIcon),
    onClick: () => {
      // TODO: 实现编辑功能
    }
  },
  {
    label: '删除',
    icon: createMenuIcon(TrashIcon, 'w-5 h-5 text-red-500'),
    onClick: () => {
      // TODO: 实现删除功能
    }
  }
];

// 其他类型文件的菜单项
const getOtherFileMenuItems = (file: MediaFile): MenuItem[] => [
  {
    label: '删除',
    icon: createMenuIcon(TrashIcon, 'w-5 h-5 text-red-500'),
    onClick: () => {
      // TODO: 实现删除功能
    }
  }
];

// 根据文件类型获取对应的菜单项
export const getFileTypeMenuItems = (file: MediaFile): MenuItem[] => {
  const baseItems = getBaseMenuItems(file);
  
  switch (file.type) {
    case 'directory':
      return [...baseItems, ...getDirectoryMenuItems(file)];
    case 'image':
      return [...baseItems, ...getImageMenuItems(file)];
    case 'video':
      return [...baseItems, ...getVideoMenuItems(file)];
    case 'text':
      return [...baseItems, ...getTextMenuItems(file)];
    default:
      return [...baseItems, ...getOtherFileMenuItems(file)];
  }
};
