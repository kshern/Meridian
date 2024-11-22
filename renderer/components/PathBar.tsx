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
  const { colors } = useTheme();

  // 分割路径并过滤空字符串
  const pathParts = currentPath.split('>').filter(Boolean);

  // 样式类
  const pathSegmentClasses = `${colors.pathBarText} ${colors.pathBarTextHover} ${colors.pathBarSegmentHover}`;
  const separatorClasses = colors.pathBarSeparator;
  const buttonClasses = `p-2 rounded-lg ${colors.pathBarButton} ${colors.pathBarButtonHover} transition-all duration-200`;

  return (
    <div className={`flex items-center px-2 py-1 border-b justify-between ${colors.pathBarBackground} ${colors.pathBarBorder}`}>
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
