import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMonitor } from '@orange-monitor/sdk-core';

initMonitor({
  dsn: 'http://localhost:3000/report',
  projectId: 'playground-react',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
