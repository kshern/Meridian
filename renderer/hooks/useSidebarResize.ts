import { useState, useCallback, useEffect } from 'react';
import EventEmitter from 'eventemitter3';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_KEY = 'meridian:sidebar-width';

const sidebarEmitter = new EventEmitter();

export const useSidebarResize = () => {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  // 初始化时从localStorage加载宽度
  useEffect(() => {
    const loadSavedWidth = () => {
      try {
        const savedWidth = parseInt(localStorage.getItem(SIDEBAR_WIDTH_KEY) || '');
        if (savedWidth && savedWidth >= MIN_SIDEBAR_WIDTH && savedWidth <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(savedWidth);
        }
      } catch (error) {
        console.error('Error loading sidebar width:', error);
      }
    };

    loadSavedWidth();

    const handleWidthChange = (width: number) => {
      if (width >= MIN_SIDEBAR_WIDTH && width <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(width);
      }
    };

    sidebarEmitter.on('change', handleWidthChange);
    return () => {
      sidebarEmitter.off('change', handleWidthChange);
    };
  }, []);

  const saveSidebarWidth = useCallback((width: number) => {
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, width.toString());
      sidebarEmitter.emit('change', width);
    } catch (error) {
      console.error('Error saving sidebar width:', error);
    }
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    // 添加全局样式
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    // 移除全局样式
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    // 保存当前宽度到localStorage
    saveSidebarWidth(sidebarWidth);
  }, [sidebarWidth, saveSidebarWidth]);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResizing);
    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  return {
    sidebarWidth,
    isResizing,
    startResizing
  };
};
