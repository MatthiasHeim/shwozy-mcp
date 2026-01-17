# Shwozy MCP Server

An MCP (Model Context Protocol) server for managing Shwozy voice note actions from Claude Code and other AI tools.

## Features

- **list_pending_actions** - Query unexecuted voice note action outputs
- **get_action_output** - Get full details of a specific output
- **mark_executed** - Mark an action as completed
- **search_recordings** - Search recordings by title

## Quick Start (Hosted Version - Recommended)

The easiest way to use Shwozy MCP is with the hosted version. No local setup required!

### 1. Generate an API Key

1. Open the Shwozy app on your device
2. Go to **Settings** > **API Keys**
3. Tap **Generate API Key**
4. Copy the key (shown only once!)

### 2. Configure Claude Code

Add to your Claude Code MCP configuration (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "shwozy": {
      "url": "https://shwozy-mcp-production.up.railway.app/mcp",
      "headers": {
        "Authorization": "Bearer sk_your_api_key_here"
      }
    }
  }
}
```

That's it! Restart Claude Code and you're ready to go.

### Interactive Setup

Visit [shwozy-mcp.up.railway.app](https://shwozy-mcp-production.up.railway.app) for an interactive setup wizard that generates your config automatically.

---

## Local Installation (Alternative)

If you prefer to run the MCP server locally:

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/shwozy-mcp.git
cd shwozy-mcp
npm install
npm run build
```

### 2. Configure Claude Code (Local Mode)

```json
{
  "mcpServers": {
    "shwozy": {
      "command": "node",
      "args": ["/path/to/shwozy-mcp/dist/index.js"],
      "env": {
        "MCP_TRANSPORT": "stdio",
        "EXPO_PUBLIC_SUPABASE_URL": "https://your-project.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "your-anon-key",
        "SHWOZY_API_KEY": "sk_your_api_key_here"
      }
    }
  }
}
```

> **Note**: The `EXPO_PUBLIC_SUPABASE_ANON_KEY` is safe to use - it's the publishable key that works with Row Level Security.

---

## Usage Examples

Once configured, ask Claude:

- "List my pending voice note actions"
- "Show me the meeting notes from yesterday"
- "Mark the task list from this morning as done"
- "Search for recordings about project planning"

## Security

This server uses per-user API keys that:
- Are scoped to your account only
- Work with Supabase Row Level Security (RLS)
- Can only access YOUR recordings and outputs
- Can be revoked anytime from the Shwozy app

## Development

```bash
# Run HTTP server (default, for multi-user hosting)
npm run dev

# Run stdio server (for local CLI use)
npm run dev:stdio

# Test with MCP Inspector
npm run inspect

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

## Architecture

The server supports two transport modes:

- **HTTP Mode** (default): Multi-user support via Streamable HTTP transport. API key passed via `Authorization` header per-request.
- **Stdio Mode**: Single-user mode for local CLI use. API key from `SHWOZY_API_KEY` environment variable.

## License

MIT
