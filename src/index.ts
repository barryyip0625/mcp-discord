#!/usr/bin/env node
import { Client, GatewayIntentBits } from "discord.js";
import { config as dotenvConfig } from 'dotenv';
import { DiscordMCPServer } from './server.js';
import { StdioTransport, StreamableHttpTransport } from './transport.js';
import { info, error } from './logger.js';

// Load environment variables from .env file if exists
dotenvConfig();

// Configuration with priority for command line arguments
const config = {
    DISCORD_TOKEN: (() => {
        try {
            // First try to get from command line arguments
            const configIndex = process.argv.indexOf('--config');
            if (configIndex !== -1 && configIndex + 1 < process.argv.length) {
                const configArg = process.argv[configIndex + 1];
                // Handle both string and object formats
                if (typeof configArg === 'string') {
                    try {
                        const parsedConfig = JSON.parse(configArg);
                        return parsedConfig.DISCORD_TOKEN;
                    } catch (err) {
                        // If not valid JSON, try using the string directly
                        return configArg;
                    }
                }
            }
            // Then try environment variable
            return process.env.DISCORD_TOKEN;
        } catch (err) {
            error('Error parsing config: ' + String(err));
            return null;
        }
    })(),
    TRANSPORT: (() => {
        // Check for transport type argument
        const transportIndex = process.argv.indexOf('--transport');
        if (transportIndex !== -1 && transportIndex + 1 < process.argv.length) {
            return process.argv[transportIndex + 1];
        }
        // Default to stdio
        return 'stdio';
    })(),
    HTTP_PORT: (() => {
        // Check for port argument
        const portIndex = process.argv.indexOf('--port');
        if (portIndex !== -1 && portIndex + 1 < process.argv.length) {
            return parseInt(process.argv[portIndex + 1]);
        }
        // Default port for MCP
        return 8080;
    })()
};

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Save token to client for login handler
if (config.DISCORD_TOKEN) {
    client.token = config.DISCORD_TOKEN;
}

// Auto-login on startup if token is available
const autoLogin = async () => {
    const token = config.DISCORD_TOKEN;
    if (token) {
        try {
            await client.login(token);
            info('Successfully logged in to Discord');
        } catch (err: any) {
            if (typeof err.message === 'string' && err.message.includes('Privileged intent provided is not enabled or whitelisted')) {
                error('Login failed: One or more privileged intents are not enabled in the Discord Developer Portal. Please enable the required intents.');
            } else {
                error('Auto-login failed: ' + String(err));
            }
        }
    } else {
        info("No Discord token found in config, skipping auto-login");
    }
};

// Initialize transport based on configuration
const initializeTransport = () => {
    switch (config.TRANSPORT.toLowerCase()) {
        case 'http':
            info(`Initializing HTTP transport on 0.0.0.0:${config.HTTP_PORT}`);
            return new StreamableHttpTransport(config.HTTP_PORT);
        case 'stdio':
            info('Initializing stdio transport');
            return new StdioTransport();
        default:
            error(`Unknown transport type: ${config.TRANSPORT}. Falling back to stdio.`);
            return new StdioTransport();
    }
};

// Start auto-login process
await autoLogin();

// Create and start MCP server with selected transport
const transport = initializeTransport();
const mcpServer = new DiscordMCPServer(client, transport);

try {
    await mcpServer.start();
    info('MCP server started successfully');
    
    // Keep the Node.js process running
    if (config.TRANSPORT.toLowerCase() === 'http') {
        // Send a heartbeat every 30 seconds to keep the process alive
        setInterval(() => {
            info('MCP server is running');
        }, 30000);
        
        // Handle termination signals
        process.on('SIGINT', async () => {
            info('Received SIGINT. Shutting down server...');
            await mcpServer.stop();
            process.exit(0);
        });
        
        process.on('SIGTERM', async () => {
            info('Received SIGTERM. Shutting down server...');
            await mcpServer.stop();
            process.exit(0);
        });
        
        info('Server running in keep-alive mode. Press Ctrl+C to stop.');
    }
} catch (err) {
    error('Failed to start MCP server: ' + String(err));
    process.exit(1);
}