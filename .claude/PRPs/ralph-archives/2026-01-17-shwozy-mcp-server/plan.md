# Feature: Shwozy MCP Server

## Summary

Create a standalone MCP (Model Context Protocol) server that connects to Shwozy's Supabase database, enabling AI tools like Claude Code to query pending action outputs, search recordings, and mark items as executed. The server uses the official `@modelcontextprotocol/sdk` with stdio transport for local integration with Claude Code.

## User Story

As a Shwozy power user using Claude Code
I want to query my pending voice note actions and mark them as completed from my development environment
So that I can process my voice note tasks without switching to the mobile app

## Problem Statement

After implementing follow-up actions and execution tracking in the Shwozy app, there's no way for external tools to:
1. Query which action outputs are still pending (not executed)
2. Read the content of specific outputs
3. Mark outputs as executed after processing them externally
4. Search recordings by title or date

This limits the usefulness of execution tracking to only the mobile app interface.

## Solution Statement

Create a standalone npm package `shwozy-mcp` that:
1. Implements the MCP protocol using the official TypeScript SDK with stdio transport
2. Connects to Supabase using environment variables from the voice-notes repository
3. Exposes four tools for querying and updating action outputs
4. Can be configured in Claude Code's MCP settings

## Metadata

| Field            | Value                                              |
| ---------------- | -------------------------------------------------- |
| Type             | NEW_CAPABILITY                                     |
| Complexity       | MEDIUM                                             |
| Systems Affected | New repository (shwozy-mcp - standalone)           |
| Dependencies     | @modelcontextprotocol/sdk ^1.0.0, @supabase/supabase-js ^2.90.0, zod ^3.25.0 |
| Estimated Tasks  | 10                                                 |

---

## UX Design

### Before State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                              BEFORE STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────────┐                       ┌─────────────────┐              ║
║   │   Claude Code   │ ────── ? ──────────► │  Shwozy App     │              ║
║   │   (Terminal)    │   No Connection       │  (Mobile Only)  │              ║
║   └─────────────────┘                       └─────────────────┘              ║
║                                                    │                          ║
║   USER_FLOW:                                       ▼                          ║
║   1. User records voice note on phone     ┌─────────────────┐              ║
║   2. Action creates output                 │  Supabase DB    │              ║
║   3. User MUST switch to phone to see      │  action_outputs │              ║
║      pending items                         └─────────────────┘              ║
║   4. User manually marks as executed                                         ║
║                                                                               ║
║   PAIN_POINT: Context switching between phone and dev environment            ║
║   DATA_FLOW: Recording → Action → Output → (stuck in mobile app)             ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### After State

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                               AFTER STATE                                      ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║   ┌─────────────────┐         ┌─────────────────┐         ┌────────────────┐ ║
║   │   Claude Code   │ ──MCP── │   shwozy-mcp    │ ─────── │   Supabase DB  │ ║
║   │   (Terminal)    │  stdio  │   (Node.js)     │ Service │  action_outputs│ ║
║   └─────────────────┘         └─────────────────┘   Key   └────────────────┘ ║
║          │                           │                           │           ║
║          │                           │                           │           ║
║          ▼                           ▼                           ▼           ║
║   ┌─────────────────────────────────────────────────────────────────────────┐║
║   │  AVAILABLE TOOLS:                                                       │║
║   │  • list_pending_actions  → Query unexecuted outputs                     │║
║   │  • get_action_output     → Get full output details                      │║
║   │  • mark_executed         → Mark output as done                          │║
║   │  • search_recordings     → Find recordings by title                     │║
║   └─────────────────────────────────────────────────────────────────────────┘║
║                                                                               ║
║   USER_FLOW:                                                                  ║
║   1. User asks Claude: "List my pending voice note actions"                  ║
║   2. Claude calls list_pending_actions MCP tool                              ║
║   3. User sees pending items in terminal                                     ║
║   4. User: "Mark the meeting notes from yesterday as done"                   ║
║   5. Claude calls mark_executed → Database updated                           ║
║                                                                               ║
║   VALUE_ADD: Seamless integration without app switching                       ║
║   DATA_FLOW: Claude Code → MCP Server → Supabase → Back to Claude            ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Interaction Changes

| Location        | Before                        | After                              | User Impact                    |
| --------------- | ----------------------------- | ---------------------------------- | ------------------------------ |
| Claude Code     | No Shwozy integration         | 4 MCP tools available              | Can query/manage actions       |
| Pending Actions | View in mobile app only       | Query via natural language         | No context switching           |
| Mark Executed   | Tap button in app             | Say "mark as done" to Claude       | Faster workflow                |
| Search          | Scroll through recordings     | Search by title in terminal        | Find items quickly             |

---

## Mandatory Reading

**CRITICAL: Implementation agent MUST read these files before starting any task:**

| Priority | File | Lines | Why Read This |
|----------|------|-------|---------------|
| P0 | `/Users/Matthias/Desktop/Repos/voice-notes/.env.local` | 1-16 | Environment variables for Supabase connection |
| P0 | `/Users/Matthias/Desktop/Repos/voice-notes/supabase/migrations/002_actions.sql` | 1-106 | Database schema for actions and action_outputs |
| P0 | `/Users/Matthias/Desktop/Repos/voice-notes/supabase/migrations/006_follow_up_actions.sql` | 1-25 | executed and executed_at columns |
| P1 | `/Users/Matthias/Desktop/Repos/voice-notes/supabase/migrations/001_initial_schema.sql` | 32-54 | recordings table schema |

**External Documentation:**

| Source | Section | Why Needed |
|--------|---------|------------|
| [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) | Server Setup | Core MCP implementation patterns |
| [MCP Server Docs](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/server.md) | Tools | Tool registration with Zod schemas |
| [Supabase JS Client v2.90+](https://supabase.com/docs/reference/javascript/introduction) | Querying | Database operations |

---

## Patterns to Mirror

**SERVER_INITIALIZATION:**
```typescript
// SOURCE: @modelcontextprotocol/sdk documentation
// COPY THIS PATTERN:
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "shwozy-mcp",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});
```

**TOOL_REGISTRATION:**
```typescript
// SOURCE: @modelcontextprotocol/sdk documentation
// COPY THIS PATTERN:
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_pending_actions",
        description: "Get all action outputs that haven't been executed yet",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum results to return (default 20)"
            },
            action_name: {
              type: "string",
              description: "Filter by action name"
            }
          },
          required: []
        }
      }
    ]
  };
});
```

**TOOL_EXECUTION_WITH_ERROR_HANDLING:**
```typescript
// SOURCE: @modelcontextprotocol/sdk documentation
// COPY THIS PATTERN:
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_pending_actions":
        const result = await listPendingActions(args);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      default:
        return {
          isError: true,
          content: [{ type: "text", text: `Unknown tool: ${name}` }]
        };
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` }]
    };
  }
});
```

**SUPABASE_CLIENT_INITIALIZATION:**
```typescript
// SOURCE: @supabase/supabase-js documentation
// COPY THIS PATTERN:
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
```

**ZOD_VALIDATION_PATTERN:**
```typescript
// SOURCE: zod documentation
// COPY THIS PATTERN:
import { z } from "zod";

const ListPendingArgsSchema = z.object({
  limit: z.number().optional().default(20),
  action_name: z.string().optional()
});

type ListPendingArgs = z.infer<typeof ListPendingArgsSchema>;
```

---

## Database Schema Reference

**recordings table:**
```sql
-- id: UUID PRIMARY KEY
-- user_id: UUID (references profiles)
-- title: TEXT
-- duration_seconds: INTEGER
-- file_path: TEXT
-- status: TEXT (pending|processing|completed|failed)
-- created_at: TIMESTAMP WITH TIME ZONE
```

**actions table:**
```sql
-- id: UUID PRIMARY KEY
-- user_id: UUID (nullable - NULL means system default)
-- name: TEXT NOT NULL
-- description: TEXT
-- system_prompt: TEXT NOT NULL
-- output_schema: JSONB NOT NULL
-- is_default: BOOLEAN
-- is_active: BOOLEAN
-- follow_up_action_type: TEXT (none|email|webhook)
-- follow_up_button_text: TEXT
```

**action_outputs table:**
```sql
-- id: UUID PRIMARY KEY
-- user_id: UUID NOT NULL
-- recording_id: UUID NOT NULL (references recordings)
-- action_id: UUID NOT NULL (references actions)
-- output_data: JSONB NOT NULL
-- transcript: TEXT
-- processing_time_ms: INTEGER
-- status: TEXT (processing|completed|failed)
-- error_message: TEXT
-- executed: BOOLEAN DEFAULT false  -- From migration 006
-- executed_at: TIMESTAMP WITH TIME ZONE  -- From migration 006
-- created_at: TIMESTAMP WITH TIME ZONE
```

---

## Files to Create

| File                             | Action | Justification                            |
| -------------------------------- | ------ | ---------------------------------------- |
| `package.json`                   | CREATE | Package config with bin entry for npx    |
| `tsconfig.json`                  | CREATE | TypeScript configuration for ESM         |
| `.env.example`                   | CREATE | Example environment variables            |
| `src/index.ts`                   | CREATE | Entry point with server setup            |
| `src/db/supabase.ts`             | CREATE | Supabase client initialization           |
| `src/tools/index.ts`             | CREATE | Tool registry and handlers               |
| `src/tools/listPending.ts`       | CREATE | list_pending_actions implementation      |
| `src/tools/getOutput.ts`         | CREATE | get_action_output implementation         |
| `src/tools/markExecuted.ts`      | CREATE | mark_executed implementation             |
| `src/tools/searchRecordings.ts`  | CREATE | search_recordings implementation         |
| `src/types.ts`                   | CREATE | Shared types and Zod schemas             |
| `README.md`                      | CREATE | Documentation and setup instructions     |

---

## NOT Building (Scope Limits)

Explicit exclusions to prevent scope creep:

- **User authentication flow** - Service key bypasses RLS; user-scoped access is future enhancement
- **Rate limiting** - Not needed for local-only MCP server
- **Webhook triggering** - Out of scope; users trigger webhooks manually
- **Resources/Prompts** - Only implementing Tools for this MVP
- **Unit tests** - Can be added later; manual validation via MCP inspector sufficient for MVP
- **Publishing to npm** - Local installation via npx sufficient initially

---

## Step-by-Step Tasks

Execute in order. Each task is atomic and independently verifiable.

### Task 1: CREATE `package.json`

- **ACTION**: CREATE package configuration with bin entry point
- **IMPLEMENT**:
```json
{
  "name": "shwozy-mcp",
  "version": "1.0.0",
  "description": "MCP server for Shwozy voice notes - query and manage action outputs",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "shwozy-mcp": "dist/index.js"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc && chmod +x dist/index.js",
    "dev": "tsx src/index.ts",
    "inspect": "npx @modelcontextprotocol/inspector node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@supabase/supabase-js": "^2.90.0",
    "zod": "^3.25.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "tsx": "^4.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```
- **GOTCHA**: Must use `"type": "module"` for ESM imports; bin entry needs chmod +x
- **VALIDATE**: `npm install` succeeds without errors

### Task 2: CREATE `tsconfig.json`

- **ACTION**: CREATE TypeScript configuration for ESM output
- **IMPLEMENT**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```
- **GOTCHA**: Must use `Node16` module resolution for .js extension imports
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 3: CREATE `.env.example`

- **ACTION**: CREATE example environment file documenting required variables
- **IMPLEMENT**:
```bash
# Supabase Configuration
# Copy from voice-notes/.env.local or Supabase dashboard
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# IMPORTANT: Use service key (NOT anon key) for full database access
# Get from: Supabase Dashboard → Settings → API → service_role key
SUPABASE_SERVICE_KEY=your-service-role-key-here
```
- **GOTCHA**: Service key required (not anon key) to bypass RLS
- **VALIDATE**: File exists and documents both required variables

### Task 4: CREATE `src/types.ts`

- **ACTION**: CREATE shared types and Zod schemas for all tools
- **IMPLEMENT**:
```typescript
import { z } from "zod";

// ==========================================
// Input Schemas (for tool arguments)
// ==========================================

export const ListPendingArgsSchema = z.object({
  limit: z.number().optional().default(20),
  action_name: z.string().optional()
});

export const GetOutputArgsSchema = z.object({
  output_id: z.string().uuid()
});

export const MarkExecutedArgsSchema = z.object({
  output_id: z.string().uuid()
});

export const SearchRecordingsArgsSchema = z.object({
  query: z.string().min(1),
  limit: z.number().optional().default(10),
  include_outputs: z.boolean().optional().default(false)
});

// ==========================================
// Output Types (for tool responses)
// ==========================================

export interface PendingOutput {
  id: string;
  recording_title: string;
  recording_date: string;
  action_name: string;
  output_summary: string;
  created_at: string;
}

export interface ListPendingResult {
  outputs: PendingOutput[];
  total_count: number;
}

export interface OutputDetail {
  id: string;
  recording: {
    id: string;
    title: string;
    duration_seconds: number;
    created_at: string;
  };
  action: {
    id: string;
    name: string;
    description: string | null;
  };
  output_data: Record<string, unknown>;
  transcript: string | null;
  executed: boolean;
  executed_at: string | null;
  created_at: string;
}

export interface MarkExecutedResult {
  success: boolean;
  executed_at: string;
}

export interface RecordingSearchResult {
  id: string;
  title: string;
  duration_seconds: number;
  created_at: string;
  outputs?: {
    id: string;
    action_name: string;
    executed: boolean;
  }[];
}

export interface SearchRecordingsResult {
  recordings: RecordingSearchResult[];
}
```
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 5: CREATE `src/db/supabase.ts`

- **ACTION**: CREATE Supabase client initialization module
- **IMPLEMENT**:
```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL environment variable");
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error("Missing SUPABASE_SERVICE_KEY environment variable");
  process.exit(1);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);
```
- **GOTCHA**: Use console.error and process.exit for startup errors (stdio transport uses stdout)
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 6: CREATE `src/tools/listPending.ts`

- **ACTION**: CREATE list_pending_actions tool implementation
- **IMPLEMENT**:
```typescript
import { supabase } from "../db/supabase.js";
import { ListPendingArgsSchema, ListPendingResult, PendingOutput } from "../types.js";

export async function listPendingActions(args: unknown): Promise<ListPendingResult> {
  const { limit, action_name } = ListPendingArgsSchema.parse(args);

  // Query action_outputs with joins to recordings and actions
  let query = supabase
    .from("action_outputs")
    .select(`
      id,
      output_data,
      created_at,
      recordings!inner(id, title, created_at),
      actions!inner(id, name)
    `)
    .eq("executed", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  // Optional filter by action name
  if (action_name) {
    query = query.eq("actions.name", action_name);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  const outputs: PendingOutput[] = (data || []).map((row: any) => ({
    id: row.id,
    recording_title: row.recordings?.title || "Untitled",
    recording_date: row.recordings?.created_at || row.created_at,
    action_name: row.actions?.name || "Unknown",
    output_summary: summarizeOutput(row.output_data),
    created_at: row.created_at
  }));

  return {
    outputs,
    total_count: outputs.length
  };
}

function summarizeOutput(data: unknown): string {
  const str = JSON.stringify(data);
  if (str.length <= 200) return str;
  return str.substring(0, 197) + "...";
}
```
- **GOTCHA**: Use `!inner` for required joins; handle null recordings/actions defensively
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 7: CREATE `src/tools/getOutput.ts`

- **ACTION**: CREATE get_action_output tool implementation
- **IMPLEMENT**:
```typescript
import { supabase } from "../db/supabase.js";
import { GetOutputArgsSchema, OutputDetail } from "../types.js";

export async function getActionOutput(args: unknown): Promise<OutputDetail> {
  const { output_id } = GetOutputArgsSchema.parse(args);

  const { data, error } = await supabase
    .from("action_outputs")
    .select(`
      id,
      output_data,
      transcript,
      executed,
      executed_at,
      created_at,
      recordings!inner(id, title, duration_seconds, created_at),
      actions!inner(id, name, description)
    `)
    .eq("id", output_id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error(`Action output not found: ${output_id}`);
    }
    throw new Error(`Database query failed: ${error.message}`);
  }

  return {
    id: data.id,
    recording: {
      id: data.recordings.id,
      title: data.recordings.title || "Untitled",
      duration_seconds: data.recordings.duration_seconds,
      created_at: data.recordings.created_at
    },
    action: {
      id: data.actions.id,
      name: data.actions.name,
      description: data.actions.description
    },
    output_data: data.output_data as Record<string, unknown>,
    transcript: data.transcript,
    executed: data.executed,
    executed_at: data.executed_at,
    created_at: data.created_at
  };
}
```
- **GOTCHA**: Error code PGRST116 means "no rows returned" for .single()
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 8: CREATE `src/tools/markExecuted.ts`

- **ACTION**: CREATE mark_executed tool implementation
- **IMPLEMENT**:
```typescript
import { supabase } from "../db/supabase.js";
import { MarkExecutedArgsSchema, MarkExecutedResult } from "../types.js";

export async function markExecuted(args: unknown): Promise<MarkExecutedResult> {
  const { output_id } = MarkExecutedArgsSchema.parse(args);

  const executedAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("action_outputs")
    .update({
      executed: true,
      executed_at: executedAt
    })
    .eq("id", output_id)
    .select("id")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error(`Action output not found: ${output_id}`);
    }
    throw new Error(`Database update failed: ${error.message}`);
  }

  return {
    success: true,
    executed_at: executedAt
  };
}
```
- **GOTCHA**: Use .select() after .update() to verify the row exists
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 9: CREATE `src/tools/searchRecordings.ts`

- **ACTION**: CREATE search_recordings tool implementation
- **IMPLEMENT**:
```typescript
import { supabase } from "../db/supabase.js";
import { SearchRecordingsArgsSchema, SearchRecordingsResult, RecordingSearchResult } from "../types.js";

export async function searchRecordings(args: unknown): Promise<SearchRecordingsResult> {
  const { query, limit, include_outputs } = SearchRecordingsArgsSchema.parse(args);

  // Build base query with ILIKE for case-insensitive search
  let dbQuery = supabase
    .from("recordings")
    .select(include_outputs
      ? `id, title, duration_seconds, created_at, action_outputs(id, executed, actions(name))`
      : `id, title, duration_seconds, created_at`
    )
    .ilike("title", `%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  const { data, error } = await dbQuery;

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  const recordings: RecordingSearchResult[] = (data || []).map((row: any) => {
    const result: RecordingSearchResult = {
      id: row.id,
      title: row.title || "Untitled",
      duration_seconds: row.duration_seconds,
      created_at: row.created_at
    };

    if (include_outputs && row.action_outputs) {
      result.outputs = row.action_outputs.map((output: any) => ({
        id: output.id,
        action_name: output.actions?.name || "Unknown",
        executed: output.executed
      }));
    }

    return result;
  });

  return { recordings };
}
```
- **GOTCHA**: Use ILIKE for case-insensitive search; escape special chars in query if needed
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 10: CREATE `src/tools/index.ts`

- **ACTION**: CREATE tool registry exporting handlers
- **IMPLEMENT**:
```typescript
import { listPendingActions } from "./listPending.js";
import { getActionOutput } from "./getOutput.js";
import { markExecuted } from "./markExecuted.js";
import { searchRecordings } from "./searchRecordings.js";

// Tool definitions for ListToolsRequestSchema
export const TOOL_DEFINITIONS = [
  {
    name: "list_pending_actions",
    description: "Get all action outputs that haven't been executed yet. Returns a list of pending voice note actions.",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number",
          description: "Maximum results to return (default 20)"
        },
        action_name: {
          type: "string",
          description: "Filter by action name (e.g., 'Meeting Notes', 'Task List')"
        }
      },
      required: []
    }
  },
  {
    name: "get_action_output",
    description: "Get the full details of a specific action output including the complete output data and transcript.",
    inputSchema: {
      type: "object" as const,
      properties: {
        output_id: {
          type: "string",
          description: "The UUID of the action output to retrieve"
        }
      },
      required: ["output_id"]
    }
  },
  {
    name: "mark_executed",
    description: "Mark an action output as executed. Use this after you've processed or acted on a voice note action.",
    inputSchema: {
      type: "object" as const,
      properties: {
        output_id: {
          type: "string",
          description: "The UUID of the action output to mark as executed"
        }
      },
      required: ["output_id"]
    }
  },
  {
    name: "search_recordings",
    description: "Search voice recordings by title. Useful for finding specific recordings before getting their action outputs.",
    inputSchema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Search query to match against recording titles"
        },
        limit: {
          type: "number",
          description: "Maximum results to return (default 10)"
        },
        include_outputs: {
          type: "boolean",
          description: "Include action output summaries in results (default false)"
        }
      },
      required: ["query"]
    }
  }
];

// Tool execution handler
export async function executeTool(name: string, args: unknown): Promise<unknown> {
  switch (name) {
    case "list_pending_actions":
      return listPendingActions(args);
    case "get_action_output":
      return getActionOutput(args);
    case "mark_executed":
      return markExecuted(args);
    case "search_recordings":
      return searchRecordings(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
```
- **VALIDATE**: `npx tsc --noEmit` succeeds

### Task 11: CREATE `src/index.ts`

- **ACTION**: CREATE MCP server entry point with shebang
- **IMPLEMENT**:
```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DEFINITIONS, executeTool } from "./tools/index.js";

// Initialize MCP server
const server = new Server(
  {
    name: "shwozy-mcp",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOL_DEFINITIONS
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, args || {});
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: errorMessage
        }
      ]
    };
  }
});

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Shwozy MCP server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
```
- **GOTCHA**: Use console.error for logging (stdout reserved for MCP protocol)
- **VALIDATE**: `npm run build` succeeds and creates executable in dist/

### Task 12: CREATE `README.md`

- **ACTION**: CREATE comprehensive documentation
- **IMPLEMENT**:
```markdown
# Shwozy MCP Server

An MCP (Model Context Protocol) server for managing Shwozy voice note actions from Claude Code and other AI tools.

## Features

- **list_pending_actions** - Query unexecuted voice note action outputs
- **get_action_output** - Get full details of a specific output
- **mark_executed** - Mark an action as completed
- **search_recordings** - Search recordings by title

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shwozy-mcp.git
cd shwozy-mcp

# Install dependencies
npm install

# Build
npm run build
```

## Configuration

Create a `.env` file with your Supabase credentials:

```bash
# From your voice-notes/.env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Get service key from Supabase Dashboard → Settings → API
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Claude Code Setup

Add to your Claude Code MCP configuration (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "shwozy": {
      "command": "node",
      "args": ["/path/to/shwozy-mcp/dist/index.js"],
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your-service-key"
      }
    }
  }
}
```

## Usage Examples

Once configured, ask Claude:

- "List my pending voice note actions"
- "Show me the meeting notes from yesterday"
- "Mark the task list from this morning as done"
- "Search for recordings about project planning"

## Development

```bash
# Run in development mode
npm run dev

# Test with MCP Inspector
npm run inspect
```

## Security Warning

⚠️ This server uses a Supabase service key which:
- Bypasses all Row Level Security (RLS) policies
- Has full read/write access to the database
- Should NEVER be committed to version control
- Should ONLY be used on trusted local machines

## License

MIT
```
- **VALIDATE**: README is complete with all sections

---

## Validation Commands

### Level 1: STATIC_ANALYSIS

```bash
npm run build
```

**EXPECT**: Compiles without errors, creates `dist/index.js` with shebang

### Level 2: LOCAL_START

```bash
# Copy env from voice-notes
cp /Users/Matthias/Desktop/Repos/voice-notes/.env.local .env
echo "SUPABASE_SERVICE_KEY=your-key-here" >> .env

# Test startup
npm run dev
```

**EXPECT**: Server starts, prints "Shwozy MCP server started on stdio"

### Level 3: MCP_INSPECTOR

```bash
npm run inspect
```

**EXPECT**: Inspector opens, shows 4 tools available, can execute list_pending_actions

### Level 4: CLAUDE_CODE_INTEGRATION

1. Add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "shwozy": {
      "command": "node",
      "args": ["/Users/Matthias/Desktop/Repos/shwozy-mcp/dist/index.js"],
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://hqwccaqwykzhnvcmbkge.supabase.co",
        "SUPABASE_SERVICE_KEY": "your-service-key"
      }
    }
  }
}
```
2. Restart Claude Code
3. Ask: "List my pending voice note actions"

**EXPECT**: Claude lists pending actions from Shwozy database

---

## Acceptance Criteria

- [ ] All 12 tasks completed in dependency order
- [ ] `npm install` succeeds without errors
- [ ] `npm run build` compiles without TypeScript errors
- [ ] Server starts with `npm run dev` and logs to stderr
- [ ] All 4 tools appear in MCP inspector
- [ ] `list_pending_actions` returns data from Supabase
- [ ] `get_action_output` returns full output details
- [ ] `mark_executed` updates executed=true in database
- [ ] `search_recordings` finds recordings by title
- [ ] Works in Claude Code MCP configuration
- [ ] README documents all setup steps

---

## Completion Checklist

- [ ] Task 1: package.json created with correct dependencies
- [ ] Task 2: tsconfig.json created for ESM output
- [ ] Task 3: .env.example documents required variables
- [ ] Task 4: src/types.ts defines all schemas and types
- [ ] Task 5: src/db/supabase.ts initializes client
- [ ] Task 6: src/tools/listPending.ts implements list_pending_actions
- [ ] Task 7: src/tools/getOutput.ts implements get_action_output
- [ ] Task 8: src/tools/markExecuted.ts implements mark_executed
- [ ] Task 9: src/tools/searchRecordings.ts implements search_recordings
- [ ] Task 10: src/tools/index.ts exports tool definitions and executor
- [ ] Task 11: src/index.ts creates MCP server with stdio transport
- [ ] Task 12: README.md documents installation and usage
- [ ] Level 1: Build succeeds
- [ ] Level 2: Server starts locally
- [ ] Level 3: MCP inspector shows tools
- [ ] Level 4: Claude Code integration works

---

## Risks and Mitigations

| Risk               | Likelihood | Impact | Mitigation                              |
| ------------------ | ---------- | ------ | --------------------------------------- |
| Service key exposure | MEDIUM | HIGH | Document security, use env vars only |
| Supabase query errors | LOW | MEDIUM | Defensive null handling, error wrapping |
| MCP SDK API changes | LOW | HIGH | Pin to specific SDK version ^1.0.0 |
| Wrong env var names | MEDIUM | LOW | Document exact names from voice-notes/.env.local |

---

## Environment Variables Reference

From `/Users/Matthias/Desktop/Repos/voice-notes/.env.local`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://hqwccaqwykzhnvcmbkge.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_5BkrRM3YBVNsA1nUVY6dYg_pjylR2DN  # NOT USED - need service key instead
```

**IMPORTANT**: You need to get the `SUPABASE_SERVICE_KEY` from Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the `service_role` key (NOT the anon key)

---

## Notes

- The server uses stdio transport which is ideal for local Claude Code integration
- Service key bypasses RLS - this is intentional for MCP server to access all data
- Future enhancement: Add user-scoped authentication using Supabase auth tokens
- The MCP inspector (`npm run inspect`) is invaluable for testing before Claude integration
