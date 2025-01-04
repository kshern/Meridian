import { useCallback } from 'react';
import { MenuItem } from '../components/ContextMenu/types';
import { MediaFile } from '../../main/fileUtils';
import { getFileTypeMenuItems } from '../utils/menuConfigs';

export function useFileContextMenu() {
  const getContextMenuItems = useCallback((file: MediaFile): MenuItem[] => {
    return getFileTypeMenuItems(file);
  }, []);

  return {
    getContextMenuItems
  };
}
