import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { MediaFile } from './fileUtils';
import * as path from 'path';

declare global {
  interface Window {
    ipc: FileAPI;
    electron: ElectronAPI;
  }
}

interface FileAPI {
  send(channel: string, value: unknown): void;
  on(channel: string, callback: (...args: unknown[]) => void): () => void;
  scanDirectory(path: string): Promise<MediaFile[]>;
  openDirectory(): Promise<string>;
  readTextFile(path: string): Promise<string>;
  openInExplorer(path: string): Promise<void>;
  convertToAppPath(path: string): string;
  convertToSystemPath(path: string): string;
  getDrives(): Promise<string[]>;
  handleFileClick(file: MediaFile): Promise<void>;
  saveSidebarWidth(width: number): Promise<void>;
  getSidebarWidth(): Promise<number>;
  savePathBarVisible(visible: boolean): Promise<void>;
  getPathBarVisible(): Promise<boolean>;
  getTheme(): Promise<string>;
  saveTheme(theme: string): Promise<void>;
}

interface ElectronAPI {
  scanDirectory(dirPath: string): Promise<MediaFile[]>;
  getDrives(): Promise<string[]>;
  openDirectory(): Promise<string>;
  readTextFile(filePath: string): Promise<string>;
  openInExplorer(path: string): Promise<void>;
  handleFileClick(file: any): Promise<void>;
  minimize(): Promise<void>;
  maximize(): Promise<void>;
  close(): Promise<void>;
}

const handler: FileAPI = {
  send(channel: string, value: unknown) {
    ipcRenderer.send(channel, value);
  },
  on(channel: string, callback: (...args: unknown[]) => void) {
    const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      callback(...args);
    ipcRenderer.on(channel, subscription);

    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },
  async scanDirectory(path: string) {
    return ipcRenderer.invoke('scan-directory', path);
  },
  async openDirectory() {
    return ipcRenderer.invoke('open-directory');
  },
  async readTextFile(path: string) {
    return ipcRenderer.invoke('read-text-file', path);
  },
  async openInExplorer(path: string) {
    return ipcRenderer.invoke('open-in-explorer', path);
  },
  convertToAppPath(appPath: string) {
    // 统一将所有系统的路径分隔符转换为 >
    return appPath.replace(/[\\/]+/g, '>').replace(/^>+|>+$/g, '');
  },
  convertToSystemPath(appPath: string) {
    // 使用 path.sep 获取当前系统的路径分隔符
    return appPath.replace(/>/g, path.sep);
  },
  async getDrives() {
    return ipcRenderer.invoke('get-drives');
  },
  async handleFileClick(file: MediaFile) {
    return ipcRenderer.invoke('handle-file-click', file);
  },
  async saveSidebarWidth(width: number) {
    return ipcRenderer.invoke('save-sidebar-width', width);
  },
  async getSidebarWidth() {
    return ipcRenderer.invoke('get-sidebar-width');
  },
  async savePathBarVisible(visible: boolean) {
    return ipcRenderer.invoke('save-pathbar-visible', visible);
  },
  async getPathBarVisible() {
    return ipcRenderer.invoke('get-pathbar-visible');
  },
  async getTheme() {
    return ipcRenderer.invoke('getTheme');
  },
  async saveTheme(theme: string) {
    return ipcRenderer.invoke('saveTheme', theme);
  }
};

const electronHandler: ElectronAPI = {
  scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan-directory', dirPath),
  getDrives: () => ipcRenderer.invoke('get-drives'),
  openDirectory: () => ipcRenderer.invoke('open-directory'),
  readTextFile: (filePath: string) => ipcRenderer.invoke('read-text-file', filePath),
  openInExplorer: (path: string) => ipcRenderer.invoke('open-in-explorer', path),
  handleFileClick: (file: any) => ipcRenderer.invoke('handle-file-click', file),
  minimize: () => ipcRenderer.invoke('minimize-window'),
  maximize: () => ipcRenderer.invoke('maximize-window'),
  close: () => ipcRenderer.invoke('close-window')
};

contextBridge.exposeInMainWorld('ipc', handler);
contextBridge.exposeInMainWorld('electron', electronHandler);

export type IpcHandler = typeof handler;
