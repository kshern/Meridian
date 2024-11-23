import React from 'react';
import { MediaFile } from '../../../main/fileUtils';

interface ListItemProps {
  file: MediaFile;
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
  getFileIcon: (file: MediaFile) => JSX.Element;
  colors: any;
}

const ListItem: React.FC<ListItemProps> = React.memo(({ file, onDirectoryClick, onFileClick, getFileIcon, colors }) => (
  <div
    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100/5"
    onClick={() => {
      if (file.type === 'directory') {
        onDirectoryClick?.(file.path);
      } else {
        onFileClick?.(file);
      }
    }}
    title={file.name}
  >
    {getFileIcon(file)}
    <span className="ml-3 truncate text-sm text-gray-300">
      {file.name}
    </span>
  </div>
));

export default ListItem;
