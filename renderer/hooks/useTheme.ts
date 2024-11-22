import { useCallback, useEffect, useState } from 'react';
import EventEmitter from 'eventemitter3';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // 背景色
  background: string;
  backgroundHover: string;
  backgroundSecondary: string;
  backgroundSecondaryHover: string;
  backgroundTertiary: string;
  backgroundTertiaryHover: string;
  
  // 文本颜色
  text: string;
  textSecondary: string;
  textTertiary: string;
  textHover: string;
  
  // 图标颜色
  icon: string;
  iconHover: string;
  
  // 特殊图标颜色
  folderIcon: string;
  imageIcon: string;
  videoIcon: string;
  textIcon: string;
  documentIcon: string;
  
  // 边框颜色
  border: string;
  borderHover: string;
  
  // 分割线
  divider: string;
  
  // 阴影
  shadow: string;
  
  // 叠加层
  overlay: string;
  overlayHover: string;

  // 工具栏
  toolbarBackground: string;
  toolbarBorder: string;
  toolbarButtonActive: string;
  toolbarButtonActiveHover: string;
  toolbarButtonInactive: string;
  toolbarButtonInactiveHover: string;
  toolbarDivider: string;
  toolbarInput: string;
  toolbarInputBorder: string;
  toolbarInputFocus: string;
  toolbarInputPlaceholder: string;
  toolbarActiveText: string;
  toolbarCloseButton: string;
  toolbarCloseButtonHover: string;
  toolbarSearchIcon: string;
  toolbarSearchIconHover: string;

  // 路径栏
  pathBarBackground: string;
  pathBarBorder: string;
  pathBarText: string;
  pathBarTextHover: string;
  pathBarSegmentHover: string;
  pathBarSeparator: string;
  pathBarButton: string;
  pathBarButtonHover: string;
}

const themeColors: Record<Theme, ThemeColors> = {
  light: {
    background: 'bg-white',
    backgroundHover: 'hover:bg-gray-50',
    backgroundSecondary: 'bg-gray-50',
    backgroundSecondaryHover: 'hover:bg-gray-100',
    backgroundTertiary: 'bg-gray-100',
    backgroundTertiaryHover: 'hover:bg-gray-200',
    
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textTertiary: 'text-gray-400',
    textHover: 'hover:text-gray-700',
    
    icon: 'text-gray-500',
    iconHover: 'hover:text-gray-700',
    
    folderIcon: 'text-yellow-500',
    imageIcon: 'text-blue-500',
    videoIcon: 'text-purple-500',
    textIcon: 'text-gray-500',
    documentIcon: 'text-gray-400',
    
    border: 'border-gray-200',
    borderHover: 'hover:border-gray-300',
    
    divider: 'border-gray-200',
    
    shadow: 'shadow-md',
    
    overlay: 'bg-black/50',
    overlayHover: 'hover:bg-black/60',

    // 工具栏
    toolbarBackground: 'bg-white',
    toolbarBorder: 'border-gray-200',
    toolbarButtonActive: 'bg-gray-100 text-blue-600',
    toolbarButtonActiveHover: 'hover:bg-gray-200',
    toolbarButtonInactive: 'text-gray-600',
    toolbarButtonInactiveHover: 'hover:bg-gray-100 hover:text-gray-900',
    toolbarDivider: 'border-gray-300',
    toolbarInput: 'bg-white text-gray-900',
    toolbarInputBorder: 'border-gray-300',
    toolbarInputFocus: 'focus:border-blue-500',
    toolbarInputPlaceholder: 'placeholder-gray-400',
    toolbarActiveText: 'text-blue-600',
    toolbarCloseButton: 'text-gray-600',
    toolbarCloseButtonHover: 'hover:bg-red-500 hover:text-white',
    toolbarSearchIcon: 'text-gray-400',
    toolbarSearchIconHover: 'hover:text-gray-600',

    // 路径栏
    pathBarBackground: 'bg-white',
    pathBarBorder: 'border-gray-200',
    pathBarText: 'text-gray-600',
    pathBarTextHover: 'hover:text-gray-900',
    pathBarSegmentHover: 'hover:bg-gray-100',
    pathBarSeparator: 'text-gray-400',
    pathBarButton: 'text-gray-600',
    pathBarButtonHover: 'hover:text-gray-900 hover:bg-gray-100',
  },
  dark: {
    background: 'bg-gray-900',
    backgroundHover: 'hover:bg-gray-800',
    backgroundSecondary: 'bg-gray-800',
    backgroundSecondaryHover: 'hover:bg-gray-700',
    backgroundTertiary: 'bg-gray-700',
    backgroundTertiaryHover: 'hover:bg-gray-600',
    
    text: 'text-gray-100',
    textSecondary: 'text-gray-300',
    textTertiary: 'text-gray-500',
    textHover: 'hover:text-white',
    
    icon: 'text-gray-400',
    iconHover: 'hover:text-gray-200',
    
    folderIcon: 'text-yellow-400',
    imageIcon: 'text-blue-400',
    videoIcon: 'text-purple-400',
    textIcon: 'text-gray-400',
    documentIcon: 'text-gray-500',
    
    border: 'border-gray-700',
    borderHover: 'hover:border-gray-600',
    
    divider: 'border-gray-700',
    
    shadow: 'shadow-lg shadow-black/50',
    
    overlay: 'bg-black/70',
    overlayHover: 'hover:bg-black/80',

    // 工具栏
    toolbarBackground: 'bg-gray-900',
    toolbarBorder: 'border-gray-700',
    toolbarButtonActive: 'bg-gray-700 text-blue-400',
    toolbarButtonActiveHover: 'hover:bg-gray-600',
    toolbarButtonInactive: 'text-gray-400',
    toolbarButtonInactiveHover: 'hover:bg-gray-700 hover:text-gray-200',
    toolbarDivider: 'border-gray-600',
    toolbarInput: 'bg-gray-700 text-gray-100',
    toolbarInputBorder: 'border-gray-600',
    toolbarInputFocus: 'focus:border-blue-400',
    toolbarInputPlaceholder: 'placeholder-gray-500',
    toolbarActiveText: 'text-blue-400',
    toolbarCloseButton: 'text-gray-400',
    toolbarCloseButtonHover: 'hover:bg-red-600/90 hover:text-white',
    toolbarSearchIcon: 'text-gray-500',
    toolbarSearchIconHover: 'hover:text-gray-300',

    // 路径栏
    pathBarBackground: 'bg-gray-900',
    pathBarBorder: 'border-gray-700',
    pathBarText: 'text-gray-400',
    pathBarTextHover: 'hover:text-gray-200',
    pathBarSegmentHover: 'hover:bg-gray-700',
    pathBarSeparator: 'text-gray-600',
    pathBarButton: 'text-gray-400',
    pathBarButtonHover: 'hover:text-gray-200 hover:bg-gray-700',
  },
};

enum ThemeEvent {
  __SET_THEME__ = '__SET_THEME__',
  __SET_THEME_RSP__ = '__SET_THEME_RSP__'
}

const themeListener = new EventEmitter();
let themeCache: Theme | null = null;
let isLoadingTheme = false;

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(themeCache || 'light');
  const colors = themeColors[theme];

  const getTheme = useCallback(async () => {
    const handler = (newTheme: Theme) => {
      themeCache = newTheme;
      themeListener.emit(ThemeEvent.__SET_THEME__, newTheme);
    };

    if (themeCache) {
      themeListener.emit(ThemeEvent.__SET_THEME__, themeCache);
    } else if (isLoadingTheme) {
      themeListener.once(ThemeEvent.__SET_THEME_RSP__, handler);
    } else {
      isLoadingTheme = true;
      try {
        const savedTheme = await window.ipc.getTheme();
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const finalTheme = savedTheme || systemTheme;
        
        handler(finalTheme as Theme);
        themeListener.emit(ThemeEvent.__SET_THEME_RSP__, finalTheme);
      } catch (error) {
        console.error('Failed to load theme:', error);
        handler('light');
        themeListener.emit(ThemeEvent.__SET_THEME_RSP__, 'light');
      } finally {
        isLoadingTheme = false;
      }
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    try {
      await window.ipc.saveTheme(newTheme);
      themeCache = newTheme;
      themeListener.emit(ThemeEvent.__SET_THEME__, newTheme);
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [theme]);

  useEffect(() => {
    const handler = (newTheme: Theme) => {
      setTheme(newTheme);
    };

    themeListener.on(ThemeEvent.__SET_THEME__, handler);
    getTheme();

    return () => {
      themeListener.off(ThemeEvent.__SET_THEME__, handler);
    };
  }, [getTheme]);

  return { theme, colors, toggleTheme };
};

export default useTheme;
