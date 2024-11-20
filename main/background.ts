import path from 'path'
import { app, ipcMain, dialog, shell } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { scanDirectory, getFileContent, registerFileAssociation } from './fileUtils'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

  // 注册为系统默认打开方式
  registerFileAssociation()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // 允许加载本地文件
    },
  })

  // 处理目录扫描请求
  ipcMain.handle('scan-directory', async (_, dirPath: string) => {
    try {
      return await scanDirectory(dirPath)
    } catch (error) {
      console.error('Error scanning directory:', error)
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
      console.error('Error reading text file:', error)
      throw error
    }
  })

  // 处理打开文件资源管理器
  ipcMain.handle('open-in-explorer', async (_, path: string) => {
    try {
      await shell.openPath(path);
      return true;
    } catch (error) {
      console.error('Error opening in explorer:', error);
      return false;
    }
  });

  // 处理命令行参数
  app.on('second-instance', (_, argv) => {
    if (process.platform === 'win32') {
      const dirPath = argv.slice(1)[0]
      if (dirPath) {
        mainWindow.webContents.send('open-path', dirPath)
      }
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})
