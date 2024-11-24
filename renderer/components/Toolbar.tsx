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
  Squares2X2Icon,
  MinusIcon,
  Square2StackIcon,
  XCircleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../hooks/useTheme';

interface ToolbarProps {
  currentPath: string;
  searchQuery: string;
  viewMode: string;
  viewType: 'grid' | 'list';
  showSidebar: boolean;
  showPathBar: boolean;
  onOpenDirectory: () => void;
  onGoBack: () => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
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
  const { theme, saveTheme } = useTheme();
  const isDark = theme === 'dark';
  console.log('theme',theme);
  
  const buttonBaseClasses = "p-2 rounded-lg transition-all duration-200";
  const buttonActiveClasses = isDark 
    ? "bg-gray-700 text-blue-400 hover:bg-gray-600" 
    : "bg-gray-100 text-blue-600 hover:bg-gray-200";
  const buttonInactiveClasses = isDark
    ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  const dividerClasses = isDark
    ? "h-5 mx-1 border-l border-gray-600"
    : "h-5 mx-1 border-l border-gray-300";
  const searchInputClasses = `w-full pl-8 pr-8 py-1.5 text-sm rounded-lg focus:outline-none transition-colors duration-200 ${
    isDark 
      ? "border-gray-600 focus:border-blue-400 bg-gray-700 text-gray-100 placeholder-gray-500" 
      : "border-gray-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
  }`;

  return (
    <div className={`flex items-center p-2 border-b select-none ${
      isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
    }`} style={{ WebkitAppRegion: 'drag' } as any}>
      {/* 左侧导航按钮组 */}
      <div className="flex items-center space-x-1" style={{ WebkitAppRegion: 'no-drag'} as any}>
        <button
          onClick={onToggleSidebar}
          className={`${buttonBaseClasses} ${showSidebar ? buttonActiveClasses : buttonInactiveClasses}`}
          title="切换侧边栏"
        >
          <ViewColumnsIcon className="w-5 h-5" />
        </button>

        <button
          onClick={onGoBack}
          className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
          title="返回上层目录"
        >
          <ArrowUturnUpIcon className="w-5 h-5" />
        </button>

        <div className={dividerClasses} />

        <button
          onClick={onTogglePathBar}
          className={`${buttonBaseClasses} ${showPathBar ? buttonActiveClasses : buttonInactiveClasses}`}
          title={showPathBar ? "隐藏地址栏" : "显示地址栏"}
        >
          {!showPathBar ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* 中间空白区域 */}
      <div className="flex-1" />

      {/* 右侧功能区 */}
      <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* 搜索框 */}
        <div className="relative w-64">
          <MagnifyingGlassIcon className={`w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 ${
            isDark ? "text-gray-500" : "text-gray-400"
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="在当前目录搜索..."
            className={searchInputClasses}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                isDark 
                  ? "text-gray-500 hover:text-gray-300" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className={dividerClasses} />

        {/* 视图切换按钮 */}
        <button
          onClick={() => onViewModeChange(viewType === 'grid' ? 'list' : 'grid')}
          className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
          title={viewType === 'grid' ? "切换到列表视图" : "切换到网格视图"}
        >
          {viewType === 'grid' ? (
            <ListBulletIcon className="w-5 h-5" />
          ) : (
            <Squares2X2Icon className="w-5 h-5" />
          )}
        </button>

        <div className={dividerClasses} />

        {/* 主题切换按钮 */}
        <button
          onClick={() => saveTheme(isDark ? 'light' : 'dark')}
          className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
          title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
        >
          {isDark ? (
            <SunIcon className="w-5 h-5" />
          ) : (
            <MoonIcon className="w-5 h-5" />
          )}
        </button>

        <div className={dividerClasses} />

        {/* 窗口控制按钮 */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => window.electron.minimize()}
            className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
            title="最小化"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.electron.maximize()}
            className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
            title="最大化"
          >
            <Square2StackIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.electron.close()}
            className={`${buttonBaseClasses} ${
              isDark 
                ? "text-gray-400 hover:bg-red-600/90 hover:text-white" 
                : "text-gray-600 hover:bg-red-500 hover:text-white"
            }`}
            title="关闭"
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
