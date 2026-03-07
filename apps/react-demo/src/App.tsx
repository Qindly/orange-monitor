import { monitor } from './main';

function App() {
  const handleJsError = () => {
    setTimeout(() => {
      throw new Error('这是一个同步 JS 报错');
    }, 0);
  };

  const handlePromiseError = () => {
    Promise.reject(new Error('这是一个 Promise 报错'));
  };

  const handleManualError = () => {
    monitor.captureException(new Error('这是一个手动上报的错误'));
  };

  const handleManualMessage = () => {
    monitor.captureMessage('这是一条手动上报的普通消息');
  };

  const handleFetchErrors = async () => {
    const res = await fetch('http://localhost:3000/errors');
    const data = await res.json();
    console.log('错误列表:', data);
  };

  const handleClearErrors = async () => {
    const res = await fetch('http://localhost:3000/errors', {
      method: 'DELETE',
    });
    const data = await res.json();
    console.log('清空结果:', data);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>playground-react</h1>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={handleJsError}>触发 JS 报错</button>
        <button onClick={handlePromiseError}>触发 Promise 报错</button>
        <button onClick={handleManualError}>手动上报错误</button>
        <button onClick={handleManualMessage}>手动上报消息</button>
        <button onClick={handleFetchErrors}>获取错误列表</button>
        <button onClick={handleClearErrors}>清空错误列表</button>
      </div>
    </div>
  );
}

export default App;
