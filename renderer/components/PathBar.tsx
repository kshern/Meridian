import FolderOpenIcon from '@heroicons/react/24/outline/FolderOpenIcon';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useTheme } from '../hooks/useTheme';

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
  const { theme, toggleTheme } = useTheme();
  // 分割路径并过滤空字符串
  const pathParts = currentPath.split('>').filter(Boolean);

  return (
    <div className="flex items-center px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 justify-between">
      <div className="flex items-center gap-1 text-sm">
        {/* 特殊处理驱动器 */}
        <button
          className="hover:text-blue-500 text-gray-600 dark:text-gray-300"
          onClick={() => onPathSegmentClick(0)}
        >
          {pathParts[0]}
        </button>

        {/* 处理其余路径部分 */}
        {pathParts.slice(1).map((part, index) => (
          <React.Fragment key={index + 1}>
            <span className="text-gray-400 dark:text-gray-500">{'>'}</span>
            <button
              className="hover:text-blue-500 text-gray-600 dark:text-gray-300"
              onClick={() => onPathSegmentClick(index + 1)}
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {theme === 'dark' ? (
            <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
        <button
          onClick={onOpenInExplorer}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="在资源管理器中打开"
        >
          <FolderOpenIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};

export default PathBar;
