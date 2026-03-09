import type { IssueCategory } from '../styles/issue';

export const ISSUE_CATEGORIES: Array<{
  key: IssueCategory;
  label: string;
  description: string;
}> = [
  {
    key: 'js',
    label: 'JS 异常',
    description: '运行时异常、Promise 异常',
  },
  {
    key: 'resource',
    label: '资源异常',
    description: '脚本、样式、图片资源加载失败',
  },
  {
    key: 'api',
    label: 'API 异常',
    description: 'Fetch / XHR 请求失败',
  },
];