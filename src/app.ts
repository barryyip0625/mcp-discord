import { InMemoryEventStore } from '@modelcontextprotocol/sdk/examples/shared/inMemoryEventStore.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest, SetLevelRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';
import { Client, GatewayIntentBits } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import express, { Request, Response } from 'express';
import { info, Level, setLevel, warning } from './notifications.js';
import * as schemas from './schemas.js';
import * as handlers from './tools/tools.js';
import { createToolContext } from './tools/tools.js';

// Load environment variables from .env file if exists
dotenvConfig();

/**
 * Create and return a configured MCP server wired with the Discord client.
 * The server registers tools programmatically using the handlers and schemas
 * exported from the local modules to avoid a large switch statement.
 */
function createMcpServer(client: Client) {
    const server = new McpServer(
        { name: 'discord-mcp-server', version: '1.0.0' },
        { capabilities: { tools: {}, logging: {} } }
    );
    // attach the Discord client to the tool context for use in handlers
    const toolContext = createToolContext(client);
    // attach the Discord client to the server for logging purposes
    // The underlying Server type from the SDK doesn't declare a `client` property,
    // so assert to `any` to attach a runtime-only property used by handlers.
    (client as any).server = server.server;
    (server as any).discord = client;

    // Map of tool name to handler + schema. Keep this small and explicit so it's
    // easy to see which handler is wired to which tool. Use the exported
    // Zod schemas from `schemas.ts` where available.
    const toolMap: Array<{ name: string; schema?: any; handler: any }> = [
        { name: 'discord_login', schema: schemas.DiscordLoginSchema, handler: handlers.loginHandler },
        { name: 'discord_list_servers', schema: schemas.ListServersSchema, handler: handlers.listServersHandler },
        { name: 'discord_send', schema: schemas.SendMessageSchema, handler: handlers.sendMessageHandler },
        { name: 'discord_get_server_info', schema: schemas.GetServerInfoSchema, handler: handlers.getServerInfoHandler },
        { name: 'discord_create_text_channel', schema: schemas.CreateTextChannelSchema, handler: handlers.createTextChannelHandler },
        { name: 'discord_delete_channel', schema: schemas.DeleteChannelSchema, handler: handlers.deleteChannelHandler },
        { name: 'discord_get_forum_channels', schema: schemas.GetForumChannelsSchema, handler: handlers.getForumChannelsHandler },
        { name: 'discord_create_forum_post', schema: schemas.CreateForumPostSchema, handler: handlers.createForumPostHandler },
        { name: 'discord_get_forum_post', schema: schemas.GetForumPostSchema, handler: handlers.getForumPostHandler },
        { name: 'discord_reply_to_forum', schema: schemas.ReplyToForumSchema, handler: handlers.replyToForumHandler },
        { name: 'discord_delete_forum_post', schema: schemas.DeleteForumPostSchema, handler: handlers.deleteForumPostHandler },
        { name: 'discord_search_messages', schema: schemas.SearchMessagesSchema, handler: handlers.searchMessagesHandler },
        { name: 'discord_read_messages', schema: schemas.ReadMessagesSchema, handler: handlers.readMessagesHandler },
        { name: 'discord_add_reaction', schema: schemas.AddReactionSchema, handler: handlers.addReactionHandler },
        { name: 'discord_add_multiple_reactions', schema: schemas.AddMultipleReactionsSchema, handler: handlers.addMultipleReactionsHandler },
        { name: 'discord_remove_reaction', schema: schemas.RemoveReactionSchema, handler: handlers.removeReactionHandler },
        { name: 'discord_get_reaction_users', schema: schemas.GetReactionUsersSchema, handler: handlers.getReactionUsersHandler },
        { name: 'discord_delete_message', schema: schemas.DeleteMessageSchema, handler: handlers.deleteMessageHandler },
        { name: 'discord_pin_message', schema: schemas.PinMessageSchema, handler: handlers.pinMessageHandler },
        { name: 'discord_unpin_message', schema: schemas.UnpinMessageSchema, handler: handlers.unpinMessageHandler },
        { name: 'discord_list_pinned_messages', schema: schemas.ListPinnedMessagesSchema, handler: handlers.listPinnedMessagesHandler },
        { name: 'discord_create_webhook', schema: schemas.CreateWebhookSchema, handler: handlers.createWebhookHandler },
        { name: 'discord_send_webhook_message', schema: schemas.SendWebhookMessageSchema, handler: handlers.sendWebhookMessageHandler },
        { name: 'discord_edit_webhook', schema: schemas.EditWebhookSchema, handler: handlers.editWebhookHandler },
        { name: 'discord_delete_webhook', schema: schemas.DeleteWebhookSchema, handler: handlers.deleteWebhookHandler },
        { name: 'discord_create_category', schema: schemas.CreateCategorySchema, handler: handlers.createCategoryHandler },
        { name: 'discord_edit_category', schema: schemas.EditCategorySchema, handler: handlers.editCategoryHandler },
        { name: 'discord_delete_category', schema: schemas.DeleteCategorySchema, handler: handlers.deleteCategoryHandler },
    ];

    // Register each tool on the MCP server
    for (const t of toolMap) {
        try {
            server.tool(
                t.name,
                t.schema ? t.schema.description ?? '' : '',
                t.schema ? t.schema.shape ?? t.schema : undefined, async (args: any) => {
                    // Handlers follow the signature: (args, context) => Promise<ToolResponse>
                    return await t.handler(args, toolContext);
                });
        } catch (err) {
            // If a particular tool registration fails, log and continue (keeps boot resilient)
            // eslint-disable-next-line no-console
            warning(server.server, `Failed to register tool ${t.name}: ${String(err)}`);
        }
    }

    // Handle logging method separately
    server.server.setRequestHandler(SetLevelRequestSchema, async (request) => {
        const levelParam = request.params.level as Level | undefined;
        const ok = setLevel(levelParam || 'info');
        // Empty result on success, error on failure
        if (!ok) {
            throw { code: -32602, message: 'Invalid log level' };
        }
        return {};
    });

    return server;
}

// Helper to create a Discord client with sensible defaults used by the CLI
function createDiscordClient(token?: string) {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
    if (token) {
        client.token = token;
        // Auto-login on startup if token is available
        (async () => {
            try {
                await client.login(token);
                info((client as any).server, 'Successfully logged in to Discord');
            } catch (err: any) {
                if (typeof err.message === 'string' && err.message.includes('Privileged intent provided is not enabled or whitelisted')) {
                    warning((client as any).server, 'Discord login failed due to missing privileged intents. Please enable the required intents in the Discord Developer Portal.');
                } else {
                    warning((client as any).server, 'Discord login failed: ' + String(err));
                }
            }
        })();
    }
    let clientStatusInterval: NodeJS.Timeout | null = null;

    function logClientState(context: string) {
        // only log if server is attached and connected
        if (!(client as any).server || !(client as any).server.transport) {
            return;
        }
        info((client as any).server, `Discord client state [${context}]: ${JSON.stringify({
            isReady: client.isReady(),
            hasToken: !!client.token,
            user: client.user ? {
                id: client.user.id,
                tag: client.user.tag,
            } : null
        })}`);
    }
    clientStatusInterval = setInterval(() => {
        logClientState("periodic check");
    }, 10000);
    client.on('ready', () => {
        logClientState("on ready event");
    });
    client.on('disconnect', () => {
        logClientState("on disconnect event");
        if (clientStatusInterval) {
            clearInterval(clientStatusInterval);
            clientStatusInterval = null;
        }
    });
    return client;
}

// Configuration from command-line arguments or environment variables
const config = {
    DISCORD_TOKEN: (() => {
        try {
            // First check for command-line argument
            const tokenIndex = process.argv.indexOf('--config');
            if (tokenIndex !== -1 && tokenIndex + 1 < process.argv.length) {
                const configArg = process.argv[tokenIndex + 1];
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
            process.stderr.write('Error parsing configuration: ' + String(err) + '\n');
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

const discord = createDiscordClient(config.DISCORD_TOKEN);

const app = express();
app.use(express.json());

// region MCP Streamable HTTP Transport Handlers
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};
const mcpPostHandler = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string;
    if (sessionId) {
        process.stderr.write(`Received MCP request for session: ${sessionId}\n`);
    } else {
        process.stderr.write('Request body:' + JSON.stringify(req.body) + '\n');
    }

    try {
        let transport: StreamableHTTPServerTransport;
        if (sessionId && transports[sessionId]) {
            transport = transports[sessionId];
        } else if (!sessionId && isInitializeRequest(req.body)) {
            // New session initialization
            const eventStore = new InMemoryEventStore();
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                eventStore,
                enableJsonResponse: true, // Enable JSON response mode
                onsessioninitialized: sessionId => {
                    // Store the transport by session ID for future requests
                    transports[sessionId] = transport;
                    process.stderr.write(`Initialized new MCP session: ${sessionId}\n`);
                }
            });

            // Set up onclose handler to clean up transport
            transport.onclose = () => {
                const sid = transport.sessionId;
                if (sid && transports[sid]) {
                    delete transports[sid];
                    process.stderr.write(`Closed and removed MCP session: ${sid}\n`);
                }
            };

            // Connect the transport to a server instance of its own. The SDK's
            // Protocol allows exactly one transport per server, so a shared
            // instance would make every session after the first fail with
            // "Already connected to a transport". The Discord client stays
            // shared, so this still uses a single gateway connection.
            await createMcpServer(discord).connect(transport);

            await transport.handleRequest(req, res, req.body);
            return;
        } else {
            // Invalid request without session ID
            res.status(400).json({
                jsonrpc: "2.0",
                error: { code: -32000, message: "Invalid or missing MCP session ID." },
                id: req.body.id || null
            });
            return;
        }

        // Handle the request with the existing transport - no need to reconnect
        await transport.handleRequest(req, res, req.body);
    } catch (err) {
        process.stderr.write('Error handling MCP request: ' + String(err) + '\n');
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: "2.0",
                error: { code: -32000, message: "Internal server error." },
                id: req.body.id || null
            });
        }
    }
};
// Handle GET requests for SSE streams (using built-in support from StreamableHTTP)
const mcpGetHandler = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }

    // Check for Last-Event-ID header for resumability
    const lastEventId = req.headers['last-event-id'] as string | undefined;
    if (lastEventId) {
        process.stderr.write(`Client reconnecting with Last-Event-ID: ${lastEventId}\n`);
    } else {
        process.stderr.write(`Establishing new SSE stream for session ${sessionId}\n`);
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
};
// Handle DELETE requests for session termination (according to MCP spec)
const mcpDeleteHandler = async (req: Request, res: Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
        res.status(400).send('Invalid or missing session ID');
        return;
    }

    process.stderr.write(`Received session termination request for session ${sessionId}\n`);

    try {
        const transport = transports[sessionId];
        await transport.handleRequest(req, res);
    } catch (error) {
        process.stderr.write('Error handling session termination:' + String(error) + '\n');
        if (!res.headersSent) {
            res.status(500).send('Error processing session termination');
        }
    }
};
// endregion

// Handle both Stdio and HTTP transports based on configuration
if (config.TRANSPORT.toLowerCase() === 'http') {
    // HTTP transport endpoints
    app.post('/mcp', mcpPostHandler);
    app.get('/mcp', mcpGetHandler);
    app.delete('/mcp', mcpDeleteHandler);

    const port = config.HTTP_PORT || 8080;
    app.listen(port, error => {
        if (error) {
            process.stderr.write('Error starting MCP HTTP server: ' + String(error) + '\n');
            process.exit(1);
        }
        process.stderr.write(`MCP Streamable HTTP Server listening on port ${port}\n`);
    });

    // Handle server shutdown
    process.on('SIGINT', async () => {
        process.stderr.write('Shutting down server...\n');

        // Close all active transports to properly clean up resources
        for (const sessionId in transports) {
            try {
                process.stderr.write(`Closing transport for session ${sessionId}\n`);
                await transports[sessionId].close();
                delete transports[sessionId];
            } catch (error) {
                process.stderr.write(`Error closing transport for session ${sessionId}:` + String(error) + '\n');
            }
        }
        process.stderr.write('Server shutdown complete\n');
        process.exit(0);
    });
} else {
    // Stdio transport
    const transport = new StdioServerTransport();
    await createMcpServer(discord).connect(transport);
    process.stderr.write('MCP Stdio Server started. Awaiting messages...\n');

}
