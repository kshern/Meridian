import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';

interface InputDialogProps {
  title: string;
  defaultValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  validation?: (value: string) => string | undefined;
}

const InputDialog: React.FC<InputDialogProps> = ({
  title,
  defaultValue = '',
  placeholder,
  onConfirm,
  onCancel,
  isOpen,
  validation
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    onConfirm(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-96 rounded-lg shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <h3 className={`text-lg font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {title}
            </h3>
            <div className="mt-4">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(undefined);
                }}
                placeholder={placeholder}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 
                  ${isDark 
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-400'
                  }
                  ${error ? 'border-red-500' : ''}`}
              />
              {error && (
                <p className="mt-1 text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
          </div>
          <div className={`flex justify-end gap-2 p-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            <button
              type="button"
              onClick={onCancel}
              className={`px-4 py-2 text-sm font-medium rounded-md
                ${isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputDialog;
