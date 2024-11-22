import FolderOpenIcon from '@heroicons/react/24/outline/FolderOpenIcon';
import React from 'react';

interface PathBarProps {
  currentPath: string;
  onPathSegmentClick: (index: number) => void;
  onOpenInExplorer: () => void;
}

const PathBar: React.FC<PathBarProps> = ({
  currentPath,
  onPathSegmentClick,
  onOpenInExplorer,
}) => {
  // 分割路径并过滤空字符串
  const pathParts = currentPath.split('>').filter(Boolean);

  return (
    <div className="flex items-center px-2 py-1 bg-gray-50 border-b justify-between">
      <div className="flex items-center gap-1 text-sm">
        {/* 特殊处理驱动器 */}
        <button
          className="hover:text-blue-500 text-gray-600"
          onClick={() => onPathSegmentClick(0)}
        >
          {pathParts[0]}
        </button>

        {/* 处理其余路径部分 */}
        {pathParts.slice(1).map((part, index) => (
          <React.Fragment key={index + 1}>
            <span className="text-gray-400">{'>'}</span>
            <button
              className="hover:text-blue-500 text-gray-600"
              onClick={() => onPathSegmentClick(index + 1)}
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>
      <button
          onClick={onOpenInExplorer}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="在资源管理器中打开"
        >
          <FolderOpenIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
    </div>
  );
};

export default PathBar;
