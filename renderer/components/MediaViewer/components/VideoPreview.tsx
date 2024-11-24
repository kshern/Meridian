import React, { useEffect, useRef, useCallback, useState } from 'react';
import styles from './VideoPreview.module.scss';

interface VideoPreviewProps {
    videoElement: HTMLVideoElement;
    time: number;
    position: { x: number; y: number } | null;
}

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 180;
const CACHE_INTERVAL = 10; // 每10秒缓存一帧
const MAX_CACHE_SIZE = 60; // 最多缓存60帧

interface CacheItem {
    time: number;
    imageData: ImageData;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ videoElement, time, position }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewVideoRef = useRef<HTMLVideoElement | null>(null);
    const frameCache = useRef<Map<number, CacheItem>>(new Map());
    const [isPreloading, setIsPreloading] = useState(false);

    // 初始化预览视频元素
    useEffect(() => {
        if (!previewVideoRef.current) {
            const video = document.createElement('video');
            video.src = videoElement.src;
            video.preload = 'auto';
            video.style.display = 'none';
            document.body.appendChild(video);
            previewVideoRef.current = video;

            // 预加载视频
            video.load();
            video.currentTime = 0;
        }

        return () => {
            if (previewVideoRef.current) {
                previewVideoRef.current.remove();
                previewVideoRef.current = null;
            }
            frameCache.current.clear();
        };
    }, [videoElement.src]);

    // 预加载和缓存帧
    useEffect(() => {
        const preloadFrames = async () => {
            if (!previewVideoRef.current || isPreloading) return;
            setIsPreloading(true);

            const video = previewVideoRef.current;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.width = PREVIEW_WIDTH;
            canvas.height = PREVIEW_HEIGHT;

            try {
                const duration = video.duration;
                for (let t = 0; t < duration; t += CACHE_INTERVAL) {
                    if (frameCache.current.size >= MAX_CACHE_SIZE) break;

                    // 检查是否已缓存
                    const cachedTime = Math.floor(t / CACHE_INTERVAL) * CACHE_INTERVAL;
                    if (frameCache.current.has(cachedTime)) continue;

                    // 设置时间并等待加载
                    video.currentTime = t;
                    await new Promise(resolve => {
                        const handleSeeked = () => {
                            video.removeEventListener('seeked', handleSeeked);
                            resolve(null);
                        };
                        video.addEventListener('seeked', handleSeeked);
                    });

                    // 绘制并缓存帧
                    context.drawImage(video, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
                    const imageData = context.getImageData(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
                    frameCache.current.set(cachedTime, { time: cachedTime, imageData });
                }
            } catch (error) {
                console.error('Error preloading frames:', error);
            }

            setIsPreloading(false);
        };

        preloadFrames();
    }, [videoElement.src]);

    const drawPreviewFrame = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement, targetTime: number) => {
        const context = canvas.getContext('2d');
        if (!context) return;

        // 检查缓存中最近的帧
        const cachedTime = Math.floor(targetTime / CACHE_INTERVAL) * CACHE_INTERVAL;
        const cachedFrame = frameCache.current.get(cachedTime);

        if (cachedFrame) {
            // 使用缓存的帧
            context.putImageData(cachedFrame.imageData, 0, 0);
            return;
        }

        // 如果没有缓存，则实时绘制
        try {
            // 计算保持宽高比的尺寸
            const videoRatio = video.videoWidth / video.videoHeight;
            const previewRatio = PREVIEW_WIDTH / PREVIEW_HEIGHT;
            
            let drawWidth = PREVIEW_WIDTH;
            let drawHeight = PREVIEW_HEIGHT;
            let offsetX = 0;
            let offsetY = 0;

            if (videoRatio > previewRatio) {
                drawHeight = PREVIEW_WIDTH / videoRatio;
                offsetY = (PREVIEW_HEIGHT - drawHeight) / 2;
            } else {
                drawWidth = PREVIEW_HEIGHT * videoRatio;
                offsetX = (PREVIEW_WIDTH - drawWidth) / 2;
            }

            // 清除之前的内容，填充黑色背景
            context.fillStyle = '#000000';
            context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

            // 绘制视频帧
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight,
                            offsetX, offsetY, drawWidth, drawHeight);

            // 缓存当前帧
            const imageData = context.getImageData(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
            if (frameCache.current.size >= MAX_CACHE_SIZE) {
                // 如果缓存已满，删除最早的帧
                const oldestTime = Math.min(...Array.from(frameCache.current.keys()));
                frameCache.current.delete(oldestTime);
            }
            frameCache.current.set(cachedTime, { time: cachedTime, imageData });
        } catch (error) {
            console.error('Failed to draw preview frame:', error);
        }
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const previewVideo = previewVideoRef.current;
        if (!canvas || !previewVideo || !position) return;

        // 检查缓存
        const cachedTime = Math.floor(time / CACHE_INTERVAL) * CACHE_INTERVAL;
        const cachedFrame = frameCache.current.get(cachedTime);

        if (cachedFrame) {
            // 直接使用缓存的帧
            const context = canvas.getContext('2d');
            if (context) {
                canvas.width = PREVIEW_WIDTH;
                canvas.height = PREVIEW_HEIGHT;
                context.putImageData(cachedFrame.imageData, 0, 0);
            }
            return;
        }

        // 如果没有缓存，则实时获取帧
        previewVideo.currentTime = time;

        const handleSeeked = () => {
            drawPreviewFrame(previewVideo, canvas, time);
            previewVideo.removeEventListener('seeked', handleSeeked);
        };

        previewVideo.addEventListener('seeked', handleSeeked);

        // 立即绘制一个黑色背景，避免闪烁
        const context = canvas.getContext('2d');
        if (context) {
            context.fillStyle = '#000000';
            context.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
        }

        return () => {
            previewVideo.removeEventListener('seeked', handleSeeked);
        };
    }, [time, position, drawPreviewFrame]);

    if (!position) return null;

    return (
        <div 
            className={styles.preview_container}
            style={{
                left: position.x,
                top: position.y
            }}
        >
            <canvas 
                ref={canvasRef}
                className={styles.preview_canvas}
            />
            <div className={styles.time_indicator}>
                {formatTime(time)}
            </div>
        </div>
    );
};

const formatTime = (seconds: number): string => {
    const pad = (num: number) => String(Math.floor(num)).padStart(2, '0');
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
    }
    return `${pad(minutes)}:${pad(secs)}`;
};
