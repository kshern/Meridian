import React, { useEffect, useState } from 'react';
import { MediaFile } from '../../../main/fileUtils';
import LazyImage from '../LazyImage';
import VideoThumbnail from '../VideoThumbnail';

interface FolderThumbnailProps {
  folderPath: string;
  className?: string;
  getFileIcon: (file: MediaFile) => JSX.Element;
}

const FolderThumbnail: React.FC<FolderThumbnailProps> = ({ folderPath, className, getFileIcon }) => {
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    const findFirstMediaFile = async () => {
      try {
        // Scan the directory for media files
        const files = await window.ipc.scanDirectory(folderPath, true);
        
        // Find the first image or video file
        const mediaFile = files.find(file => file.type === 'image' || file.type === 'video');
        if (mediaFile) {
          setPreviewFile(mediaFile);
        }
      } catch (error) {
        console.error('Error finding media file for folder thumbnail:', error);
      }
    };

    findFirstMediaFile();
  }, [folderPath]);

  if (!previewFile) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 ${className}`}>
        {getFileIcon({ type: 'directory', path: folderPath, name: '', size: 0, modifiedTime: new Date() })}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {previewFile.type === 'image' ? (
        previewFile.name.toLowerCase().endsWith('.gif') || previewFile.name.toLowerCase().endsWith('.webp') ? (
          <img
            src={`file://${previewFile.path}`}
            alt={previewFile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <LazyImage
            src={`file://${previewFile.path}`}
            alt={previewFile.name}
            className="w-full h-full object-cover"
          />
        )
      ) : previewFile.type === 'video' ? (
        <VideoThumbnail
          videoPath={previewFile.path}
          className="w-full h-full object-cover"
          showTag={false}
        />
      ) : null}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute top-2 right-2">
        {getFileIcon({ type: 'directory', path: folderPath, name: '', size: 0, modifiedTime: new Date() })}
      </div>
    </div>
  );
};

export default FolderThumbnail;
