import { contextBridge, ipcRenderer } from 'electron';
import path from 'path';
import { MediaFile } from './fileUtils';

interface IpcApi {
  openInExplorer(path: string): Promise<void>;
  scanDirectory(path: string, filterOtherFiles: boolean): Promise<MediaFile[]>;
  convertToSystemPath(path: string): string;
  convertToAppPath(path: string): string;
  getDrives(): Promise<string[]>;
  handleFileClick(file: MediaFile): Promise<void>;
  getVideoThumbnail(path: string): Promise<string>;
  createDirectory(path: string): Promise<void>;
  renameFile(oldPath: string, newPath: string): Promise<void>;
  on(channel: string, callback: (...args: any[]) => void): () => void;
}

interface ElectronAPI {
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
  generateThumbnail(path: string, size: number): Promise<string>;
  ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
  };
}

const ipcApi: IpcApi = {
  async openInExplorer(path: string) {
    return ipcRenderer.invoke('open-in-explorer', path);
  },
  async scanDirectory(path: string, filterOtherFiles: boolean) {
    return ipcRenderer.invoke('scan-directory', path, filterOtherFiles);
  },
  convertToSystemPath(inputPath: string) {
    if (process.platform === 'win32') {
      return inputPath.replace(/\//g, '\\');
    }
    return inputPath;
  },
  convertToAppPath(inputPath: string) {
    return inputPath.replace(/\\/g, '/');
  },
  async getDrives() {
    return ipcRenderer.invoke('get-drives');
  },
  async handleFileClick(file: MediaFile) {
    return ipcRenderer.invoke('handle-file-click', file);
  },
  async getVideoThumbnail(path: string) {
    return ipcRenderer.invoke('get-video-thumbnail', path);
  },
  async createDirectory(path: string) {
    return ipcRenderer.invoke('createDirectory', path);
  },
  async renameFile(oldPath: string, newPath: string) {
    return ipcRenderer.invoke('renameFile', oldPath, newPath);
  },
  on(channel: string, callback: (...args: any[]) => void) {
    const subscription = (_event: any, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  }
};

const electronApi: ElectronAPI = {
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window'),
  generateThumbnail: (path: string, size: number) => ipcRenderer.invoke('generate-thumbnail', path, size),
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  },
};

contextBridge.exposeInMainWorld('ipc', ipcApi);
contextBridge.exposeInMainWorld('electron', electronApi);
