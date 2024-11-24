/**
 * 获取视频当前时间
 * @returns 格式化后的当前时间字符串
 */
export const getCurrentVideoTime = (): string => {
    const video = document.querySelector('video');
    if (video) {
        return formatTime(video.currentTime);
    }
    return '0:00';
};

/**
 * 切换全屏状态
 * @param containerSelector 容器元素的选择器
 * @returns 新的全屏状态
 */
export const toggleFullscreen = async (containerSelector: string): Promise<boolean> => {
    const container = document.querySelector(containerSelector);
    if (!document.fullscreenElement && container) {
        await container.requestFullscreen();
        return true;
    } else {
        await document.exitFullscreen();
        return false;
    }
};

/**
 * 更新播放状态
 * @param currentStates 当前播放状态对象
 * @param targetIndex 目标索引
 * @returns 更新后的播放状态对象
 */
export const updatePlayingStates = (
    currentStates: { [key: number]: boolean },
    targetIndex: number
): { [key: number]: boolean } => {
    const newStates = { ...currentStates };
    Object.keys(currentStates).forEach(key => {
        newStates[parseInt(key)] = false;
    });
    newStates[targetIndex] = !currentStates[targetIndex];
    return newStates;
};

/**
 * 处理音量变化
 * @param value 新的音量值
 * @param saveVolume 保存音量的回调函数
 * @param saveMuted 保存静音状态的回调函数
 */
export const handleVolumeChange = (
    value: number,
    saveVolume: (value: number) => void,
    saveMuted: (value: boolean) => void
): void => {
    saveVolume(value);
    saveMuted(value === 0);
};

import { formatTime } from './formatTime';
