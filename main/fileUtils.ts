import { app } from 'electron';
import fs from 'fs';
import path from 'path';

// 支持的文件类型
const SUPPORTED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const SUPPORTED_VIDEO_TYPES = ['.mp4', '.webm', '.mkv','.mov', '.avi', '.mpg', '.mpeg', '.wmv', '.flv'];
const SUPPORTED_TEXT_TYPES = ['.txt']

export interface MediaFile {
  path: string;
  type: 'image' | 'video' | 'text' | 'directory' | 'other';
  name: string;
  size: number;
  modifiedTime: Date;
}

export function getFileType(filePath: string): 'image' | 'video' | 'text' | 'directory' | 'other' {
  const ext = path.extname(filePath).toLowerCase();
  if (SUPPORTED_IMAGE_TYPES.includes(ext)) return 'image';
  if (SUPPORTED_VIDEO_TYPES.includes(ext)) return 'video';
  if (SUPPORTED_TEXT_TYPES.includes(ext)) return 'text';
  return 'other';
}

export async function scanDirectory(dirPath: string, filterOtherFiles: boolean = false): Promise<MediaFile[]> {
  const mediaFiles: MediaFile[] = [];

  try {
    // 规范化路径
    const normalizedPath = path.normalize(dirPath);
    console.log('Scanning directory:', normalizedPath);

    // 确保路径存在且可访问
    try {
      await fs.promises.access(normalizedPath, fs.constants.R_OK);
    } catch (error) {
      console.error(`Directory not accessible: ${normalizedPath}`, error);
      throw new Error(`Directory not accessible: ${normalizedPath}`);
    }

    // 读取目录内容
    const entries = await fs.promises.readdir(normalizedPath, { withFileTypes: true });
    console.log(`Found ${entries.length} entries in ${normalizedPath}`);

    // 处理每个文件
    for (const entry of entries) {
      try {
        const fullPath = path.join(normalizedPath, entry.name);
        const stats = await fs.promises.stat(fullPath);

        if (entry.isDirectory()) {
          mediaFiles.push({
            path: fullPath,
            type: 'directory',
            name: entry.name,
            size: 0,
            modifiedTime: stats.mtime
          });
        } else {
          const fileType = getFileType(fullPath);
          // 在过滤模式下跳过 'other' 类型的文件
          if (filterOtherFiles && fileType === 'other') continue;
          
          mediaFiles.push({
            path: fullPath,
            type: fileType,
            name: entry.name,
            size: stats.size,
            modifiedTime: stats.mtime
          });
        }
      } catch (error) {
        console.warn(`Cannot access file or directory: ${entry.name}`, error);
        continue;
      }
    }

    // 按类型和名称排序：目录在前，文件在后
    mediaFiles.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name);
    });

    return mediaFiles;
  } catch (error) {
    console.error('Error scanning directory:', error);
    return [];
  }
}

// 获取文件内容
export async function getFileContent(filePath: string): Promise<string | null> {
  try {
    if (getFileType(filePath) === 'text') {
      return await fs.promises.readFile(filePath, 'utf-8');
    }
    return null;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
}

/**
 * 将系统路径转换为应用内统一格式（使用>作为分隔符）
 * 输入: "D:/folder1/folder2/file.txt" 或 "D:\folder1\folder2\file.txt"
 * 输出: "D:>folder1>folder2>file.txt"
 */
export function convertToAppPath(systemPath: string): string {
  if (!systemPath) return '';
  
  // 统一将反斜杠转换为正斜杠，然后替换为 ">"
  return systemPath.replace(/[\\/]+/g, '>').replace(/^>+|>+$/g, '');
}

/**
 * 将应用内路径格式转换回系统路径格式（用于文件操作）
 * 输入: "D:>folder1>folder2>file.txt"
 * 输出: "D:/folder1/folder2/file.txt"
 */
export function convertToSystemPath(appPath: string): string {
  if (!appPath) return '';
  
  // 将 ">" 转换为系统路径分隔符
  return appPath.replace(/>/g, path.sep);
}

/**
 * 将路径格式化为Windows资源管理器样式
 * 输入: "D:/folder1/folder2/file.txt" 或 "D:\folder1\folder2\file.txt"
 * 输出: "D:>folder1>folder2>file.txt"
 */
export function formatPathToExplorerStyle(inputPath: string): string {
  return convertToAppPath(inputPath);
}

// 创建目录
export const createDirectory = async (directoryPath: string): Promise<void> => {
  try {
    await fs.promises.mkdir(directoryPath);
  } catch (error) {
    console.error('Error creating directory:', error);
    throw error;
  }
};

// 重命名文件或目录
export const renameFile = async (oldPath: string, newPath: string): Promise<void> => {
  try {
    await fs.promises.rename(oldPath, newPath);
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
};
