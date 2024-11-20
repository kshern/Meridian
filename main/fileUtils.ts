import { app } from 'electron';
import fs from 'fs';
import path from 'path';

// 支持的文件类型
const SUPPORTED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const SUPPORTED_VIDEO_TYPES = ['.mp4', '.webm', '.mkv'];
const SUPPORTED_TEXT_TYPES = ['.txt'];

export interface MediaFile {
  path: string;
  type: 'image' | 'video' | 'text' | 'directory';
  name: string;
  size: number;
  modifiedTime: Date;
}

export function getFileType(filePath: string): 'image' | 'video' | 'text' | null {
  const ext = path.extname(filePath).toLowerCase();
  if (SUPPORTED_IMAGE_TYPES.includes(ext)) return 'image';
  if (SUPPORTED_VIDEO_TYPES.includes(ext)) return 'video';
  if (SUPPORTED_TEXT_TYPES.includes(ext)) return 'text';
  return null;
}

export async function scanDirectory(dirPath: string): Promise<MediaFile[]> {
  const mediaFiles: MediaFile[] = [];

  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
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
      const type = getFileType(fullPath);
      if (type) {
        mediaFiles.push({
          path: fullPath,
          type,
          name: entry.name,
          size: stats.size,
          modifiedTime: stats.mtime
        });
      }
    }
  }

  return mediaFiles.sort((a, b) => {
    // 文件夹排在前面
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;
    return a.name.localeCompare(b.name);
  });
}

// 注册为系统默认打开方式
export function registerFileAssociation() {
  if (process.platform === 'win32') {
    app.setAsDefaultProtocolClient('freader');
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