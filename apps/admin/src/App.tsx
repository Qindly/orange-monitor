import { useEffect, useState } from 'react';
import { DetailItem } from './DetailItem';
interface ErrorItem {
  id: string;
  projectId: string;
  type: 'js_error' | 'promise_error' | 'manual_error' | 'manual_message';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  url: string;
  createdAt: number;
}
interface ErrorListResponse {
  success: boolean;
  total: number;
  data: ErrorItem[];
}


export default function App() {
  const [list, setList] = useState<ErrorItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedError, setSelectedError] = useState<ErrorItem | null>(null);

  const fetchErrors = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/errors');
      const data: ErrorListResponse = await res.json();
      setList(data.data || []);
    } catch (error) {
      console.error('获取错误列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = async () => {
    try {
      const res = await fetch('http://localhost:3000/errors', {
        method: 'DELETE',
      });
      const data = await res.json();
      console.log('清空结果:', data);
      setList([]);
      setSelectedError(null);
    } catch (error) {
      console.error('清空错误失败:', error);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);



  return (
    <div style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>monitor admin</h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <button onClick={fetchErrors} disabled={loading}>
          {loading ? '加载中...' : '刷新列表'}
        </button>
        <button onClick={clearErrors}>清空错误</button>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            minHeight: 400,
          }}
        >
          <h2 style={{ marginTop: 0 }}>错误列表 ({list.length})</h2>
          {list.length === 0 ? (
            <div>暂无错误数据</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {list.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedError(item)}
                  style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: 8,
                    padding: 12,
                    cursor: 'pointer',
                    background:
                      selectedError?.id === item.id ? '#f5f7ff' : '#fff',
                  }}
                >
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>
                    {item.message}
                  </div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <div>type: {item.type}</div>
                    <div>projectId: {item.projectId}</div>
                    <div>time: {new Date(item.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: 16,
            minHeight: 400,
          }}
        >
          <h2 style={{ marginTop: 0 }}>错误详情</h2>
          {!selectedError ? (
            <div>点击左侧某条错误查看详情</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DetailItem label="id" value={selectedError.id} />
              <DetailItem label="projectId" value={selectedError.projectId} />
              <DetailItem label="type" value={selectedError.type} />
              <DetailItem label="message" value={selectedError.message} />
              <DetailItem label="url" value={selectedError.url} />
              <DetailItem
                label="timestamp"
                value={String(selectedError.timestamp)}
              />
              <DetailItem
                label="createdAt"
                value={new Date(selectedError.createdAt).toLocaleString()}
              />
              <DetailItem label="filename" value={selectedError.filename || ''} />
              <DetailItem
                label="line / column"
                value={`${selectedError.lineno || ''} / ${selectedError.colno || ''}`}
              />
              <div>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>stack</div>
                <pre
                  style={{
                    background: '#f7f7f7',
                    padding: 12,
                    borderRadius: 8,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    fontSize: 12,
                  }}
                >
                  {selectedError.stack || '无 stack'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
