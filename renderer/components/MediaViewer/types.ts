// types.ts
import { MediaFile } from '@/main/fileUtils';

export interface Position {
  x: number;
  y: number;
}

export interface MediaViewerBaseProps {
  files: MediaFile[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  renderLayoutToggle: () => JSX.Element;
}

export interface MediaItemProps {
  file: MediaFile;
  index: number;
  currentIndex: number;
  isDragging: boolean;
  rotation: number;
  scale: number;
  position: { x: number; y: number };
  layoutMode: 'horizontal' | 'vertical';
  handleMouseDown?: (e: React.MouseEvent) => void;
  handleMouseMove?: (e: React.MouseEvent) => void;
  handleMouseUp?: (e: React.MouseEvent) => void;
}
