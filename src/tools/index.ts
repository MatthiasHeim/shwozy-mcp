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
      required: [] as string[]
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
    description: "Search voice recordings by title. Returns recordings with their output count.",
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
        }
      },
      required: ["query"]
    }
  }
];

// Tool execution handler - now with userId for user-scoped queries
export async function executeTool(
  name: string,
  args: unknown,
  userId: string
): Promise<unknown> {
  switch (name) {
    case "list_pending_actions":
      return listPendingActions(args, userId);
    case "get_action_output":
      return getActionOutput(args, userId);
    case "mark_executed":
      return markExecuted(args, userId);
    case "search_recordings":
      return searchRecordings(args, userId);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
