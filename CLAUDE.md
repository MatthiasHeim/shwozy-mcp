# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build (compiles TypeScript and makes dist/index.js executable)
npm run build

# Development - HTTP mode (default, for multi-user hosting)
npm run dev

# Development - Stdio mode (for local CLI use)
npm run dev:stdio

# Test with MCP Inspector (stdio mode)
npm run inspect

# Run unit tests
npm test

# Run E2E tests (requires server running or uses webServer config)
npm run test:e2e
```

## Architecture

This is an MCP (Model Context Protocol) server that provides Claude Code access to Shwozy voice note actions via Supabase. It supports two transport modes for different deployment scenarios.

### Transport Modes

**HTTP Mode** (default): Multi-user support via Streamable HTTP transport
- Runs Express server on port 3000 (or `PORT` env var)
- API key passed via `Authorization: Bearer <key>` header per-request
- Serves landing page at `/` and MCP endpoints at `/mcp`
- Used for hosted deployment on Railway

**Stdio Mode**: Single-user mode for local CLI use
- Set `MCP_TRANSPORT=stdio` environment variable
- API key from `SHWOZY_API_KEY` environment variable
- Traditional MCP stdio transport for local development

### Core Flow
1. **Entry point** (`src/index.ts`): Detects transport mode via `MCP_TRANSPORT` env var, initializes appropriate server
2. **HTTP Server** (`src/server.ts`): Express app with Streamable HTTP transport, per-request authentication, session management
3. **Authentication** (`src/db/supabase.ts`): API key is SHA-256 hashed and validated via `validate_api_key` RPC, returning a user_id that scopes all queries
4. **Tool routing** (`src/tools/index.ts`): Maps tool names to handlers, passes validated userId to each

### Tool Implementations
Each tool in `src/tools/` receives `(args: unknown, userId: string)`:
- `listPending.ts`: Queries unexecuted action_outputs with recording/action joins
- `getOutput.ts`: Fetches single output with full details and transcript
- `markExecuted.ts`: Updates executed flag and timestamp
- `searchRecordings.ts`: Text search on recording titles

### Type System
`src/types.ts` contains:
- Zod schemas for tool input validation (e.g., `ListPendingArgsSchema`)
- TypeScript interfaces for tool responses (e.g., `PendingOutput`, `OutputDetail`)

### Database Tables (Supabase)
- `action_outputs`: Main table with user_id, recording FK, action FK, output_data JSONB
- `recordings`: Voice recordings with title, duration
- `actions`: Action definitions (Meeting Notes, Task List, etc.)

## Environment Variables

### HTTP Mode (Hosted)
Set in Railway dashboard or hosting provider:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Publishable anon key (works with RLS)
- `PORT`: Server port (optional, defaults to 3000)

Note: `SHWOZY_API_KEY` is NOT set server-side - users pass their own key via Authorization header.

### Stdio Mode (Local)
Set in Claude Code MCP config:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Publishable anon key (works with RLS)
- `SHWOZY_API_KEY`: Per-user API key generated in Shwozy app
- `MCP_TRANSPORT`: Set to `stdio` to enable stdio mode

## Project Structure

```
src/
├── index.ts           # Entry point, transport mode detection
├── server.ts          # Express HTTP server with MCP Streamable HTTP transport
├── mcp.ts             # MCP server factory function
├── db/
│   ├── supabase.ts    # Supabase client, auth functions
│   └── supabase.test.ts
├── tools/             # Tool implementations
│   ├── index.ts       # Tool routing
│   ├── listPending.ts
│   ├── getOutput.ts
│   ├── markExecuted.ts
│   └── searchRecordings.ts
├── types.ts           # Zod schemas and TypeScript types
└── public/            # Landing page static assets
    └── index.html

e2e/
└── landing.spec.ts    # Playwright E2E tests

Config files:
├── railway.json       # Railway deployment config
├── vitest.config.ts   # Unit test config
└── playwright.config.ts # E2E test config
```

## Testing

Unit tests use Vitest with mocked Supabase calls. E2E tests use Playwright to test the landing page UI and health endpoint.

```bash
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests (starts server automatically)
npm run test:e2e:ui   # Run E2E tests with Playwright UI
```
