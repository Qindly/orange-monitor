import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 启用相对时间插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function formatTimestamp(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

export function formatRelativeTime(timestamp: number): string {
  return dayjs(timestamp).fromNow();
}

export function getTimeDiff(start: number, end: number): number {
  return end - start;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${(ms / 60000).toFixed(2)}min`;
}

export { dayjs };
