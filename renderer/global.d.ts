import { MediaFile } from '../main/fileUtils';

declare global {
  interface Window {
    ipc: {
      openInExplorer: (path: string) => Promise<void>;
      scanDirectory: (path: string, filterOtherFiles: boolean) => Promise<MediaFile[]>;
      handleFileClick: (file: MediaFile) => Promise<void>;
      getVideoThumbnail: (path: string) => Promise<string>;
      getDrives: () => Promise<string[]>;
      convertToSystemPath: (path: string) => string;
      convertToAppPath: (path: string) => string;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
      close: () => Promise<void>;
      generateThumbnail: (path: string, size: number) => Promise<string>;
      createDirectory: (path: string) => Promise<void>;
      renameFile: (oldPath: string, newPath: string) => Promise<void>;
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
    };
  }
}

export {};
