import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMonitor } from '../../../packages/sdk-core/src';
export const monitor = initMonitor({
  dsn: 'http://localhost:3000/report',
  projectId: 'playground-react',
  batchSize: 3,
  flushInterval: 5000,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
