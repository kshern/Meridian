const { spawn } = require('child_process');
const path = require('path');

// 获取要打开的测试文件夹路径
const testFolder = process.argv[2] || path.join(__dirname, 'test-folder');

console.log('Starting development mode with folder:', testFolder);

// 设置环境变量
process.env.ELECTRON_ENABLE_LOGGING = 1;
process.env.ELECTRON_ENABLE_STACK_DUMPING = 1;

// 运行 npm run dev，并传递文件夹路径作为参数
const child = spawn('npm.cmd', ['run', 'dev'], {
  stdio: ['inherit', 'inherit', 'inherit'],
  shell: true,
  env: {
    ...process.env,
    ELECTRON_ARGS: `-- "${testFolder}"`,
  }
});

child.on('error', (error) => {
  console.error('Error:', error);
});
