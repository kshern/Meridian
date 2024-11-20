import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import MediaViewer from '../components/MediaViewer';
import ThumbnailViewer from '../components/ThumbnailViewer';
import { MediaFile } from '../../main/fileUtils';

declare global {
  interface Window {
    ipc: {
      send: (channel: string, data: any) => void;
      on: (channel: string, func: (...args: any[]) => void) => () => void;
      scanDirectory: (path: string) => Promise<MediaFile[]>;
      openDirectory: () => Promise<string>;
      readTextFile: (path: string) => Promise<string>;
      openInExplorer: (path: string) => Promise<void>;
    };
  }
}

function Home() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [pathHistory, setPathHistory] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'thumbnail' | 'detail'>('thumbnail');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);

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

  const handlePathPartClick = async (index: number) => {
    const pathParts = currentPath.split('\\');
    const targetPath = pathParts.slice(0, index + 1).join('\\');
    try {
      const mediaFiles = await window.ipc.scanDirectory(targetPath);
      setFiles(mediaFiles);
      setCurrentPath(targetPath);
      setPathHistory(prev => [...prev, targetPath]);
    } catch (error) {
      console.error('Error navigating to path:', error);
    }
  };

  const handleOpenInExplorer = async () => {
    try {
      await window.ipc.openInExplorer(currentPath);
    } catch (error) {
      console.error('Error opening in explorer:', error);
    }
  };

  const renderPathNavigation = () => {
    const pathParts = currentPath.split('\\');
    return (
      <div className="flex items-center gap-1 flex-1 overflow-hidden">
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-text-secondary">\</span>}
            <span
              className="path-part"
              onClick={() => handlePathPartClick(index)}
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <React.Fragment>
      <Head>
        <title>FReader</title>
      </Head>
      <div className="h-screen flex flex-col bg-background text-text">
        {!currentPath ? (
          <div className="flex-1 flex justify-center items-center flex-col gap-4 fade-in">
            <h1 className="text-4xl font-bold mb-4">FReader</h1>
            <button
              onClick={handleOpenDirectory}
              className="btn btn-primary"
            >
              选择文件夹
            </button>
          </div>
        ) : (
          <>
            <div className="navbar flex items-center gap-2">
              <button
                onClick={handleBack}
                disabled={pathHistory.length <= 1}
                className="btn tooltip"
                data-tooltip="返回上级目录"
              >
                ←
              </button>
              {viewMode === 'detail' && (
                <button
                  onClick={handleCloseDetail}
                  className="btn tooltip"
                  data-tooltip="返回缩略图视图"
                >
                  ⊟
                </button>
              )}
              {renderPathNavigation()}
              <button
                onClick={handleOpenInExplorer}
                className="btn tooltip"
                data-tooltip="在资源管理器中打开"
              >
                <span className="text-lg">📂</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {viewMode === 'thumbnail' ? (
                <div className="h-full overflow-auto">
                  <ThumbnailViewer
                    files={files}
                    onDirectoryClick={handleDirectoryClick}
                    onFileClick={handleFileClick}
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
          </>
        )}
      </div>
    </React.Fragment>
  );
}

export default Home;