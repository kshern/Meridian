import React from 'react';
import { ChevronRightIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
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

  return (
    <div className={`flex items-center justify-between h-9 px-4 ${colors.backgroundSecondary} ${colors.border} border-b`}>
      <div className="flex items-center gap-1 text-sm overflow-x-auto">
        {pathParts.map((part, index) => {
          const isLast = index === pathParts.length - 1;

          return (
            <React.Fragment key={index}>
              <button
                onClick={() => onPathSegmentClick(index)}
                className={`
                  px-1.5 py-0.5 rounded transition-colors whitespace-nowrap
                  ${isLast ? colors.text : colors.textSecondary}
                  ${!isLast && colors.backgroundHover}
                `}
              >
                {part}
              </button>
              {!isLast && (
                <ChevronRightIcon className={`w-4 h-4 flex-shrink-0 ${colors.icon}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-center ml-2 flex-shrink-0">
        <button
          onClick={onOpenInExplorer}
          className={`
            p-1.5 rounded-lg transition-colors
            ${colors.textSecondary} ${colors.backgroundHover}
          `}
          title="在资源管理器中打开"
        >
          <FolderOpenIcon className={`w-5 h-5 ${colors.icon}`} />
        </button>
      </div>
    </div>
  );
};

export default PathBar;
