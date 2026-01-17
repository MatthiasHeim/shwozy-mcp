#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DEFINITIONS, executeTool } from "./tools/index.js";
import { validateAndSetUser, getUserId } from "./db/supabase.js";

// Determine transport mode
const transportMode = process.env.MCP_TRANSPORT || "http";

if (transportMode === "stdio") {
  // Stdio mode - original behavior for local CLI use
  runStdioMode();
} else {
  // HTTP mode (default) - for hosted multi-user access
  runHttpMode();
}

/**
 * Run in stdio mode (local CLI)
 * - API key from SHWOZY_API_KEY env var
 * - Single user per process
 * - Used with MCP inspector and local Claude Code
 */
async function runStdioMode(): Promise<void> {
  // Initialize MCP server
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

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: TOOL_DEFINITIONS,
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const userId = getUserId(); // Get validated user ID
      const result = await executeTool(name, args || {}, userId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: errorMessage,
          },
        ],
      };
    }
  });

  try {
    // Validate API key first (stdio mode requires env var)
    await validateAndSetUser();

    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Shwozy MCP server started on stdio");
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

/**
 * Run in HTTP mode (hosted)
 * - API key from Authorization header per-request
 * - Multi-user support
 * - Serves landing page
 */
async function runHttpMode(): Promise<void> {
  // Dynamic import to avoid loading Express when in stdio mode
  const { startHttpServer } = await import("./server.js");
  await startHttpServer();
}
