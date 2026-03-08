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
    monitor.captureException(new Error('这是一个手动上报的错误'), {
      module: 'test-button',
    });
  };

  const handleManualMessage = () => {
    monitor.captureMessage('这是一条手动上报的普通消息', {
      level: 'info',
    });
  };

  const handleResourceError = () => {
    const img = document.createElement('img');
    img.src = 'http://localhost:9999/not-found-image.png';
    document.body.appendChild(img);
  };

  const handleFetchHttpError = async () => {
    await fetch('http://localhost:3000/not-found-api');
  };

  const handleFetchNetworkError = async () => {
    try {
      await fetch('http://localhost:9999/network-error');
    } catch (error) {
      console.log('fetch network error:', error);
    }
  };

  const handleXhrHttpError = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/not-found-xhr');
    xhr.send();
  };

  const handleXhrNetworkError = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:9999/network-error-xhr');
    xhr.send();
  };

  const handleFlush = () => {
    monitor.flush();
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>playground-react</h1>
      <p>测试多场景异常捕获与批量上报</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={handleJsError}>触发 JS 报错</button>
        <button onClick={handlePromiseError}>触发 Promise 报错</button>
        <button onClick={handleManualError}>手动上报错误</button>
        <button onClick={handleManualMessage}>手动上报消息</button>
        <button onClick={handleResourceError}>触发资源加载错误</button>
        <button onClick={handleFetchHttpError}>触发 fetch 404</button>
        <button onClick={handleFetchNetworkError}>触发 fetch 网络错误</button>
        <button onClick={handleXhrHttpError}>触发 xhr 404</button>
        <button onClick={handleXhrNetworkError}>触发 xhr 网络错误</button>
        <button onClick={handleFlush}>手动 flush</button>
      </div>
    </div>
  );
}

export default App;
