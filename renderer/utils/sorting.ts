/**
 * 自然排序比较函数
 * 将字符串中的数字部分作为数字进行比较，而不是字符串比较
 */
export function naturalCompare(a: string, b: string): number {
  const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base'
  });
  return collator.compare(a, b);
}
