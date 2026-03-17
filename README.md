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
- Search messages in a server
- Read/delete channel messages
- Send messages to specified channels (using either channel IDs or channel names)
- Retrieve forum channel lists
- Create/delete/reply to forum posts
- Create/delete text channels
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
- [Development](#development)
- [License](#license)

## Prerequisites

- Node.js (v16.0.0 or higher)
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

Docker container uses `stdio` by default.

```bash
# Pull the latest image
docker pull barryy625/mcp-discord:latest

# Run with environment variable
docker run -e DISCORD_TOKEN=your_discord_bot_token barryy625/mcp-discord:latest

# Or run with command line config
docker run barryy625/mcp-discord:latest --config "your_discord_bot_token"
```

Alternatively, override the `--transport` and `--port` flags to run `http` on a port of your choosing. In this case, also map the ports.

```bash
# Pull the latest image
docker pull barryy625/mcp-discord:latest

# Run with environment variable
docker run -e DISCORD_TOKEN=your_discord_bot_token -p 8080:8080 barryy625/mcp-discord:latest --transport http --port 8081

# Or run with command line config
docker run -p 8080:8080 barryy625/mcp-discord:latest --config "your_discord_bot_token" --transport http --port 8081
```

**Available Tags:**
- `latest` - Latest stable version from main branch
- `v1.3.3`, etc. - Specific version releases

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
node build/index.js --transport http --port 3000 --config "your_discord_bot_token"
```

## Usage with Claude/Cursor

### Docker

You can use Docker containers with both Claude and Cursor:

```json
{
    "mcpServers": {
        "discord": {
            "command": "docker",
            "args": [
                "run",
                "--rm",
                "-e",
                "DISCORD_TOKEN=your_discord_bot_token",
                "-p",
                "8080:8080",
                "barryy625/mcp-discord:latest",
                "--transport",
                "http",
                "--port",
                "8080"
            ]
        }
    }
}
```

### Claude

1. Using stdio transport:
```json
{
    "mcpServers": {
        "discord": {
            "command": "node",
            "args": [
                "path/to/mcp-discord/build/index.js",
                "--config",
                "your_discord_bot_token"
            ]
        }
    }
}
```

2. Using streamable HTTP transport:
```json
{
    "mcpServers": {
        "discord": {
            "command": "node",
            "args": [
                "path/to/mcp-discord/build/index.js",
                "--transport",
                "http",
                "--port",
                "3000",
                "--config",
                "your_discord_bot_token"
            ]
        }
    }
}
```

### Cursor

1. Using stdio transport:
```json
{
    "mcpServers": {
        "discord": {
            "command": "cmd",
            "args": [
                "/c",
                "node",
                "path/to/mcp-discord/build/index.js",
                "--config",
                "your_discord_bot_token"
            ]
        }
    }
}
```

2. Using streamable HTTP transport:
```json
{
    "mcpServers": {
        "discord": {
            "command": "cmd",
            "args": [
                "/c",
                "node",
                "path/to/mcp-discord/build/index.js",
                "--transport",
                "http",
                "--port",
                "3000",
                "--config",
                "your_discord_bot_token"
            ]
        }
    }
}
```

## Tools Documentation

### Basic Functions

- `discord_login`: Login to Discord using the configured token
- `discord_list_servers`: List all Discord servers the bot is a member of
- `discord_send`: Send a message to a specified channel (supports both channel ID and channel name)
- `discord_get_server_info`: Get Discord server information

### Channel Management

- `discord_create_text_channel`: Create a text channel
- `discord_delete_channel`: Delete a channel
- `discord_create_category`: Create a channel category
- `discord_edit_category`: Edit a channel category
- `discord_delete_category`: Delete a channel category

### Forum Functions

- `discord_get_forum_channels`: Get a list of forum channels
- `discord_create_forum_post`: Create a forum post
- `discord_get_forum_post`: Get a forum post
- `discord_reply_to_forum`: Reply to a forum post
- `discord_delete_forum_post`: Delete a forum post

### Messages and Reactions

- `discord_search_messages`: Search messages in a server
- `discord_read_messages`: Read channel messages
- `discord_add_reaction`: Add a reaction to a message
- `discord_add_multiple_reactions`: Add multiple reactions to a message
- `discord_remove_reaction`: Remove a reaction from a message
- `discord_delete_message`: Delete a specific message from a channel

### Webhook Management

- `discord_create_webhook`: Creates a new webhook for a Discord channel
- `discord_send_webhook_message`: Sends a message to a Discord channel using a webhook
- `discord_edit_webhook`: Edits an existing webhook for a Discord channel
- `discord_delete_webhook`: Deletes an existing webhook for a Discord channel

## Development

```bash
# Development mode
npm run dev
```

## License

[MIT License](https://github.com/barryyip0625/mcp-discord?tab=MIT-1-ov-file)
