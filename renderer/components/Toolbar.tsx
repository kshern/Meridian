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
  const { theme, toggleTheme, colors } = useTheme();

  const buttonBaseClasses = "p-2 rounded-lg transition-all duration-200";
  const buttonActiveClasses = `${colors.toolbarButtonActive} ${colors.toolbarButtonActiveHover}`;
  const buttonInactiveClasses = `${colors.toolbarButtonInactive} ${colors.toolbarButtonInactiveHover}`;
  const dividerClasses = `h-5 mx-1 border-l ${colors.toolbarDivider}`;
  const searchInputClasses = `w-full pl-8 pr-8 py-1.5 text-sm rounded-lg focus:outline-none transition-colors duration-200 ${colors.toolbarInput} ${colors.toolbarInputBorder} ${colors.toolbarInputFocus} ${colors.toolbarInputPlaceholder}`;

  return (
    <div className={`flex items-center p-2 border-b select-none ${colors.toolbarBackground} ${colors.toolbarBorder}`} 
      style={{ WebkitAppRegion: 'drag' } as any}>
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
          <MagnifyingGlassIcon className={`w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 ${colors.toolbarSearchIcon}`} />
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
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${colors.toolbarSearchIcon} ${colors.toolbarSearchIconHover}`}
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
          onClick={toggleTheme}
          className={`${buttonBaseClasses} ${buttonInactiveClasses}`}
          title={theme === 'dark' ? "切换到亮色模式" : "切换到暗色模式"}
        >
          {theme === 'dark' ? (
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
            className={`${buttonBaseClasses} ${colors.toolbarCloseButton} ${colors.toolbarCloseButtonHover}`}
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
