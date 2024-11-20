import React from 'react';
import { List, AutoSizer } from 'react-virtualized';
import { MediaFile } from '../../../main/fileUtils';

interface ThumbnailViewerProps {
  files: MediaFile[];
  onDirectoryClick: (path: string) => void;
  onFileClick: (file: MediaFile) => void;
}

const ThumbnailViewer: React.FC<ThumbnailViewerProps> = ({
  files,
  onDirectoryClick,
  onFileClick,
}) => {
  const getFileIcon = (file: MediaFile) => {
    switch (file.type) {
      case 'directory':
        return '📁';
      case 'video':
        return '🎬';
      case 'text':
        return '📄';
      default:
        return null;
    }
  };

  // 计算每行显示的缩略图数量
  const getColumnsCount = (width: number) => {
    return Math.max(Math.floor(width / 200), 2); // 每个缩略图最小宽度200px
  };

  // 计算行高
  const getRowHeight = (width: number) => {
    const columnWidth = width / getColumnsCount(width);
    return columnWidth + 40; // 额外空间用于显示文件名
  };

  // 获取指定索引的行内容
  const rowRenderer = ({ index, key, style, width }: any) => {
    const columnsCount = getColumnsCount(width);
    const startIdx = index * columnsCount;
    const rowFiles = files.slice(startIdx, startIdx + columnsCount);

    return (
      <div key={key} style={{ ...style, display: 'flex', gap: '10px' }}>
        {rowFiles.map((file, idx) => (
          <div
            key={file.path}
            className="media-item group"
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
              <img
                src={`file://${file.path}`}
                alt={file.name}
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-surface">
                <span className="text-4xl">{getFileIcon(file)}</span>
              </div>
            )}
            <div className="media-item-name">
              {file.name}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="media-grid fade-in" style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
      <AutoSizer>
        {({ width, height }) => {
          const columnsCount = getColumnsCount(width);
          const rowHeight = getRowHeight(width);
          const rowCount = Math.ceil(files.length / columnsCount);

          return (
            <List
              width={width}
              height={height}
              rowCount={rowCount}
              rowHeight={rowHeight}
              rowRenderer={(props) => rowRenderer({ ...props, width })}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default ThumbnailViewer;
