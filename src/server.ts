import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express, { Request, Response } from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  isInitializeRequest,
} from "@modelcontextprotocol/sdk/types.js";
import { TOOL_DEFINITIONS, executeTool } from "./tools/index.js";
import { validateApiKey } from "./db/supabase.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Port configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Map to store transports by session ID
// Each session has a transport and associated userId
interface SessionData {
  transport: StreamableHTTPServerTransport;
  userId: string;
}
const sessions = new Map<string, SessionData>();

/**
 * Extract API key from Authorization header
 * Expects: "Bearer sk_xxx" or just "sk_xxx"
 */
function extractApiKey(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Allow raw API key for convenience
  if (authHeader.startsWith("sk_")) {
    return authHeader;
  }

  return null;
}

/**
 * Create an MCP server instance configured for a specific user
 */
function createMcpServer(userId: string): Server {
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

  // Handle tool execution with the user's ID
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
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

  return server;
}

/**
 * Start the HTTP server with MCP Streamable HTTP transport
 */
export async function startHttpServer(): Promise<void> {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Serve static files for landing page
  const publicPath = path.join(__dirname, "public");
  app.use(express.static(publicPath));

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      sessions: sessions.size,
    });
  });

  // MCP POST endpoint - handles initialize and subsequent requests
  app.post("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    const authHeader = req.headers["authorization"] as string | undefined;

    try {
      let sessionData: SessionData | undefined;

      if (sessionId && sessions.has(sessionId)) {
        // Existing session - reuse transport
        sessionData = sessions.get(sessionId)!;
      } else if (!sessionId && isInitializeRequest(req.body)) {
        // New initialization request - authenticate and create session
        const apiKey = extractApiKey(authHeader);

        // Get request ID for JSON-RPC response
        const requestId = (req.body as { id?: string | number | null })?.id ?? null;

        if (!apiKey) {
          res.status(401).json({
            jsonrpc: "2.0",
            error: {
              code: -32001,
              message: "Authorization required. Include 'Authorization: Bearer sk_xxx' header.",
            },
            id: requestId,
          });
          return;
        }

        // Validate API key and get user ID
        let userId: string;
        try {
          userId = await validateApiKey(apiKey);
        } catch (error) {
          res.status(401).json({
            jsonrpc: "2.0",
            error: {
              code: -32001,
              message: error instanceof Error ? error.message : "Invalid API key",
            },
            id: requestId,
          });
          return;
        }

        // Create transport for this session
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => randomUUID(),
          onsessioninitialized: (newSessionId) => {
            console.error(`Session initialized: ${newSessionId} for user: ${userId}`);
            sessions.set(newSessionId, { transport, userId });
          },
        });

        // Clean up on close
        transport.onclose = () => {
          const sid = transport.sessionId;
          if (sid && sessions.has(sid)) {
            console.error(`Session closed: ${sid}`);
            sessions.delete(sid);
          }
        };

        // Create and connect MCP server for this user
        const server = createMcpServer(userId);
        await server.connect(transport);

        // Handle this initial request
        await transport.handleRequest(req, res, req.body);
        return;
      } else {
        // Invalid request - no session ID and not an initialize request
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: "Bad Request: No valid session ID provided",
          },
          id: req.body?.id ?? null,
        });
        return;
      }

      // Handle request with existing transport
      await sessionData.transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: req.body?.id ?? null,
        });
      }
    }
  });

  // MCP GET endpoint - for SSE streams
  app.get("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    const sessionData = sessions.get(sessionId)!;

    // Check for Last-Event-ID for resumability
    const lastEventId = req.headers["last-event-id"];
    if (lastEventId) {
      console.error(`Client reconnecting with Last-Event-ID: ${lastEventId}`);
    } else {
      console.error(`Establishing SSE stream for session ${sessionId}`);
    }

    await sessionData.transport.handleRequest(req, res);
  });

  // MCP DELETE endpoint - session termination
  app.delete("/mcp", async (req: Request, res: Response) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (!sessionId || !sessions.has(sessionId)) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }

    console.error(`Session termination request for: ${sessionId}`);

    try {
      const sessionData = sessions.get(sessionId)!;
      await sessionData.transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling session termination:", error);
      if (!res.headersSent) {
        res.status(500).send("Error processing session termination");
      }
    }
  });

  // Fallback route - serve landing page for any unmatched routes
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });

  // Start server
  app.listen(PORT, () => {
    console.error(`Shwozy MCP server listening on http://localhost:${PORT}`);
    console.error(`Landing page: http://localhost:${PORT}`);
    console.error(`MCP endpoint: http://localhost:${PORT}/mcp`);
    console.error(`Health check: http://localhost:${PORT}/health`);
  });

  // Handle shutdown
  process.on("SIGINT", async () => {
    console.error("Shutting down server...");
    for (const [sessionId, sessionData] of sessions) {
      try {
        console.error(`Closing session: ${sessionId}`);
        await sessionData.transport.close();
      } catch (error) {
        console.error(`Error closing session ${sessionId}:`, error);
      }
    }
    sessions.clear();
    console.error("Server shutdown complete");
    process.exit(0);
  });
}
