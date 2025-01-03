# Meridian 文件浏览器

一个基于 Electron 和 Next.js 的现代文件浏览器应用，专为图片和视频浏览设计。

## 功能特点

- 📁 多种浏览模式
  - 垂直滚动浏览
  - 列表模式浏览
  - 文件夹预览功能
- 🖼️ 强大的媒体支持
  - 支持多种图片格式 (jpg, jpeg, png, gif, webp)
  - 支持多种视频格式 (mp4, webm, mov)
  - 优化的 GIF 和 WebP 处理
  - 图片和视频缩放功能
  - 智能错误提示
- 🎥 增强的视频播放功能
  - 支持键盘快捷键控制（10秒快进/快退）
  - 自定义播放控制
  - 全局音量控制
  - 视频预览功能
  - 视频缩放和拖动
  - 优化的视频预览体验
- 📂 文件管理功能
  - 可伸缩的文件树侧边栏
  - 支持文件过滤和媒体文件筛选
  - 支持子文件夹导航
  - 快速在文件资源管理器中定位文件
- 🎨 界面优化
  - 可自定义的界面布局
  - 统一的主题风格
  - 优化的滚动和缓存机制
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
yarn install
```

2. 启动开发服务器：
```bash
yarn run dev
```

这将同时启动 Next.js 开发服务器和 Electron 应用。

## 使用说明

1. 点击"选择文件夹"按钮或使用右键菜单选择要浏览的文件夹
2. 应用将显示文件夹中的所有图片和视频
3. 使用侧边栏快速浏览和导航文件结构
4. 可以切换不同的浏览模式（垂直滚动/列表模式）
5. 使用文件过滤功能快速找到需要的媒体文件
6. 使用"在资源管理器中打开"按钮可以快速定位当前文件夹

## 构建应用

构建生产版本：
```bash
yarn run build
```

这将创建一个可分发的应用程序包。

## 许可证

MIT License
