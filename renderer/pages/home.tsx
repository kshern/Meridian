import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ThumbnailViewer from '../components/ThumbnailViewer';
import { MediaFile } from '../../main/fileUtils';
import MediaViewer from '../components/MediaViewer';
import Toolbar from '../components/Toolbar';
import PathBar from '../components/PathBar';
import FolderTree from '../components/FolderTree';
import { useFileOperations } from '../hooks/useFileOperations';
import { useSidebarResize } from '../hooks/useSidebarResize';

function Home() {
  const {
    files,
    currentPath,
    viewMode,
    selectedFileIndex,
    viewType,
    searchQuery,
    setSearchQuery,
    handleOpenDirectory,
    handleDirectoryClick,
    handleBack,
    handleFileClick,
    handlePathSegmentClick,
    handleOpenInExplorer,
    handleViewModeChange,
    getMediaFiles,
  } = useFileOperations();

  const [showSidebar, setShowSidebar] = useState(true);
  const [showPathBar, setShowPathBar] = useState(true);
  const { sidebarWidth, isResizing, startResizing } = useSidebarResize();

  // 初始化时从本地加载地址栏显示状态
  useEffect(() => {
    const loadPathBarState = async () => {
      try {
        const visible = await window.ipc.getPathBarVisible();
        setShowPathBar(visible);
      } catch (error) {
        console.error('Error loading path bar state:', error);
      }
    };
    loadPathBarState();
  }, []);

  // 切换地址栏显示状态
  const handleTogglePathBar = async () => {
    const newState = !showPathBar;
    setShowPathBar(newState);
    try {
      await window.ipc.savePathBarVisible(newState);
    } catch (error) {
      console.error('Error saving path bar state:', error);
    }
  };

  // 过滤文件列表
  const filteredFiles = files.filter((file) => {
    const fileName = file.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fileName.includes(query);
  });

  return (
    <React.Fragment>
      <Head>
        <title>FReader</title>
      </Head>
      <div className="flex flex-col h-screen">
        <Toolbar
          currentPath={currentPath}
          searchQuery={searchQuery}
          viewMode={viewMode}
          viewType={viewType}
          showSidebar={showSidebar}
          showPathBar={showPathBar}
          onOpenDirectory={handleOpenDirectory}
          onGoBack={handleBack}
          onSearchChange={setSearchQuery}
          onViewModeChange={handleViewModeChange}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onTogglePathBar={handleTogglePathBar}
        />

        {/* 地址栏 */}
        {currentPath && showPathBar && (
          <PathBar
            currentPath={currentPath}
            onPathSegmentClick={handlePathSegmentClick}
            onOpenInExplorer={handleOpenInExplorer}
          />
        )}

        {/* 主内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 侧边栏 */}
          {showSidebar && (
            <div 
              className="border-r border-gray-200 dark:border-gray-700 relative" 
              style={{ width: sidebarWidth, minWidth: sidebarWidth }}
            >
              <FolderTree onSelect={handleDirectoryClick} />
              {/* 拖拽手柄 */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 group"
                onMouseDown={startResizing}
              >
                <div className={`absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-50 transition-opacity ${isResizing ? 'opacity-50' : ''}`} />
              </div>
            </div>
          )}
          
          {/* 内容区域 */}
          <div className="flex-1 overflow-auto">
            {viewMode === 'thumbnail' ? (
              <ThumbnailViewer
                files={filteredFiles}
                viewType={viewType}
                onFileClick={handleFileClick}
                onDirectoryClick={handleDirectoryClick}
              />
            ) : (
              <MediaViewer
                files={getMediaFiles()}
                initialIndex={selectedFileIndex}
              />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default Home;
