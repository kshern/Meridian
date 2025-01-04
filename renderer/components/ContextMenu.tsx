import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 确保菜单不会超出屏幕边界
  const adjustPosition = () => {
    if (!menuRef.current) return { x, y };
    
    const menuRect = menuRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let adjustedX = x;
    let adjustedY = y;

    if (x + menuRect.width > windowWidth) {
      adjustedX = windowWidth - menuRect.width;
    }

    if (y + menuRect.height > windowHeight) {
      adjustedY = windowHeight - menuRect.height;
    }

    return { x: adjustedX, y: adjustedY };
  };

  const position = adjustPosition();

  return (
    <div
      ref={menuRef}
      className={`fixed z-50 min-w-[200px] py-1 rounded-lg shadow-lg ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`w-full px-4 py-2 text-left flex items-center space-x-2 ${
            isDark
              ? `${item.disabled ? 'text-gray-500' : 'text-gray-200'} hover:bg-gray-700`
              : `${item.disabled ? 'text-gray-400' : 'text-gray-700'} hover:bg-gray-100`
          } disabled:cursor-not-allowed transition-colors duration-150`}
          onClick={() => {
            if (!item.disabled) {
              item.onClick();
              onClose();
            }
          }}
          disabled={item.disabled}
        >
          {item.icon && <span className="w-5 h-5">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
