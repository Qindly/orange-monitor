# Orange Monitor

## Server + PostgreSQL (Docker Compose + Prisma)

### 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

### 2. Configure server env

Create `apps/server/.env` and set:

```bash
DATABASE_URL=postgresql://orange_monitor:orange_monitor@localhost:5432/orange_monitor?schema=public
```

You can also reference `apps/server/.env.example`.

### 3. Install dependencies and generate Prisma Client

```bash
pnpm install
pnpm --filter @orange-monitor/collector-api prisma:generate
```

### 4. Create database schema

```bash
pnpm --filter @orange-monitor/collector-api prisma:migrate:deploy
```

If you change Prisma schema later, use:

```bash
pnpm --filter @orange-monitor/collector-api prisma:migrate:dev --name <migration_name>
```

### 5. Run server

```bash
pnpm --filter @orange-monitor/collector-api dev
```

### 6. Verify

```bash
curl http://localhost:3000/health
curl http://localhost:3000/issues
```

## NPM Package Release

Publishable packages:

- `@orange-monitor/protocol`
- `@orange-monitor/sdk-core`

### 1. Build and check packages

```bash
pnpm release:check
```

### 2. Inspect package tarballs before publish

```bash
pnpm release:pack
```

Tarballs are generated in `.artifacts/`.

### 3. Publish (first time with public access)

```bash
pnpm release:publish
```

## Source Map Upload & Stack Symbolication (Local)

Collector API now supports:

- uploading source map files through HTTP API
- symbolicate stack traces via API
- auto-symbolicating incoming stack traces during `/ingest`
- restoring original source context from `sourcesContent`

For a beginner-friendly walkthrough, see [docs/source-map-restore-flow.md](./docs/source-map-restore-flow.md).

### 1. Start collector API

```bash
pnpm --filter @orange-monitor/collector-api dev
```

### 2. Build react-demo to generate minified bundle + `.map`

```bash
pnpm --filter @orange-monitor/monitor-web build
```

`apps/react-demo` now reports `release: local-test` by default, so the uploaded source map release should match `local-test`.

### 3. Upload source map via API

```bash
curl -X POST http://localhost:3000/projects/react-demo/sourcemaps \
  -H "Content-Type: application/json" \
  -d "{\"release\":\"local-test\",\"artifacts\":[{\"minifiedFile\":\"assets/minifiedCrash-D9FE3kdg.js\",\"sourceMap\":$(cat apps/react-demo/dist/assets/minifiedCrash-D9FE3kdg.js.map | jq -Rs .)}]}"
```

If you are in PowerShell, it is usually easier to send `sourceMapBase64`.

Uploaded source maps are stored under `.data/sourcemaps/<projectId>/<release>/...`.

### 4. Test symbolication API directly

```bash
curl -X POST http://localhost:3000/projects/react-demo/symbolicate \
  -H "Content-Type: application/json" \
  -d '{"release":"local-test","stack":"TypeError: demo\n    at c (http://localhost:4173/assets/minifiedCrash-D9FE3kdg.js:1:184)"}'
```

The response includes:

- `stackFrames`: restored original source frames
- `formattedStack`: a readable symbolicated stack string
- `appliedArtifacts`: which uploaded bundle files were matched
- `contextLine` / `preContext` / `postContext`: restored source snippet around the mapped line

### 5. Ingest flow

After source maps are uploaded, events sent to `/ingest` are symbolicated automatically before storage.

The Admin event detail page will show both the raw stack and the restored stack/source context.
