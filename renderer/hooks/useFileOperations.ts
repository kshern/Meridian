import { useState, useEffect } from 'react';
import { MediaFile } from '../../main/fileUtils';

export const useFileOperations = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [viewMode, setViewMode] = useState<'thumbnail' | 'detail'>('thumbnail');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterOtherFiles, setFilterOtherFiles] = useState<boolean>(false);

  const handleOpenDirectory = async () => {
    try {
      const path = await window.ipc.openDirectory();
      if (path) {
        const appPath = window.ipc.convertToAppPath(path);
        const mediaFiles = await window.ipc.scanDirectory(path, filterOtherFiles);
        setFiles(mediaFiles);
        setCurrentPath(appPath);
        setSelectedFileIndex(0);
        setSearchQuery(''); // 清除搜索框
        setViewMode('thumbnail'); // 退出详情模式
      }
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const handleDirectoryClick = async (path: string) => {
    try {
      // 检查是否是驱动器根目录（例如 "D:"）
      const isDriveRoot = /^[A-Z]:$/.test(path);
      const systemPath = isDriveRoot ? path + '\\' : path;
      const appPath = window.ipc.convertToAppPath(systemPath);
      
      const mediaFiles = await window.ipc.scanDirectory(systemPath, filterOtherFiles);
      setFiles(mediaFiles);
      setCurrentPath(appPath);
      setSelectedFileIndex(0);
      setSearchQuery(''); // 清除搜索框
      setViewMode('thumbnail'); // 退出详情模式
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const handleBack = async () => {
    // 分割当前路径
    const pathParts = currentPath.split('>').filter(Boolean);

    // 如果只有一个部分（根目录）或没有路径，则不能返回
    if (pathParts.length <= 1) return;

    try {
      let targetPath;
      if (pathParts.length === 2) {
        // 返回到根目录（驱动器），需要加上 > 作为结尾
        targetPath = pathParts[0] + '>';
      } else {
        // 返回到普通目录
        targetPath = pathParts.slice(0, -1).join('>');
      }

      const systemPath = window.ipc.convertToSystemPath(targetPath);
      const mediaFiles = await window.ipc.scanDirectory(systemPath, filterOtherFiles);
      setFiles(mediaFiles);
      setCurrentPath(targetPath);
      setSelectedFileIndex(0);
      setSearchQuery(''); // 清除搜索框
      setViewMode('thumbnail'); // 退出详情模式
    } catch (error) {
      console.error('Error navigating to parent directory:', error);
    }
  };

  const handleFileClick = async (file: MediaFile) => {
    if (file.type === 'image' || file.type === 'video') {
      try {
        // 获取文件所在目录的路径
        const filePath = file.path;
        const lastBackslashIndex = filePath.lastIndexOf('\\');
        // 检查是否是驱动器根目录下的文件
        const isDriveRootFile = lastBackslashIndex === 2; // 例如 "D:\file.jpg"
        const dirPath = isDriveRootFile 
          ? filePath.substring(0, 2) // 取驱动器部分，如 "D:"
          : filePath.substring(0, lastBackslashIndex); // 取完整目录路径
        
        const systemPath = isDriveRootFile ? dirPath + '\\' : dirPath;
        const appDirPath = window.ipc.convertToAppPath(systemPath);
        
        // 如果不在当前目录，先切换到文件所在目录
        if (appDirPath !== currentPath) {
          const mediaFiles = await window.ipc.scanDirectory(systemPath, filterOtherFiles);
          setFiles(mediaFiles);
          setCurrentPath(appDirPath);
          
          // 在新的文件列表中找到目标文件的索引
          const newMediaFiles = mediaFiles.filter(f => f.type === 'image' || f.type === 'video');
          const index = newMediaFiles.findIndex(f => f.path === file.path);
          if (index !== -1) {
            setSelectedFileIndex(index);
            setViewMode('detail');
          }
        } else {
          // 如果在当前目录，直接查找并设置索引
          const mediaFiles = files.filter(f => f.type === 'image' || f.type === 'video');
          const index = mediaFiles.findIndex(f => f.path === file.path);
          if (index !== -1) {
            setSelectedFileIndex(index);
            setViewMode('detail');
          }
        }
      } catch (error) {
        console.error('Error handling file click:', error);
      }
    }
  };

  const handlePathSegmentClick = async (index: number) => {
    const pathParts = currentPath.split('>').filter(Boolean);
    let targetPath;
    if (index === 0) {
      // 处理根目录（驱动器）的情况
      targetPath = pathParts[0] + '>';
    } else {
      // 使用 > 连接路径
      targetPath = pathParts.slice(0, index + 1).join('>');
    }

    try {
      const appPath = targetPath;
      const systemPath = window.ipc.convertToSystemPath(appPath);
      const mediaFiles = await window.ipc.scanDirectory(systemPath, filterOtherFiles);
      setFiles(mediaFiles);
      setCurrentPath(appPath);
      setSelectedFileIndex(0);
      setSearchQuery(''); // 清除搜索框
      setViewMode('thumbnail'); // 退出详情模式
    } catch (error) {
      console.error('Error navigating to path:', error);
    }
  };

  const handleOpenInExplorer = async () => {
    try {
      const systemPath = window.ipc.convertToSystemPath(currentPath);
      await window.ipc.openInExplorer(systemPath);
    } catch (error) {
      console.error('Error opening in explorer:', error);
    }
  };

  const handleViewModeChange = () => {
    if (viewMode === 'detail') {
      setViewMode('thumbnail');
    } else {
      setViewType(viewType === 'grid' ? 'list' : 'grid');
    }
  };

  const getMediaFiles = () => {
    return files.filter(f => f.type === 'image' || f.type === 'video');
  };

  const handleFilterChange = async (value: boolean) => {
    setFilterOtherFiles(value);
    try {
      const systemPath = window.ipc.convertToSystemPath(currentPath);
      const mediaFiles = await window.ipc.scanDirectory(systemPath, value);
      setFiles(mediaFiles);
    } catch (error) {
      console.error('Error applying filter:', error);
    }
  };

  // 监听外部打开路径的事件
  useEffect(() => {
    const cleanup = window.ipc.on('open-path', async (path: string) => {
      if (path) {
        const appPath = window.ipc.convertToAppPath(path);
        const mediaFiles = await window.ipc.scanDirectory(path, filterOtherFiles);
        setFiles(mediaFiles);
        setCurrentPath(appPath);
        setSelectedFileIndex(0);
        setSearchQuery(''); // 清除搜索框
        setViewMode('thumbnail'); // 退出详情模式
      }
    });

    return cleanup;
  }, [filterOtherFiles]);

  useEffect(() => {
    const cleanup = window.ipc.on('file-clicked', (file: any) => {
      console.log('File clicked:', file);
      handleFileClick(file as MediaFile);
    });

    return cleanup;
  }, [currentPath, files]);

  return {
    // 状态
    files,
    currentPath,
    viewMode,
    selectedFileIndex,
    viewType,
    searchQuery,
    filterOtherFiles,
    // 设置器
    setSearchQuery,
    setViewMode,
    setFilterOtherFiles,
    // 处理方法
    handleOpenDirectory,
    handleDirectoryClick,
    handleBack,
    handleFileClick,
    handlePathSegmentClick,
    handleOpenInExplorer,
    handleViewModeChange,
    handleFilterChange,
    // 工具方法
    getMediaFiles,
  };
};
