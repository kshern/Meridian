import { join } from 'path';
import { app } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';

// Set ffmpeg path
const ffmpegPath = app.isPackaged
  ? join(process.resourcesPath, 'ffmpeg.exe')
  : ffmpegStatic;
console.log('Using ffmpeg path:', ffmpegPath);
ffmpeg.setFfmpegPath(ffmpegPath);

// 使用与图片缩略图相同的缓存目录
const CACHE_DIR = join(process.env.APPDATA || process.env.HOME || '', '.meridian', 'thumbnails');
const THUMBNAIL_SIZE = 400; // 与图片缩略图保持一致

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

export const generateVideoThumbnail = async (videoPath: string): Promise<string> => {
  try {
    // 移除file://前缀
    videoPath = videoPath.replace(/^file:\/\//, '');

    // 检查文件是否存在
    if (!existsSync(videoPath)) {
      console.error('Video file does not exist:', videoPath);
      return '';
    }

    // Create a hash of the video path to use as the thumbnail filename
    const hash = createHash('md5').update(`video:${videoPath}`).digest('hex');
    const thumbnailPath = join(CACHE_DIR, `${hash}.jpg`);

    // If thumbnail already exists, return it
    if (existsSync(thumbnailPath)) {
      console.log('Using cached video thumbnail:', thumbnailPath);
      return thumbnailPath;
    }

    console.log('Generating video thumbnail for:', videoPath);

    // Generate thumbnail
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .on('error', (err) => {
          console.error('Error generating video thumbnail:', err);
          reject(err);
        })
        .screenshots({
          timestamps: ['1%'], // Take screenshot at 1% of the video
          filename: `${hash}.jpg`,
          folder: CACHE_DIR,
          size: `${THUMBNAIL_SIZE}x?` // 保持宽高比
        })
        .on('end', () => {
          console.log('Video thumbnail generated:', thumbnailPath);
          resolve(thumbnailPath);
        });
    });
  } catch (error) {
    console.error('Failed to generate video thumbnail:', error);
    return '';
  }
};
