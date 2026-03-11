# @orange-monitor/sdk-core

Browser monitoring SDK for collecting JS, Promise, HTTP, and resource errors.

## Install

```bash
pnpm add @orange-monitor/sdk-core
```

## Quick Start

```ts
import { initMonitor } from '@orange-monitor/sdk-core';

const monitor = initMonitor({
  dsn: 'http://localhost:3000/ingest',
  projectId: 'your-project-id'
});
```

## API

- `initMonitor(options)` initializes the monitor and returns a `MonitorClient`.
- `monitor.captureException(error, options?)` manually reports an exception.
- `monitor.captureMessage(message, options?)` manually reports a message.
