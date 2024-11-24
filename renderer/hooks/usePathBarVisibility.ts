import { useState, useEffect } from 'react';
import EventEmitter from 'eventemitter3';

const PATHBAR_VISIBLE_KEY = 'meridian:pathbar-visible';
const pathBarEmitter = new EventEmitter();

export const usePathBarVisibility = () => {
  const [isPathBarVisible, setIsPathBarVisible] = useState(true);

  useEffect(() => {
    const loadPathBarState = () => {
      try {
        const storedValue = localStorage.getItem(PATHBAR_VISIBLE_KEY);
        // If no value is stored, default to true
        setIsPathBarVisible(storedValue === null ? true : storedValue === 'true');
      } catch (error) {
        console.error('Error loading path bar state:', error);
        setIsPathBarVisible(true);
      }
    };

    loadPathBarState();

    const handlePathBarChange = (visible: boolean) => {
      setIsPathBarVisible(visible);
    };

    pathBarEmitter.on('change', handlePathBarChange);
    return () => {
      pathBarEmitter.off('change', handlePathBarChange);
    };
  }, []);

  const savePathBarVisibility = (visible: boolean) => {
    try {
      localStorage.setItem(PATHBAR_VISIBLE_KEY, visible.toString());
      pathBarEmitter.emit('change', visible);
    } catch (error) {
      console.error('Error saving path bar state:', error);
    }
  };

  return {
    isPathBarVisible,
    savePathBarVisibility
  };
};
