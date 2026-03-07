import path from 'path';
import { existsSync } from 'fs';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

type ErrorType =
  | 'js_error'
  | 'promise_error'
  | 'manual_error'
  | 'manual_message';
interface MonitorEventPayload {
  projectId: string;
  type: ErrorType;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
}

interface StoredError extends MonitorEventPayload {
  id: string;
  createdAt: number;
}

const errorStore: StoredError[] = [];

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'server is running',
  });
});

//接收上报
app.post('/report', (req, res) => {
  const body = req.body as Partial<MonitorEventPayload>;
  if (!body.projectId || !body.type || !body.message || !body.timestamp || !body.url) {
    return res.status(400).json({
      success: false,
      message: '缺少必要字段',
    });
  }
  const errorItem: StoredError = {
    id: createId(),
    projectId: body.projectId,
    type: body.type,
    message: body.message,
    stack: body.stack || '',
    filename: body.filename || '',
    lineno: body.lineno,
    colno: body.colno,
    timestamp: body.timestamp,
    url: body.url,
    createdAt: Date.now(),
  };
  // 新数据放前面，方便查看最新错误
  errorStore.unshift(errorItem);
  console.log('收到错误上报:');
  console.log(errorItem);
  return res.json({
    success: true,
    message: '收到上报',
    data: {
      id: errorItem.id,
    },
  });
});


// 获取错误列表
app.get('/errors', (req, res) => {
  const { projectId, type, keyword } = req.query;
  let list = [...errorStore];
  if (projectId && typeof projectId === 'string') {
    list = list.filter((item) => item.projectId === projectId);
  }
  if (type && typeof type === 'string') {
    list = list.filter((item) => item.type === type);
  }
  if (keyword && typeof keyword === 'string') {
    list = list.filter(
      (item) =>
        item.message.includes(keyword) ||
        item.stack?.includes(keyword) ||
        item.url.includes(keyword)
    );
  }
  res.json({
    success: true,
    total: list.length,
    data: list,
  });
});

// 获取单条错误详情
app.get('/errors/:id', (req, res) => {
  const { id } = req.params;
  const errorItem = errorStore.find((item) => item.id === id);
  if (!errorItem) {
    return res.status(404).json({
      success: false,
      message: '错误记录不存在',
    });
  }
  res.json({
    success: true,
    data: errorItem,
  });
});


app.delete('/errors', (_req, res) => {
  errorStore.length = 0;
  res.json({
    success: true,
    message: '已清空错误列表',
  });
});

app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});