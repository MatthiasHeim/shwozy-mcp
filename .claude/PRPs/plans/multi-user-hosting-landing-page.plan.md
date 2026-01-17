# Feature: Multi-User MCP Hosting + Landing Page

## Summary

Transform shwozy-mcp from a single-user stdio-based MCP server to a multi-user hosted service with Streamable HTTP transport, per-request authentication via API key headers, and a product landing page. Deploy on Railway with dual transport support (HTTP for hosted, stdio for local CLI use).

## User Story

As a **Shwozy app user**
I want to **connect my Claude Code to a hosted MCP server using my personal API key**
So that **I can access my voice note actions from any machine without running a local MCP server**

## Problem Statement

Currently:
- MCP server only runs locally via stdio transport
- Single user at a time (API key validated at startup)
- No web presence to explain the product or guide setup
- Users must clone repo and run locally to use the MCP

After:
- Multi-user hosted service accessible via URL
- Per-request auth allows many users simultaneously
- Landing page explains product and generates config
- Users just need an API key to connect

## Solution Statement

1. **Add Streamable HTTP transport** using `@modelcontextprotocol/sdk`'s `StreamableHTTPServerTransport` with Express
2. **Refactor authentication** to validate API key from `Authorization: Bearer <key>` header per-request
3. **Create landing page** with Shwozy brand, setup wizard, and config generator
4. **Deploy to Railway** with health checks and environment variables
5. **Keep stdio mode** for local development and CLI use

## Metadata

| Field            | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| Type             | ENHANCEMENT                                                 |
| Complexity       | HIGH                                                        |
| Systems Affected | server entry point, authentication, transport, landing page |
| Dependencies     | express@^4.21, cors@^2.8, vitest@^3.0, @playwright/test     |
| Estimated Tasks  | 15                                                          |

---

## UX Design

### Before State
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              BEFORE STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐            ║
║   │  User runs  │ ──────► │  MCP Server │ ──────► │  Supabase   │            ║
║   │  npm start  │         │   (stdio)   │         │    (RLS)    │            ║
║   └─────────────┘         └─────────────┘         └─────────────┘            ║
║         │                        │                                            ║
║         │                        │                                            ║
║         ▼                        ▼                                            ║
║   SHWOZY_API_KEY          validateAndSetUser()                               ║
║   (env var)               called ONCE at startup                             ║
║                                                                               ║
║   USER_FLOW:                                                                  ║
║   1. Clone repo                                                               ║
║   2. Set SHWOZY_API_KEY in environment                                        ║
║   3. Run npm start                                                            ║
║   4. Configure Claude Code with local stdio path                              ║
║                                                                               ║
║   PAIN_POINTS:                                                                ║
║   - Must run locally                                                          ║
║   - Single user per process                                                   ║
║   - No web discovery/onboarding                                               ║
║   - Technical setup required                                                  ║
║                                                                               ║
║   DATA_FLOW:                                                                  ║
║   env var → startup validation → cached userId → tool queries                ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### After State
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                               AFTER STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────┐                                                             ║
║   │   Landing   │◄────── User visits shwozy-mcp.railway.app                   ║
║   │    Page     │                                                             ║
║   └──────┬──────┘                                                             ║
║          │                                                                    ║
║          ▼                                                                    ║
║   ┌─────────────┐    Generates JSON config                                    ║
║   │   Config    │───────────────────────────────────────┐                     ║
║   │  Generator  │                                       │                     ║
║   └─────────────┘                                       │                     ║
║                                                         ▼                     ║
║   ┌─────────────┐         ┌─────────────┐         ┌─────────────┐            ║
║   │Claude Code  │ ──────► │  Express    │ ──────► │  Supabase   │            ║
║   │  (remote)   │  POST   │  + MCP      │         │    (RLS)    │            ║
║   └─────────────┘  /mcp   │  Transport  │         └─────────────┘            ║
║         │                 └──────┬──────┘                                     ║
║         │                        │                                            ║
║         ▼                        ▼                                            ║
║   Authorization:           Per-request                                        ║
║   Bearer sk_xxx            validateApiKey()                                   ║
║                                                                               ║
║   ┌───────────────────────────────────────────────────────────────────┐      ║
║   │                    DUAL TRANSPORT SUPPORT                          │      ║
║   ├───────────────────────────────────────────────────────────────────┤      ║
║   │  HTTP Mode (default):  npm start → Express + StreamableHTTP       │      ║
║   │  Stdio Mode:           MCP_TRANSPORT=stdio npm start → stdio      │      ║
║   └───────────────────────────────────────────────────────────────────┘      ║
║                                                                               ║
║   USER_FLOW (hosted):                                                         ║
║   1. Visit landing page                                                       ║
║   2. Paste API key from Shwozy app                                            ║
║   3. Copy generated config                                                    ║
║   4. Add to Claude Code settings                                              ║
║   5. Done!                                                                    ║
║                                                                               ║
║   VALUE_ADD:                                                                  ║
║   - No local setup required                                                   ║
║   - Multi-user simultaneous access                                            ║
║   - Self-service onboarding                                                   ║
║   - Works from any machine                                                    ║
║                                                                               ║
║   DATA_FLOW:                                                                  ║
║   header → per-request validation → userId → tool queries → response         ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Changes
| Location | Before | After | User Impact |
|----------|--------|-------|-------------|
| MCP connection | Local stdio only | Remote HTTP or local stdio | Can use from any machine |
| Authentication | Env var at startup | Header per-request | Multi-user support |
| Onboarding | Clone + configure | Landing page + paste key | 90% faster setup |
| Discovery | None | Product landing page | Self-service education |

---

## Mandatory Reading

**CRITICAL: Implementation agent MUST read these files before starting any task:**

| Priority | File | Lines | Why Read This |
|----------|------|-------|---------------|
| P0 | `src/index.ts` | all | Current server setup - MIRROR dual transport pattern |
| P0 | `src/db/supabase.ts` | all | Auth pattern to REFACTOR for per-request |
| P1 | `src/tools/index.ts` | all | Tool definitions and dispatcher to KEEP unchanged |
| P1 | `src/types.ts` | all | Zod schemas to MIRROR for new validation |
| P2 | `node_modules/@modelcontextprotocol/sdk/dist/esm/examples/server/simpleStreamableHttp.js` | all | SDK example to MIRROR for transport setup |
| P2 | `node_modules/@modelcontextprotocol/sdk/dist/esm/server/express.d.ts` | all | Express helper to USE |

**External Documentation:**
| Source | Section | Why Needed |
|--------|---------|------------|
| [MCP Transports Spec 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports) | Streamable HTTP | Protocol requirements |
| [@modelcontextprotocol/sdk v1.0.0](https://www.npmjs.com/package/@modelcontextprotocol/sdk) | StreamableHTTPServerTransport | API reference |
| [Express 4.x](https://expressjs.com/en/4x/api.html) | Middleware | Static file serving |

---

## Patterns to Mirror

**MCP_SERVER_INITIALIZATION:**
```typescript
// SOURCE: src/index.ts:12-22
// COPY THIS PATTERN for HTTP mode server creation:
const server = new Server(
  {
    name: "shwozy-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

**TOOL_HANDLER_REGISTRATION:**
```typescript
// SOURCE: src/index.ts:24-58
// KEEP THIS PATTERN - tool handlers stay the same:
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOL_DEFINITIONS,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    const userId = getUserId(); // CHANGE: Will become per-request
    const result = await executeTool(name, args || {}, userId);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    // error handling...
  }
});
```

**API_KEY_VALIDATION:**
```typescript
// SOURCE: src/db/supabase.ts:24-61
// REFACTOR THIS PATTERN - make it accept apiKey parameter:
function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

// Current: validates env var, stores in module state
// New: accept key as param, return userId, no module state
```

**ZOD_SCHEMA_PATTERN:**
```typescript
// SOURCE: src/types.ts:7-24
// MIRROR THIS PATTERN for new validation schemas:
export const ListPendingArgsSchema = z.object({
  limit: z.number().optional().default(20),
  action_name: z.string().optional()
});
```

**SUPABASE_QUERY_PATTERN:**
```typescript
// SOURCE: src/tools/listPending.ts:14-37
// KEEP THIS PATTERN - queries stay the same:
const { data, error } = await supabase
  .from("action_outputs")
  .select(`...`)
  .eq("user_id", userId)  // userId now comes from per-request auth
  .eq("executed", false);
```

**ERROR_HANDLING_PATTERN:**
```typescript
// SOURCE: src/tools/getOutput.ts:28-33
// MIRROR THIS PATTERN:
if (error) {
  if (error.code === "PGRST116") {
    throw new Error(`Action output not found: ${output_id}`);
  }
  throw new Error(`Database query failed: ${error.message}`);
}
```

**STREAMABLE_HTTP_TRANSPORT:**
```typescript
// SOURCE: node_modules/@modelcontextprotocol/sdk/dist/esm/examples/server/simpleStreamableHttp.js:473-519
// MIRROR THIS PATTERN for transport setup:
const transports = {};

const mcpPostHandler = async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New session
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: sessionId => {
        transports[sessionId] = transport;
      }
    });
    const server = getServer();
    await server.connect(transport);
  }

  await transport.handleRequest(req, res, req.body);
};
```

---

## Files to Change

| File | Action | Justification |
|------|--------|---------------|
| `src/db/supabase.ts` | UPDATE | Add per-request `validateApiKey(key)` function |
| `src/server.ts` | CREATE | Express + StreamableHTTP + static file serving |
| `src/index.ts` | UPDATE | Dual transport entry point (HTTP vs stdio) |
| `src/public/index.html` | CREATE | Landing page with config generator |
| `src/public/assets/` | CREATE | Store badges, phone mockup SVGs |
| `package.json` | UPDATE | Add deps, scripts, test commands |
| `railway.json` | CREATE | Railway deployment config |
| `vitest.config.ts` | CREATE | Unit test configuration |
| `playwright.config.ts` | CREATE | E2E test configuration |
| `src/db/supabase.test.ts` | CREATE | Auth function unit tests |
| `src/server.test.ts` | CREATE | Express routes unit tests |
| `e2e/landing.spec.ts` | CREATE | Landing page E2E tests |
| `README.md` | UPDATE | Add hosted setup section |
| `CLAUDE.md` | UPDATE | Document new architecture |

---

## NOT Building (Scope Limits)

Explicit exclusions to prevent scope creep:

- **OAuth/OIDC authentication** - Using simple API key auth, not OAuth flow
- **User registration/management** - Users get API keys from Shwozy app, not this server
- **Database migrations** - No schema changes needed, uses existing Supabase tables
- **Rate limiting** - Out of scope for initial release (can add via Railway proxy later)
- **Custom domain** - Will use Railway-provided subdomain initially
- **Analytics/telemetry** - No usage tracking in initial release
- **WebSocket transport** - Using Streamable HTTP per MCP 2025 spec
- **Logo design** - Using placeholder text/icon for now

---

## Shwozy Brand Guidelines

**Brand personality:** Playful, approachable, effortless

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| **Coral** | `#FF6B6B` | Primary accent, CTAs |
| **Soft Purple** | `#9B8AFF` | Secondary accent |
| **Mint** | `#4ECDC4` | Success states |
| **Deep Navy** | `#1A1A2E` | Text, dark backgrounds |
| **Cream** | `#FAFAF8` | Light backgrounds |
| **Warm Gray** | `#6B7280` | Secondary text |

### Typography
- **Headings:** Inter (via Google Fonts CDN)
- **Body:** Inter
- **Monospace:** Fira Code (for config snippets)

### Design Elements
- Rounded corners (16px-24px for cards)
- Soft shadows with color tint
- Playful micro-animations

---

## Step-by-Step Tasks

Execute in order. Each task is atomic and independently verifiable.

### Task 1: UPDATE `package.json` (add dependencies)

- **ACTION**: ADD runtime and dev dependencies
- **IMPLEMENT**:
  ```json
  {
    "dependencies": {
      "express": "^4.21.0",
      "cors": "^2.8.5"
    },
    "devDependencies": {
      "@types/express": "^5.0.0",
      "@types/cors": "^2.8.17",
      "vitest": "^3.0.0",
      "@playwright/test": "^1.49.0"
    },
    "scripts": {
      "start": "node dist/index.js",
      "dev:stdio": "MCP_TRANSPORT=stdio tsx src/index.ts",
      "test": "vitest",
      "test:e2e": "playwright test"
    }
  }
  ```
- **VALIDATE**: `npm install` succeeds

### Task 2: UPDATE `src/db/supabase.ts` (per-request auth)

- **ACTION**: ADD `validateApiKey(key: string)` function
- **IMPLEMENT**:
  - Keep `hashApiKey()` private function (unchanged)
  - Add new exported `validateApiKey(apiKey: string): Promise<string>` that:
    - Hashes the key
    - Calls Supabase RPC `validate_api_key`
    - Returns userId or throws Error (not process.exit)
  - Keep `validateAndSetUser()` for stdio mode backward compat
  - Keep `getUserId()` for stdio mode
- **MIRROR**: `src/db/supabase.ts:40-61` - same RPC call pattern
- **GOTCHA**: Do NOT call `process.exit()` in `validateApiKey` - throw instead
- **VALIDATE**: `npx tsc --noEmit`

### Task 3: CREATE unit tests `src/db/supabase.test.ts`

- **ACTION**: CREATE unit tests for auth functions
- **IMPLEMENT**:
  - Test `validateApiKey()` with mocked Supabase
  - Test valid key returns userId
  - Test invalid key throws error
  - Test hash function produces consistent output
- **PATTERN**: Use vitest with mock
- **VALIDATE**: `npm test src/db/supabase.test.ts`

### Task 4: CREATE `src/server.ts` (Express + MCP transport)

- **ACTION**: CREATE HTTP server with Streamable HTTP transport
- **IMPLEMENT**:
  ```typescript
  import { randomUUID } from "node:crypto";
  import express from "express";
  import cors from "cors";
  import path from "node:path";
  import { fileURLToPath } from "node:url";
  import { Server } from "@modelcontextprotocol/sdk/server/index.js";
  import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
  import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
  import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

  // Create MCP server factory (per-connection)
  // Extract API key from Authorization header
  // Validate per-request, store userId in transport context
  // Serve static files from public/
  // Health check endpoint
  ```
- **MIRROR**: `node_modules/@modelcontextprotocol/sdk/dist/esm/examples/server/simpleStreamableHttp.js:473-619`
- **IMPORTS**: Use SDK's `createMcpExpressApp()` helper
- **GOTCHA**: Must extract `Authorization: Bearer <key>` header and validate per-connection
- **VALIDATE**: `npx tsc --noEmit`

### Task 5: CREATE unit tests `src/server.test.ts`

- **ACTION**: CREATE unit tests for Express routes
- **IMPLEMENT**:
  - Test `/health` returns 200
  - Test `/mcp` POST without auth returns 401
  - Test `/mcp` POST with invalid auth returns 401
  - Test `/` returns HTML
- **PATTERN**: Use vitest with supertest
- **VALIDATE**: `npm test src/server.test.ts`

### Task 6: UPDATE `src/index.ts` (dual transport entry)

- **ACTION**: MODIFY to support both HTTP and stdio modes
- **IMPLEMENT**:
  ```typescript
  const transport = process.env.MCP_TRANSPORT;

  if (transport === "stdio") {
    // Existing stdio logic
    await validateAndSetUser();
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
  } else {
    // HTTP mode (default)
    import("./server.js").then(m => m.startHttpServer());
  }
  ```
- **MIRROR**: Current `src/index.ts:61-74` for stdio path
- **GOTCHA**: Dynamic import for server.ts to avoid loading Express in stdio mode
- **VALIDATE**: `MCP_TRANSPORT=stdio npm run dev` works, `npm run dev` starts HTTP

### Task 7: CREATE `src/public/index.html` (landing page)

- **ACTION**: CREATE single-file landing page
- **IMPLEMENT**:
  - Hero: "Your voice, Claude's memory" with animated waveform background
  - Product explanation section
  - Features grid (4 MCP tools)
  - How it works (3 steps visual)
  - Setup section with config generator:
    - API key input field
    - Live JSON config output
    - Copy button
  - Store badges (Coming Soon placeholders)
  - Mobile responsive (media queries)
- **PATTERN**: Inline CSS + vanilla JS, no build step
- **GOTCHA**: Config generator must use actual deployed URL
- **VALIDATE**: Open in browser, test responsiveness

### Task 8: CREATE `src/public/assets/` (static assets)

- **ACTION**: CREATE SVG assets for landing page
- **IMPLEMENT**:
  - `phone-mockup.svg` - Simple phone frame with placeholder
  - `app-store-badge.svg` - App Store badge (gray "Coming Soon")
  - `play-store-badge.svg` - Play Store badge (gray "Coming Soon")
  - `waveform.svg` - Animated audio waveform for hero
- **PATTERN**: Inline SVGs in HTML or separate files
- **VALIDATE**: Assets load correctly

### Task 9: CREATE `vitest.config.ts`

- **ACTION**: CREATE vitest configuration
- **IMPLEMENT**:
  ```typescript
  import { defineConfig } from "vitest/config";

  export default defineConfig({
    test: {
      globals: true,
      environment: "node",
      include: ["src/**/*.test.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
      },
    },
  });
  ```
- **VALIDATE**: `npm test` runs without config errors

### Task 10: CREATE `playwright.config.ts`

- **ACTION**: CREATE Playwright E2E configuration
- **IMPLEMENT**:
  ```typescript
  import { defineConfig } from "@playwright/test";

  export default defineConfig({
    testDir: "./e2e",
    webServer: {
      command: "npm run dev",
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
    use: {
      baseURL: "http://localhost:3000",
    },
  });
  ```
- **VALIDATE**: Config parses without errors

### Task 11: CREATE `e2e/landing.spec.ts`

- **ACTION**: CREATE E2E tests for landing page
- **IMPLEMENT**:
  - Page loads and hero visible
  - Features grid shows 4 cards
  - Config generator works:
    - Type API key
    - JSON updates
    - Copy button works
  - Mobile viewport test (QR hidden, links shown)
  - Store badges visible
- **PATTERN**: Playwright test syntax
- **VALIDATE**: `npm run test:e2e`

### Task 12: CREATE `railway.json`

- **ACTION**: CREATE Railway deployment config
- **IMPLEMENT**:
  ```json
  {
    "$schema": "https://railway.com/railway.schema.json",
    "build": { "builder": "NIXPACKS" },
    "deploy": {
      "startCommand": "npm start",
      "healthcheckPath": "/health",
      "healthcheckTimeout": 30
    }
  }
  ```
- **VALIDATE**: JSON is valid

### Task 13: UPDATE `README.md`

- **ACTION**: ADD hosted version documentation
- **IMPLEMENT**:
  - Add "Hosted Version (Recommended)" section at top
  - Config example with remote URL
  - Keep "Local Installation" section
  - Update Claude Code config examples
- **VALIDATE**: Markdown renders correctly

### Task 14: UPDATE `CLAUDE.md`

- **ACTION**: UPDATE architecture documentation
- **IMPLEMENT**:
  - Add `server.ts` to architecture section
  - Document dual transport support
  - Add new npm scripts
  - Document environment variables
- **VALIDATE**: Accurate reflection of new codebase

### Task 15: Final Integration Test

- **ACTION**: VERIFY end-to-end functionality
- **IMPLEMENT**:
  - Build: `npm run build`
  - Unit tests: `npm test`
  - E2E tests: `npm run test:e2e`
  - Stdio mode: `MCP_TRANSPORT=stdio npm start`
  - HTTP mode: `npm start` and visit localhost:3000
- **VALIDATE**: All tests pass, both modes work

---

## Testing Strategy

### Unit Tests to Write

| Test File | Test Cases | Validates |
|-----------|------------|-----------|
| `src/db/supabase.test.ts` | validateApiKey valid/invalid, hashApiKey | Auth functions |
| `src/server.test.ts` | health check, auth required, static serving | Express routes |

### E2E Tests to Write

| Test File | Test Cases | Validates |
|-----------|------------|-----------|
| `e2e/landing.spec.ts` | page load, config generator, mobile responsive | Landing page UX |

### Edge Cases Checklist

- [ ] Empty API key in header
- [ ] Malformed API key (not starting with `sk_`)
- [ ] Invalid API key (valid format, wrong key)
- [ ] Missing Authorization header
- [ ] Concurrent requests with different API keys
- [ ] Session reconnection after disconnect
- [ ] Config generator with special characters in API key
- [ ] Mobile viewport breakpoints (320px, 768px, 1024px)

---

## Validation Commands

### Level 1: STATIC_ANALYSIS

```bash
npx tsc --noEmit && npm run lint
```

**EXPECT**: Exit 0, no type errors

### Level 2: UNIT_TESTS

```bash
npm test
```

**EXPECT**: All tests pass

### Level 3: E2E_TESTS

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

**EXPECT**: All E2E tests pass

### Level 4: MANUAL_HTTP_MODE

```bash
npm run build
npm start
# Visit http://localhost:3000
# Test config generator
# Test /health endpoint
```

**EXPECT**: Landing page loads, health returns 200

### Level 5: MANUAL_STDIO_MODE

```bash
MCP_TRANSPORT=stdio npm start
# Or test with MCP inspector:
MCP_TRANSPORT=stdio npx @modelcontextprotocol/inspector node dist/index.js
```

**EXPECT**: Stdio mode works as before

### Level 6: PLAYWRIGHT_MCP_VALIDATION

Use Playwright MCP tools:
```
mcp__playwright__browser_navigate → http://localhost:3000
mcp__playwright__browser_snapshot → verify page structure
mcp__playwright__browser_fill_form → test config generator
mcp__playwright__browser_resize → test mobile viewport
```

---

## Acceptance Criteria

- [ ] HTTP server starts and serves landing page at `/`
- [ ] MCP endpoint at `/mcp` accepts Streamable HTTP connections
- [ ] Per-request authentication via `Authorization: Bearer <key>` header
- [ ] Invalid/missing auth returns 401
- [ ] Stdio mode still works with `MCP_TRANSPORT=stdio`
- [ ] Landing page is mobile responsive
- [ ] Config generator produces valid JSON config
- [ ] All unit tests pass with >80% coverage
- [ ] All E2E tests pass
- [ ] Railway deployment config valid

---

## Completion Checklist

- [ ] Task 1: Dependencies added to package.json
- [ ] Task 2: Per-request auth function in supabase.ts
- [ ] Task 3: Auth unit tests pass
- [ ] Task 4: Express server with MCP transport created
- [ ] Task 5: Server unit tests pass
- [ ] Task 6: Dual transport entry point working
- [ ] Task 7: Landing page created
- [ ] Task 8: Static assets created
- [ ] Task 9: Vitest configured
- [ ] Task 10: Playwright configured
- [ ] Task 11: E2E tests pass
- [ ] Task 12: Railway config created
- [ ] Task 13: README updated
- [ ] Task 14: CLAUDE.md updated
- [ ] Task 15: Final integration verified

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| MCP SDK version incompatibility | LOW | HIGH | Pin to ^1.0.0, test with inspector |
| Railway cold starts affecting SSE | MED | MED | Use health checks, consider always-on plan |
| API key in header intercepted | LOW | HIGH | HTTPS only (Railway provides), educate users |
| Landing page performance on mobile | LOW | LOW | Inline CSS, no heavy assets |
| Concurrent session management | MED | MED | Use SDK's built-in session handling |

---

## Notes

**Design Decisions:**

1. **Streamable HTTP over SSE**: Using the newer MCP 2025 spec transport for better compatibility and simpler implementation

2. **Per-request auth vs session auth**: Validating API key per-connection establishment, then using session ID for subsequent requests in same session

3. **createMcpExpressApp helper**: Using SDK's built-in Express setup for DNS rebinding protection

4. **Single HTML file**: Keeping landing page simple without build step for easier maintenance

5. **Dual transport support**: Preserving stdio for local development and MCP inspector testing

**Future Considerations:**

- Add rate limiting via Railway proxy or in-app when traffic grows
- Add custom domain when ready for production launch
- Add OAuth option for enterprise customers
- Add telemetry/analytics after privacy policy established
- Consider WebSocket transport for lower latency if needed

**Sources:**

- [MCP Transports Specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
- [Why MCP Deprecated SSE](https://blog.fka.dev/blog/2025-06-06-why-mcp-deprecated-sse-and-go-with-streamable-http/)
- [MCP Framework SSE Transport](https://mcp-framework.com/docs/Transports/sse/)
