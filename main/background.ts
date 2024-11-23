import path from 'path'
import { app, ipcMain, dialog, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { scanDirectory, getFileContent, MediaFile } from './fileUtils'
import * as fs from 'fs'
import Store from 'electron-store'
import { generateVideoThumbnail } from './videoUtils';
import { generateThumbnail } from './thumbnailGenerator';

// 初始化 electron-store
const store = new Store({
  name: 'freader-settings',
  defaults: {
    theme: null,
    sidebarWidth: 280,
    pathBarVisible: true
  }
});

// 设置日志输出
const log = {
  info: (...args: any[]) => {
    console.log('\x1b[36m%s\x1b[0m', '[Meridian]', ...args);
  },
  error: (...args: any[]) => {
    console.error('\x1b[31m%s\x1b[0m', '[Meridian Error]', ...args);
  }
};

log.info('Starting Meridian...');
log.info('Process arguments:', process.argv);

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

let mainWindow: any;

// 注册所有 IPC 处理程序
const registerIpcHandlers = () => {
  // 处理目录扫描请求
  ipcMain.handle('scan-directory', async (_, dirPath: string, filterOtherFiles?: boolean) => {
    try {
      return await scanDirectory(dirPath, filterOtherFiles)
    } catch (error) {
      log.error('Error scanning directory:', error)
      throw error
    }
  })

  // 处理获取驱动器列表请求
  ipcMain.handle('get-drives', async () => {
    try {
      // Windows 系统固定的驱动器盘符
      const drives = ['A:', 'B:', 'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 
                     'N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'];
      
      // 检查哪些驱动器是可用的
      const availableDrives = await Promise.all(
        drives.map(async drive => {
          try {
            await fs.promises.access(drive + '\\');
            return drive;
          } catch {
            return null;
          }
        })
      );

      // 过滤掉不可用的驱动器
      return availableDrives.filter(drive => drive !== null);
    } catch (error) {
      log.error('Error getting drives:', error);
      throw error
    }
  });

  // 处理打开目录对话框
  ipcMain.handle('open-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    })
    return result.filePaths[0]
  })

  // 处理文本文件读取
  ipcMain.handle('read-text-file', async (_, filePath: string) => {
    try {
      return await getFileContent(filePath)
    } catch (error) {
      log.error('Error reading text file:', error)
      throw error
    }
  })

  // 处理打开文件资源管理器
  ipcMain.handle('open-in-explorer', async (_, path: string) => {
    try {
      await shell.showItemInFolder(path)
    } catch (error) {
      log.error('Error opening in explorer:', error)
      throw error
    }
  });

  // 处理文件点击
  ipcMain.handle('handle-file-click', async (_, file: MediaFile) => {
    try {
      if (mainWindow) {
        mainWindow.webContents.send('file-clicked', file);
      }
    } catch (error) {
      log.error('Error handling file click:', error);
      throw error;
    }
  });

  // 处理缩略图生成
  ipcMain.handle('generate-thumbnail', async (_, imagePath: string, size: number) => {
    try {
      return await generateThumbnail(imagePath, size);
    } catch (error) {
      log.error('Error generating thumbnail:', error);
      return '';
    }
  });

  // 处理视频缩略图生成
  ipcMain.handle('get-video-thumbnail', async (_, videoPath: string) => {
    try {
      const thumbnailPath = await generateVideoThumbnail(videoPath);
      return thumbnailPath;
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      return null;
    }
  });

  // 保存侧边栏宽度
  ipcMain.handle('save-sidebar-width', async (_, width: number) => {
    try {
      store.set('sidebarWidth', width);
      return true;
    } catch (error) {
      log.error('Error saving sidebar width:', error);
      throw error;
    }
  });

  // 获取侧边栏宽度
  ipcMain.handle('get-sidebar-width', async () => {
    try {
      return store.get('sidebarWidth', 280);
    } catch (error) {
      log.error('Error getting sidebar width:', error);
      throw error;
    }
  });

  // 保存地址栏显示状态
  ipcMain.handle('save-pathbar-visible', async (_, visible: boolean) => {
    try {
      store.set('pathBarVisible', visible);
      return true;
    } catch (error) {
      log.error('Error saving path bar state:', error);
      throw error;
    }
  });

  // 获取地址栏显示状态
  ipcMain.handle('get-pathbar-visible', async () => {
    try {
      return store.get('pathBarVisible', true);
    } catch (error) {
      log.error('Error getting path bar state:', error);
      return true; // 默认显示
    }
  });

  // 保存主题设置
  ipcMain.handle('getTheme', async () => {
    try {
      return store.get('theme', null);
    } catch (error) {
      log.error('Error getting theme:', error);
      throw error;
    }
  });

  // 获取主题设置
  ipcMain.handle('saveTheme', async (_, theme: string) => {
    try {
      store.set('theme', theme);
      return true;
    } catch (error) {
      log.error('Error saving theme:', error);
      throw error;
    }
  });

  // 处理窗口最小化
  ipcMain.handle('minimize-window', () => {
    mainWindow.minimize();
  });

  // 处理窗口最大化/还原
  ipcMain.handle('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  // 处理窗口关闭
  ipcMain.handle('close-window', () => {
    mainWindow.close();
  });
}

// 处理启动参数
const handleStartupPath = (targetPath: string) => {
  log.info('Handling startup path:', targetPath);
  if (!targetPath) {
    log.info('No target path provided');
    return;
  }
  if (!mainWindow) {
    log.info('Main window not ready');
    return;
  }
  
  const normalizedPath = path.normalize(targetPath)
  log.info('Normalized path:', normalizedPath);
  
  // 等待窗口加载完成后再发送路径
  if (mainWindow.webContents.isLoading()) {
    log.info('Window is still loading, waiting...');
    mainWindow.webContents.once('did-finish-load', () => {
      log.info('Window loaded, sending path');
      mainWindow.webContents.send('open-path', normalizedPath);
    });
  } else {
    log.info('Window ready, sending path immediately');
    mainWindow.webContents.send('open-path', normalizedPath);
  }
}

// 开发模式下解析命令行参数
const parseDevArgs = (argv: string[]) => {
  log.info('Parsing dev args:', argv);
  // 查找 '--' 后的第一个参数
  const dashIndex = argv.indexOf('--');
  if (dashIndex !== -1 && argv.length > dashIndex + 1) {
    const targetPath = argv[dashIndex + 1];
    log.info('Found path after --:', targetPath);
    return targetPath;
  }
  return null;
}

// 单实例锁
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  log.info('Another instance is running, quitting');
  app.quit()
} else {
  app.on('second-instance', (_, commandLine) => {
    log.info('Second instance command line:', commandLine);
    const targetPath = isProd ? commandLine[1] : parseDevArgs(commandLine);
    if (targetPath) {
      log.info('Found target path in second instance:', targetPath);
      handleStartupPath(targetPath);
    }
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  ;(async () => {
    await app.whenReady()
    log.info('App is ready');

    mainWindow = createWindow('main', {
      width: 1000,
      height: 600,
      frame: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    })

    // 立即注册 IPC 处理程序
    registerIpcHandlers()

    if (isProd) {
      await mainWindow.loadURL('app://./home')
    } else {
      const port = process.argv[2]
      await mainWindow.loadURL(`http://localhost:${port}/home`)
      mainWindow.webContents.openDevTools()
    }

    // 处理首次启动的命令行参数
    log.info('Process argv:', process.argv);
    const targetPath = isProd ? process.argv[1] : parseDevArgs(process.argv);
    if (targetPath) {
      log.info('Found initial target path:', targetPath);
      handleStartupPath(targetPath);
    }
  })()

  app.on('window-all-closed', () => {
    app.quit()
  })
}
