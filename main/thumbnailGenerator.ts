import { nativeImage } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const CACHE_DIR = path.join(process.env.APPDATA || process.env.HOME || '', '.meridian', 'thumbnails');
const THUMBNAIL_SIZE = 400;

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export async function generateThumbnail(imagePath: string, size: number = THUMBNAIL_SIZE): Promise<string> {
  try {
    // 移除file://前缀
    imagePath = imagePath.replace(/^file:\/\//, '');
    
    // 检查文件是否存在
    if (!fs.existsSync(imagePath)) {
      console.error('Image file does not exist:', imagePath);
      return '';
    }

    // 生成缓存文件名
    const hash = crypto.createHash('md5').update(`${imagePath}:${size}`).digest('hex');
    const cacheFile = path.join(CACHE_DIR, `${hash}.png`);

    // 检查缓存
    if (fs.existsSync(cacheFile)) {
      console.log('Using cached thumbnail:', cacheFile);
      return `file://${cacheFile}`;
    }

    // 读取原始图片
    console.log('Generating thumbnail for:', imagePath);
    const imageBuffer = await fs.promises.readFile(imagePath);
    const image = nativeImage.createFromBuffer(imageBuffer);

    if (image.isEmpty()) {
      console.error('Failed to load image:', imagePath);
      return '';
    }

    // 获取原始尺寸
    const originalSize = image.getSize();
    const aspectRatio = originalSize.width / originalSize.height;

    // 计算新尺寸
    let newWidth = size;
    let newHeight = size;
    if (aspectRatio > 1) {
      newHeight = Math.round(size / aspectRatio);
    } else {
      newWidth = Math.round(size * aspectRatio);
    }

    // 生成缩略图
    const thumbnail = image.resize({
      width: newWidth,
      height: newHeight,
      quality: 'good'
    });

    // 保存缩略图
    await fs.promises.writeFile(cacheFile, thumbnail.toPNG());
    console.log('Thumbnail generated:', cacheFile);

    return `file://${cacheFile}`;
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    return '';
  }
}
