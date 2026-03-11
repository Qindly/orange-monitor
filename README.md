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
