// 播放速率选项
export const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];

// 默认播放速率
export const DEFAULT_PLAYBACK_RATE = 1;

// 默认音量
export const DEFAULT_VOLUME = 1;

// 音量本地存储键
export const VOLUME_STORAGE_KEY = 'mediaViewer.volume';
export const MUTED_STORAGE_KEY = 'mediaViewer.muted';

// 错误消息
export const ERROR_MESSAGES = {
    VIDEO_CODEC: '无法播放此视频，可能是由于缺少所需的编解码器。请安装相应的编解码器后重试。',
    PLAYBACK_ERROR: '播放出错，请检查文件是否损坏或格式是否支持。',
};

// CSS 类名
export const CSS_CLASSES = {
    DRAGGING: 'dragging',
    ROTATING: 'rotating',
    PAUSED: 'paused',
    CURRENT: 'current',
};

// 媒体类型
export const MEDIA_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
} as const;

// 动画持续时间（毫秒）
export const ANIMATION_DURATION = 300;

// 进度条更新间隔（毫秒）
export const PROGRESS_INTERVAL = 1000;

// 视频快进/快退时间（秒）
export const VIDEO_SEEK_TIME = 10;

// 键盘按键代码
export const KEY_CODES = {
    LEFT_ARROW: 'ArrowLeft',
    RIGHT_ARROW: 'ArrowRight',
    SPACE: 'Space',
} as const;
