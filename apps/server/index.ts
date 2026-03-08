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
  | 'resource_error'
  | 'http_error'
  | 'manual_error'
  | 'manual_message';


interface MonitorEventPayload {
  eventId: string;
  projectId: string;
  type: ErrorType;
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  extra?: Record<string, unknown>;
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
  const body = req.body as {
    projectId?: string;
    events?: MonitorEventPayload[];
  };
  if (!body.projectId || !Array.isArray(body.events)) {
    return res.status(400).json({
      success: false,
      message: '请求格式错误，缺少 projectId 或 events',
    });
  }
  const validEvents = body.events.filter(
    (item) => item && item.type && item.message && item.timestamp && item.url
  );
  const storedList: StoredError[] = validEvents.map((item) => ({
    ...item,
    id: createId(),
    createdAt: Date.now(),
  }));
  errorStore.unshift(...storedList);
  console.log(`收到批量错误上报，共 ${storedList.length} 条`);
  console.log(storedList);
  res.json({
    success: true,
    message: '批量上报成功',
    data: {
      count: storedList.length,
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

