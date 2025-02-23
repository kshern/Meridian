import React from 'react';
import { MediaFile } from '../../../main/fileUtils';
import LazyImage from '../LazyImage';
import VideoThumbnail from '../VideoThumbnail';
import FolderThumbnail from './FolderThumbnail';

interface GridItemProps {
  file: MediaFile;
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  getFileIcon: (file: MediaFile) => JSX.Element;
}

const GridItem: React.FC<GridItemProps> = React.memo(({ file, onDirectoryClick, onFileClick, getFileIcon }) => (
  <div
    className="media-item group relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
    onClick={() => {
      if (file.type === 'directory') {
        onDirectoryClick?.(file.path);
      } else {
        onFileClick?.(file);
      }
    }}
    title={file.name}
  >
    {file.type === 'directory' ? (
      <FolderThumbnail
        folderPath={file.path}
        className="w-full h-full"
        getFileIcon={getFileIcon}
      />
    ) : file.type === 'image' ? (
      file.name.toLowerCase().endsWith('.gif') || file.name.toLowerCase().endsWith('.webp') ? (
        <img
          src={`file://${file.path}`}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <LazyImage
          src={`file://${file.path}`}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      )
    ) : file.type === 'video' ? (
      <VideoThumbnail
        videoPath={file.path}
        showTag={true}
        className="w-full h-full object-cover"
      />
    ) : (
      <div className="w-full h-full flex items-center justify-center bg-gray-800">
        {getFileIcon(file)}
      </div>
    )}
    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-black/50 backdrop-blur-sm">
      <p className="text-sm truncate text-white/90 group-hover:text-white transition-colors">
        {file.name}
      </p>
    </div>
  </div>
));

export default GridItem;
