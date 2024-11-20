# Meridian 文件浏览器

一个基于 Electron 和 Next.js 的现代文件浏览器应用，专为图片和视频浏览设计。

## 功能特点

- 📁 垂直滚动浏览文件夹中的图片和视频
- 🖼️ 支持多种图片格式 (jpg, jpeg, png, gif)
- 🎥 支持多种视频格式 (mp4, webm, mov)
- 📂 支持子文件夹导航
- 🔍 快速在文件资源管理器中定位文件
- 💻 跨平台支持 (Windows, macOS, Linux)

## 技术栈

- Electron
- Next.js
- React
- TypeScript
- Tailwind CSS

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

这将同时启动 Next.js 开发服务器和 Electron 应用。

## 使用说明

1. 点击"选择文件夹"按钮或使用右键菜单选择要浏览的文件夹
2. 应用将显示文件夹中的所有图片和视频
3. 向下滚动即可浏览所有媒体文件
4. 点击文件夹图标可以进入子文件夹
5. 使用"在资源管理器中打开"按钮可以快速定位当前文件夹

## 构建应用

构建生产版本：
```bash
npm run build
```

这将创建一个可分发的应用程序包。

## 许可证

MIT License
