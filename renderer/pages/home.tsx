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
import { useTheme } from '../hooks/useTheme';
import { usePathBarVisibility } from '../hooks/usePathBarVisibility';

function Home() {
  const {
    files,
    currentPath,
    viewMode,
    selectedFileIndex,
    viewType,
    searchQuery,
    filterOtherFiles,
    sortByTime,
    setSearchQuery,
    handleOpenDirectory,
    handleDirectoryClick,
    handleBack,
    handleFileClick,
    handlePathSegmentClick,
    handleOpenInExplorer,
    handleViewModeChange,
    handleFilterChange,
    toggleSortMode,
    getMediaFiles,
  } = useFileOperations();

  const { theme } = useTheme();

  const [showSidebar, setShowSidebar] = useState(true);
  const { isPathBarVisible, savePathBarVisibility } = usePathBarVisibility();
  const { sidebarWidth, isResizing, startResizing } = useSidebarResize();

  // 过滤文件列表
  const filteredFiles = files.filter((file) => {
    const fileName = file.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fileName.includes(query);
  });

  // 切换地址栏显示状态
  const handleTogglePathBar = () => {
    savePathBarVisibility(!isPathBarVisible);
  };

  return (
    <React.Fragment>
      <Head>
        <title>FReader</title>
      </Head>
      <div className={`flex flex-col h-screen bg-white dark:bg-gray-900`}>
        <Toolbar
          currentPath={currentPath}
          searchQuery={searchQuery}
          viewMode={viewMode}
          showSidebar={showSidebar}
          showPathBar={isPathBarVisible}
          onOpenDirectory={handleOpenDirectory}
          onGoBack={handleBack}
          onSearchChange={setSearchQuery}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
          onTogglePathBar={handleTogglePathBar}
        />

        {/* 地址栏 */}
        {isPathBarVisible && (
          <PathBar
            currentPath={currentPath}
            viewType={viewType}
            sortByTime={sortByTime}
            onPathSegmentClick={handlePathSegmentClick}
            onOpenInExplorer={handleOpenInExplorer}
            filterOtherFiles={filterOtherFiles}
            onFilterChange={handleFilterChange}
            onViewModeChange={handleViewModeChange}
            onToggleSort={toggleSortMode}
          />
        )}

        {/* 主内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 侧边栏 */}
          {showSidebar && (
            <div className="relative" style={{ width: sidebarWidth }}>
              <FolderTree
                onSelect={handleDirectoryClick}
                showMediaOnly={filterOtherFiles}
                currentPath={currentPath}
                sortByTime={sortByTime}
              />
              <div
                className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-gray-300 dark:hover:bg-gray-600"
                onMouseDown={startResizing}
              />
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
