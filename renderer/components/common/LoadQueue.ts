// 通用的加载队列类
export class LoadQueue {
  queue: { path: string; resolve: (value: boolean) => void }[] = [];
  processing: Set<string> = new Set();
  private maxConcurrent: number;
  private loadFunc: (path: string) => Promise<boolean>;

  constructor(maxConcurrent: number, loadFunc: (path: string) => Promise<boolean>) {
    this.maxConcurrent = maxConcurrent;
    this.loadFunc = loadFunc;
  }

  async add(path: string): Promise<boolean> {
    if (this.processing.has(path)) {
      return new Promise(resolve => {
        this.queue.push({ path, resolve });
      });
    }

    if (this.processing.size >= this.maxConcurrent) {
      return new Promise(resolve => {
        this.queue.push({ path, resolve });
      });
    }

    return this.process(path);
  }

  private async process(path: string): Promise<boolean> {
    this.processing.add(path);
    try {
      return await this.loadFunc(path);
    } finally {
      this.processing.delete(path);
      this.processNext();
    }
  }

  private processNext() {
    if (this.queue.length === 0 || this.processing.size >= this.maxConcurrent) {
      return;
    }

    const next = this.queue.findIndex(item => !this.processing.has(item.path));
    if (next === -1) return;

    const { path, resolve } = this.queue[next];
    this.queue.splice(next, 1);
    this.process(path).then(resolve);
  }
}
