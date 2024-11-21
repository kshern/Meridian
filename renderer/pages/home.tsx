import React, { useState } from 'react';
import Head from 'next/head';
import ThumbnailViewer from '../components/ThumbnailViewer';
import { MediaFile } from '../../main/fileUtils';
import MediaViewer from '../components/MediaViewer';
import Toolbar from '../components/Toolbar';
import PathBar from '../components/PathBar';
import FolderTree from '../components/FolderTree';
import { useFileOperations } from '../hooks/useFileOperations';

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
          onOpenDirectory={handleOpenDirectory}
          onGoBack={handleBack}
          onSearchChange={setSearchQuery}
          onViewModeChange={handleViewModeChange}
          onToggleSidebar={() => setShowSidebar(!showSidebar)}
        />

        {/* 地址栏 */}
        {currentPath && (
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
            <div className="w-64 border-r border-gray-200 dark:border-gray-700">
              <FolderTree onSelect={handleDirectoryClick} />
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
