# MCP-Discord
[![smithery badge](https://smithery.ai/badge/@barryyip0625/mcp-discord)](https://smithery.ai/server/@barryyip0625/mcp-discord) ![](https://badge.mcpx.dev?type=server 'MCP Server') [![Docker Hub](https://img.shields.io/docker/v/barryy625/mcp-discord?logo=docker&label=Docker%20Hub)](https://hub.docker.com/r/barryy625/mcp-discord)

A Discord MCP (Model Context Protocol) server that enables AI assistants to interact with the Discord platform.

<a href="https://glama.ai/mcp/servers/@barryyip0625/mcp-discord">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@barryyip0625/mcp-discord/badge" alt="MCP-Discord MCP server" />
</a>

## Overview

MCP-Discord provides the following Discord-related functionalities:

- Login to Discord bot
- List servers the bot is a member of
- Get server information
- List members and inspect member details
- List, create, edit, delete, assign, and remove roles
- Search messages in a server
- Read, edit, and delete channel messages
- Send messages to specified channels
- Retrieve forum channel lists
- Create, update, delete, and reply to forum posts
- List forum threads and manage forum tags
- Create, edit, and delete text, forum, voice channels, and categories
- Set and remove channel permission overrides
- Add/remove message reactions
- Create/edit/delete/use webhooks

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Tools Documentation](#tools-documentation)
  - [Basic Functions](#basic-functions)
  - [Channel Management](#channel-management)
  - [Forum Functions](#forum-functions)
  - [Messages and Reactions](#messages-and-reactions)
  - [Webhook Management](#webhook-management)
  - [Role Management](#role-management)
  - [Member Management](#member-management)
- [Development](#development)
- [License](#license)

## Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v7.0.0 or higher)
- A Discord bot with appropriate permissions
  - Bot token (obtainable from the [Discord Developer Portal](https://discord.com/developers/applications))
  - Message Content Intent enabled
  - Server Members Intent enabled
  - Presence Intent enabled
- Permissions required in your Discord server:

  #### Easiest Setup
  - Administrator (Recommended for quick setup and full functionality)

  #### Or, select only the required permissions:
  - Send Messages
  - Create Public Threads
  - Send Messages in Threads
  - Manage Messages
  - Manage Threads
  - Manage Channels
  - Manage Webhooks
  - Manage Roles
  - Add Reactions
  - View Channel

- Add your Discord bot to your server
  - To add your Discord bot to your server, use one of the following invite links (replace `INSERT_CLIENT_ID_HERE` with your bot's client ID):
    - **Administrator (full access):**
        https://discord.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=8
    - **Custom permissions (minimum required):**
        https://discord.com/oauth2/authorize?client_id=INSERT_CLIENT_ID_HERE&scope=bot&permissions=52076489808

> **Note:**  
> According to Discord's security model, a bot can only access information from servers it has been explicitly added to.  
> If you want to use this MCP server to access a specific Discord server, you must add the bot to that server first.  
> Use the invite link below to add the bot to your target server.

## Installation

### Installing via NPM

You can use it with the following command:
```bash
npx mcp-discord --config ${DISCORD_TOKEN}
```

For more details, you can check out the [NPM Package](https://www.npmjs.com/package/mcp-discord).

### Installing via Smithery

To install mcp-discord automatically via [Smithery](https://smithery.ai/server/@barryyip0625/mcp-discord)

### Installing via Docker

You can run mcp-discord using Docker. The Docker images are automatically built and published to Docker Hub.

**Docker Hub Repository**: [barryy625/mcp-discord](https://hub.docker.com/r/barryy625/mcp-discord)

Docker uses the streamable HTTP server by default via `build/app.js`.

```bash
# Pull the latest image
docker pull barryy625/mcp-discord:latest

# Run HTTP server on port 8080
docker run -e DISCORD_TOKEN=your_discord_bot_token -p 8080:8080 barryy625/mcp-discord:latest

# Override the listening port if needed
docker run -e DISCORD_TOKEN=your_discord_bot_token -p 3000:3000 barryy625/mcp-discord:latest --transport http --port 3000
```

**Available Tags:**
- `latest` - Latest stable version from main branch
- `v1.3.8`, etc. - Specific version releases

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/barryyip0625/mcp-discord.git
cd mcp-discord

# Install dependencies
npm install

# Compile TypeScript
npm run build
```

## Configuration

A Discord bot token is required for proper operation. The server supports two transport methods: stdio and streamable HTTP.

### Transport Methods

1. **stdio** (Default)
   - Traditional stdio transport for basic usage
   - Suitable for simple integrations

2. **streamable HTTP**
   - HTTP-based transport for more advanced scenarios
   - Supports stateless operation
   - Configurable port number

### Configuration Options

You can provide configuration in two ways:

1. Environment variables:
```bash
DISCORD_TOKEN=your_discord_bot_token
```

2. Using command line arguments:
```bash
# For stdio transport (default)
node build/index.js --config "your_discord_bot_token"

# For streamable HTTP transport
node build/app.js --transport http --port 3000 --config "your_discord_bot_token"
```

## Usage with Claude/Cursor

### 1. Use Stdio Transport with Claude/Cursor

Use `build/index.js` when your MCP client expects a command-based stdio server.

#### Claude Desktop / Claude Code

```json
{
    "mcpServers": {
        "discord": {
            "command": "node",
            "args": [
                "path/to/mcp-discord/build/index.js"
            ],
            "env": {
                "DISCORD_TOKEN": "your_discord_bot_token"
            }
        }
    }
}
```

#### Cursor

```json
{
    "mcpServers": {
        "discord": {
            "command": "node",
            "args": [
                "path/to/mcp-discord/build/index.js"
            ],
            "env": {
                "DISCORD_TOKEN": "your_discord_bot_token"
            }
        }
    }
}
```

This is the recommended setup for local command-based MCP clients.

### 2. Self-Host the Streamable HTTP Server

Use `build/app.js` when you want to run mcp-discord as an HTTP MCP server.

#### Run with Node.js

```bash
DISCORD_TOKEN=your_discord_bot_token node build/app.js --transport http --port 3000
```

On Windows PowerShell:

```powershell
$env:DISCORD_TOKEN="your_discord_bot_token"
node build/app.js --transport http --port 3000
```

#### Run with Docker

```bash
docker run -e DISCORD_TOKEN=your_discord_bot_token -p 3000:3000 barryy625/mcp-discord:latest --transport http --port 3000
```

Once started, the MCP HTTP endpoint is:

```text
http://localhost:3000/mcp
```

### 3. Connect to a Hosted HTTP MCP Server

If you already host mcp-discord elsewhere, point your MCP client at the server's `/mcp` endpoint instead of launching `build/app.js` as a command.

Example endpoint:

```text
https://your-server.example.com/mcp
```

Important notes:

- `build/app.js` starts an HTTP server. It does not speak stdio.
- `build/index.js` is the correct entrypoint for command-based stdio MCP clients.
- For hosted HTTP usage, configure your MCP client to connect to the HTTP endpoint URL provided by your deployment.
- The exact HTTP-client configuration format depends on the MCP client you use.

## Tools Documentation

### Basic Functions

- `discord_login`: Login to Discord using the configured token
- `discord_list_servers`: List all Discord servers the bot is a member of
- `discord_send`: Send a message to a specified channel
- `discord_get_server_info`: Get Discord server information

### Channel Management

- `discord_create_text_channel`: Create a text channel
- `discord_create_forum_channel`: Create a forum channel
- `discord_create_voice_channel`: Create a voice channel
- `discord_edit_channel`: Edit a channel name, topic, parent category, or position
- `discord_delete_channel`: Delete a channel
- `discord_create_category`: Create a channel category
- `discord_edit_category`: Edit a channel category
- `discord_delete_category`: Delete a channel category
- `discord_set_channel_permissions`: Set permission overrides for a role or user on a channel/category
- `discord_remove_channel_permissions`: Remove permission overrides from a channel/category

### Forum Functions

- `discord_get_forum_channels`: Get a list of forum channels
- `discord_create_forum_post`: Create a forum post
- `discord_get_forum_post`: Get a forum post
- `discord_list_forum_threads`: List active and archived threads in a forum channel
- `discord_reply_to_forum`: Reply to a forum post
- `discord_get_forum_tags`: Get all available tags for a forum channel
- `discord_set_forum_tags`: Replace the available tags for a forum channel
- `discord_update_forum_post`: Update a forum post's title, tags, archived state, or locked state
- `discord_delete_forum_post`: Delete a forum post

### Messages and Reactions

- `discord_search_messages`: Search messages in a server
- `discord_read_messages`: Read channel messages (supports `before`, `after`, `around` params — accepts snowflake IDs or ISO 8601 dates like `"2025-03-01T00:00:00Z"`)
- `discord_edit_message`: Edit a bot-authored message
- `discord_add_reaction`: Add a reaction to a message
- `discord_add_multiple_reactions`: Add multiple reactions to a message
- `discord_remove_reaction`: Remove a reaction from a message
- `discord_delete_message`: Delete a specific message from a channel

### Webhook Management

- `discord_create_webhook`: Creates a new webhook for a Discord channel
- `discord_send_webhook_message`: Sends a message to a Discord channel using a webhook
- `discord_edit_webhook`: Edits an existing webhook for a Discord channel
- `discord_delete_webhook`: Deletes an existing webhook for a Discord channel

### Role Management

- `discord_list_roles`: List all roles in a server
- `discord_create_role`: Create a role with color, hoist, mentionable, and permission options
- `discord_edit_role`: Edit an existing role
- `discord_delete_role`: Delete a role
- `discord_assign_role`: Assign a role to a member
- `discord_remove_role`: Remove a role from a member

### Member Management

- `discord_list_members`: List members in a server with roles
- `discord_get_member`: Get detailed information about a specific member

## Development

```bash
# Development mode
npm run dev
```

## License

[MIT License](https://github.com/barryyip0625/mcp-discord?tab=MIT-1-ov-file)
