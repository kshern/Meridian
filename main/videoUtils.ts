import { join } from 'path';
import { app } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { existsSync, mkdirSync } from 'fs';
import { createHash } from 'crypto';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const CACHE_DIR = join(app.getPath('userData'), 'thumbnails');

// Ensure cache directory exists
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

export const generateVideoThumbnail = async (videoPath: string): Promise<string> => {
  // Create a hash of the video path to use as the thumbnail filename
  const hash = createHash('md5').update(videoPath).digest('hex');
  const thumbnailPath = join(CACHE_DIR, `${hash}.jpg`);

  // If thumbnail already exists, return it
  if (existsSync(thumbnailPath)) {
    return thumbnailPath;
  }

  // Generate thumbnail
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('error', (err) => {
        console.error('Error generating thumbnail:', err);
        reject(err);
      })
      .screenshots({
        timestamps: ['1%'], // Take screenshot at 1% of the video
        filename: `${hash}.jpg`,
        folder: CACHE_DIR,
        size: '320x240'
      })
      .on('end', () => {
        resolve(thumbnailPath);
      });
  });
};
