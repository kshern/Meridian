import FolderOpenIcon from '@heroicons/react/24/outline/FolderOpenIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import {
  ListBulletIcon,
  Squares2X2Icon,
  ArrowDownIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import React from 'react';
import { useTheme } from '../hooks/useTheme';

interface PathBarProps {
  currentPath: string;
  viewType: 'grid' | 'list';
  sortByTime: boolean;
  onPathSegmentClick: (index: number) => void;
  onOpenInExplorer: () => void;
  filterOtherFiles: boolean;
  onFilterChange: (value: boolean) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onToggleSort: () => void;
}

const PathBar: React.FC<PathBarProps> = ({
  currentPath,
  viewType,
  sortByTime,
  onPathSegmentClick,
  onOpenInExplorer,
  filterOtherFiles,
  onFilterChange,
  onViewModeChange,
  onToggleSort,
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
        {/* 视图切换按钮 */}
        <button
          onClick={() => onViewModeChange(viewType === 'grid' ? 'list' : 'grid')}
          className={buttonClasses}
          title={viewType === 'grid' ? "切换到列表视图" : "切换到网格视图"}
        >
          {viewType === 'grid' ? (
            <ListBulletIcon className="w-5 h-5" />
          ) : (
            <Squares2X2Icon className="w-5 h-5" />
          )}
        </button>

        {/* 排序切换按钮 */}
        <button
          onClick={onToggleSort}
          className={buttonClasses}
          title={sortByTime ? "按文件名排序" : "按修改时间排序"}
        >
          {sortByTime ? (
            <ClockIcon className="w-5 h-5" />
          ) : (
            <ArrowDownIcon className="w-5 h-5" />
          )}
        </button>

        {/* 仅显示媒体文件按钮 */}
        <button
          onClick={() => onFilterChange(!filterOtherFiles)}
          className={`${buttonClasses} ${filterOtherFiles ? (isDark ? 'bg-gray-700' : 'bg-gray-100') : ''}`}
          title={filterOtherFiles ? "显示所有文件" : "仅显示媒体文件"}
        >
          <PhotoIcon className={`w-5 h-5 ${filterOtherFiles ? (isDark ? 'text-blue-400' : 'text-blue-600') : ''}`} />
        </button>

        {/* 在资源管理器中打开按钮 */}
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
