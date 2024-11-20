import path from 'path'
import { app, ipcMain, dialog, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { scanDirectory, getFileContent, registerFileAssociation } from './fileUtils'

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

    // 注册为系统默认打开方式
    registerFileAssociation()

    mainWindow = createWindow('main', {
      width: 1000,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: false,
        devTools: true,
      },
    })

    // 处理首次启动的命令行参数
    log.info('Process argv:', process.argv);
    const targetPath = isProd ? process.argv[1] : parseDevArgs(process.argv);
    if (targetPath) {
      log.info('Found initial target path:', targetPath);
      handleStartupPath(targetPath);
    }

    // 处理目录扫描请求
    ipcMain.handle('scan-directory', async (_, dirPath: string) => {
      try {
        return await scanDirectory(dirPath)
      } catch (error) {
        log.error('Error scanning directory:', error)
        throw error
      }
    })

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
        await shell.openPath(path);
        return true;
      } catch (error) {
        log.error('Error opening in explorer:', error);
        return false;
      }
    });

    if (isProd) {
      await mainWindow.loadURL('app://./home')
    } else {
      const port = process.argv[2]
      await mainWindow.loadURL(`http://localhost:${port}/home`)
      // 强制打开开发者工具
      mainWindow.webContents.openDevTools()
    }
  })()

  app.on('window-all-closed', () => {
    app.quit()
  })
}
