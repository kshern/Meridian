import React from 'react';

interface ToolbarProps {
  currentPath: string;
  searchQuery: string;
  viewMode: 'thumbnail' | 'detail';
  viewType: 'grid' | 'list';
  onOpenDirectory: () => void;
  onGoBack: () => void;
  onSearchChange: (value: string) => void;
  onViewModeChange: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentPath,
  searchQuery,
  viewMode,
  viewType,
  onOpenDirectory,
  onGoBack,
  onSearchChange,
  onViewModeChange,
}) => {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-100">
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenDirectory}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          选择文件夹
        </button>
        {currentPath && (
          <React.Fragment>
            <button
              onClick={onGoBack}
              disabled={currentPath.split('>').filter(Boolean).length <= 1}
              className={`px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${currentPath.split('>').filter(Boolean).length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
            >
              返回上级
            </button>
          </React.Fragment>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索文件..."
            className="px-3 py-2 text-sm text-gray-600 placeholder-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
        <button
          onClick={onViewModeChange}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          title={
            viewMode === 'detail'
              ? '返回缩略图'
              : viewType === 'grid'
                ? '切换到列表视图'
                : '切换到网格视图'
          }
        >
          {viewMode === 'detail'
            ? '返回缩略图'
            : viewType === 'grid'
              ? '列表视图'
              : '网格视图'}
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
