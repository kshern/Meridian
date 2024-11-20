import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import ThumbnailViewer from '../components/ThumbnailViewer';
import { MediaFile } from '../../main/fileUtils';
import MediaViewer from '../components/MediaViewer';

function Home() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'thumbnail' | 'detail'>('thumbnail');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 过滤文件列表
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const cleanup = window.ipc.on('open-path', async (path: string) => {
      if (path) {
        const mediaFiles = await window.ipc.scanDirectory(path);
        setFiles(mediaFiles);
        setCurrentPath(path);
        setPathHistory([path]);
        setSelectedFileIndex(0);
      }
    });

    return cleanup;
  }, []);

  const handleOpenDirectory = async () => {
    try {
      const path = await window.ipc.openDirectory();
      if (path) {
        const mediaFiles = await window.ipc.scanDirectory(path);
        setFiles(mediaFiles);
        setCurrentPath(path);
        setPathHistory([path]);
        setSelectedFileIndex(0);
      }
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const handleDirectoryClick = async (path: string) => {
    try {
      const mediaFiles = await window.ipc.scanDirectory(path);
      setFiles(mediaFiles);
      setCurrentPath(path);
      setPathHistory(prev => [...prev, path]);
      setSelectedFileIndex(0);
      setViewMode('thumbnail'); // 进入新目录时切换回缩略图模式
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const handleBack = async () => {
    if (pathHistory.length > 1) {
      const newHistory = [...pathHistory];
      newHistory.pop();
      const previousPath = newHistory[newHistory.length - 1];
      const mediaFiles = await window.ipc.scanDirectory(previousPath);
      setFiles(mediaFiles);
      setCurrentPath(previousPath);
      setPathHistory(newHistory);
      setSelectedFileIndex(0);
    }
  };

  const handleFileClick = (file: MediaFile) => {
    if (file.type === 'image' || file.type === 'video') {
      const mediaFiles = getMediaFiles();
      const index = mediaFiles.findIndex(f => f.path === file.path);
      if (index !== -1) {
        setSelectedFileIndex(index);
        setViewMode('detail');
      }
    }
  };

  const handleCloseDetail = () => {
    setViewMode('thumbnail');
  };

  const getMediaFiles = () => {
    return files.filter(f => f.type === 'image' || f.type === 'video');
  };

  const handlePathSegmentClick = async (index: number) => {
    const pathParts = pathHistory[0].split('\\');
    // 处理根目录的特殊情况
    let targetPath = index === 0 
      ? pathParts[0] + '\\'  // 如果是根目录，确保添加反斜杠
      : pathParts.slice(0, index + 1).join('\\');

    try {
      const mediaFiles = await window.ipc.scanDirectory(targetPath);
      setFiles(mediaFiles);
      setCurrentPath(targetPath);
      setPathHistory(prev => prev.slice(0, pathHistory.findIndex(p => p === targetPath) + 1));
      setSelectedFileIndex(0);
      setViewMode('thumbnail');
      setSearchQuery(''); // 清除搜索内容
    } catch (error) {
      console.error('Error navigating to path:', error);
    }
  };

  const renderPathNavigation = () => {
    const pathParts = currentPath.split('\\');
    return (
      <div className="flex items-center gap-1 text-sm">
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">\</span>}
            <button
              className="hover:text-blue-500 text-gray-600"
              onClick={() => handlePathSegmentClick(index)}
            >
              {part || 'Computer'}
              {index === 0 && '\\'} {/* 为根目录显示反斜杠 */}
            </button>
          </React.Fragment>
        ))}
      </div>
    );
  };

  const handleOpenInExplorer = async () => {
    try {
      await window.ipc.openInExplorer(currentPath);
    } catch (error) {
      console.error('Error opening in explorer:', error);
    }
  };

  const handleGoBack = handleBack;

  return (
    <React.Fragment>
      <Head>
        <title>FReader</title>
      </Head>
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-2 bg-gray-100">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenDirectory}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              选择文件夹
            </button>
            {currentPath && (
              <>
                <button
                  onClick={handleGoBack}
                  disabled={pathHistory.length <= 1}
                  className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    pathHistory.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  返回上级
                </button>
                {renderPathNavigation()}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索文件..."
                    className="px-3 py-2 text-sm text-gray-600 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (viewMode === 'detail') {
                  setViewMode('thumbnail');
                } else {
                  setViewType(viewType === 'grid' ? 'list' : 'grid');
                }
              }}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded"
              title={
                viewMode === 'detail'
                  ? '返回缩略图'
                  : viewType === 'grid'
                  ? '切换到列表视图'
                  : '切换到网格视图'
              }
            >
              {viewMode === 'detail'
                ? '返回缩略图'
                : viewType === 'grid'
                ? '列表视图'
                : '网格视图'}
            </button>
            {currentPath && (
              <button
                onClick={handleOpenInExplorer}
                className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                title="在资源管理器中打开"
              >
                📂
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {viewMode === 'thumbnail' ? (
            <div className="h-full overflow-auto">
              <ThumbnailViewer
                files={filteredFiles}
                onDirectoryClick={handleDirectoryClick}
                onFileClick={handleFileClick}
                viewType={viewType}
              />
            </div>
          ) : (
            <div className="h-full">
              <MediaViewer 
                files={getMediaFiles()} 
                initialIndex={selectedFileIndex}
              />
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
