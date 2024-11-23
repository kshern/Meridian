import React from 'react';
import { MediaFile } from '../../../main/fileUtils';
import LazyImage from '../LazyImage';
import VideoThumbnail from '../VideoThumbnail';

interface GridItemProps {
  file: MediaFile;
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  getFileIcon: (file: MediaFile) => JSX.Element;
  colors: any;
}

const GridItem: React.FC<GridItemProps> = React.memo(({ file, onDirectoryClick, onFileClick, getFileIcon, colors }) => (
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
    {file.type === 'image' ? (
      <LazyImage
        src={`file://${file.path}`}
        alt={file.name}
        className="w-full h-full object-cover"
      />
    ) : file.type === 'video' ? (
      <VideoThumbnail
        videoPath={file.path}
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
