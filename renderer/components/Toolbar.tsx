import React from 'react';
import {
  ArrowUturnUpIcon,
  ViewColumnsIcon,
  Bars3Icon,
  MapIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ListBulletIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';

interface ToolbarProps {
  currentPath: string;
  searchQuery: string;
  viewMode: string;
  viewType: string;
  showSidebar: boolean;
  showPathBar: boolean;
  onOpenDirectory: () => void;
  onGoBack: () => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: string) => void;
  onToggleSidebar: () => void;
  onTogglePathBar: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentPath,
  searchQuery,
  viewMode,
  viewType,
  showSidebar,
  showPathBar,
  onOpenDirectory,
  onGoBack,
  onSearchChange,
  onViewModeChange,
  onToggleSidebar,
  onTogglePathBar
}) => {
  return (
    <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* 左侧导航按钮组 */}
      <div className="flex items-center space-x-1">
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            showSidebar 
              ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
          title="切换侧边栏"
        >
          <ViewColumnsIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onGoBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
          title="返回上层目录"
        >
          <ArrowUturnUpIcon className="w-5 h-5" />
        </button>

        <div className="h-5 mx-1 border-l border-gray-300 dark:border-gray-600" />

        <button
          onClick={onTogglePathBar}
          className={`p-2 rounded-lg transition-colors ${
            showPathBar 
              ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
          title={showPathBar ? "隐藏地址栏" : "显示地址栏"}
        >
          {!showPathBar ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* 中间空白区域 */}
      <div className="flex-1" />

      {/* 右侧功能区 */}
      <div className="flex items-center space-x-2">
        {/* 搜索框 */}
        <div className="relative w-64">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="在当前目录搜索..."
            className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="h-5 mx-1 border-l border-gray-300 dark:border-gray-600" />

        {/* 视图切换按钮 */}
        <button
          onClick={() => onViewModeChange(viewType === 'grid' ? 'list' : 'grid')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
          title={viewType === 'grid' ? "切换到列表视图" : "切换到网格视图"}
        >
          {viewType === 'grid' ? (
            <ListBulletIcon className="w-5 h-5" />
          ) : (
            <Squares2X2Icon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
