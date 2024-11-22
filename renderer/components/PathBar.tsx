import FolderOpenIcon from '@heroicons/react/24/outline/FolderOpenIcon';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // 分割路径并过滤空字符串
  const pathParts = currentPath.split('>').filter(Boolean);

  // 样式类
  const pathSegmentClasses = isDark
    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";

  const separatorClasses = isDark
    ? "text-gray-600"
    : "text-gray-400";

  const buttonClasses = isDark
    ? "p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-all duration-200"
    : "p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200";

  return (
    <div className={`flex items-center px-2 py-1 border-b justify-between ${
      isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
    }`}>
      <div className="flex items-center gap-1 text-sm">
        {/* 特殊处理驱动器 */}
        <button
          className={`px-1.5 py-0.5 rounded ${pathSegmentClasses}`}
          onClick={() => onPathSegmentClick(0)}
        >
          {pathParts[0]}
        </button>

        {/* 处理其余路径部分 */}
        {pathParts.slice(1).map((part, index) => (
          <React.Fragment key={index + 1}>
            <span className={separatorClasses}>{'>'}</span>
            <button
              className={`px-1.5 py-0.5 rounded ${pathSegmentClasses}`}
              onClick={() => onPathSegmentClick(index + 1)}
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenInExplorer}
          className={buttonClasses}
          title="在资源管理器中打开"
        >
          <FolderOpenIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PathBar;
