import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMonitor } from '@orange-monitor/sdk-core';
export const monitor = initMonitor({
  dsn: 'http://localhost:3000/ingest',
  projectId: 'playground-react',
  batchSize: 3,
  flushInterval: 5000,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
