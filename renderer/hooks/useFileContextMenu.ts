import { useCallback } from 'react';
import { MenuItem } from '../components/ContextMenu/types';
import { MediaFile } from '../../main/fileUtils';
import { getFileTypeMenuItems, getEmptyAreaMenuItems } from '../utils/menuConfigs';
import { useFileOperations } from './useFileOperations';

export function useFileContextMenu() {
  const {
    handleNewFolder,
    handleRename,
    handleConfirm,
    handleCancel,
    validateFileName,
    operation,
    onRefresh
  } = useFileOperations();

  const getContextMenuItems = useCallback((file: MediaFile): MenuItem[] => {
    return getFileTypeMenuItems(file, {
      onNewFolder: handleNewFolder,
      onRename: handleRename,
      onRefresh: async (path: string) => await onRefresh(path)
    });
  }, [handleNewFolder, handleRename, onRefresh]);

  const getEmptyContextMenuItems = useCallback((currentPath: string): MenuItem[] => {
    return getEmptyAreaMenuItems(currentPath, {
      onNewFolder: handleNewFolder,
      onRename: handleRename,
      onRefresh: async (path: string) => await onRefresh(path)
    });
  }, [handleNewFolder, handleRename, onRefresh]);

  return {
    getContextMenuItems,
    getEmptyContextMenuItems,
    handleConfirm,
    handleCancel,
    validateFileName,
    operation
  };
}
