import { useState, useCallback, useEffect } from 'react';

const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 600;
const DEFAULT_SIDEBAR_WIDTH = 280;

export const useSidebarResize = () => {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);

  // 初始化时从本地加载宽度
  useEffect(() => {
    const loadSavedWidth = async () => {
      try {
        const savedWidth = await window.ipc.getSidebarWidth();
        if (savedWidth && savedWidth >= MIN_SIDEBAR_WIDTH && savedWidth <= MAX_SIDEBAR_WIDTH) {
          setSidebarWidth(savedWidth);
        }
      } catch (error) {
        console.error('Error loading sidebar width:', error);
      }
    };
    loadSavedWidth();
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
    // 保存当前宽度到本地
    window.ipc.saveSidebarWidth(sidebarWidth);
  }, [sidebarWidth]);

  const resize = useCallback((mouseMoveEvent: MouseEvent) => {
    if (isResizing) {
      const newWidth = mouseMoveEvent.clientX;
      if (newWidth >= MIN_SIDEBAR_WIDTH && newWidth <= MAX_SIDEBAR_WIDTH) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return { sidebarWidth, isResizing, startResizing };
};
