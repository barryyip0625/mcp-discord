import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express, { Request, Response } from "express";
import { toolList } from './toolList.js';
import {
  createToolContext,
  loginHandler,
  sendMessageHandler,
  getForumChannelsHandler,
  createForumPostHandler,
  getForumPostHandler,
  replyToForumHandler,
  deleteForumPostHandler,
  createTextChannelHandler,
  deleteChannelHandler,
  readMessagesHandler,
  getServerInfoHandler,
  addReactionHandler,
  addMultipleReactionsHandler,
  removeReactionHandler,
  deleteMessageHandler,
  createWebhookHandler,
  sendWebhookMessageHandler,
  editWebhookHandler,
  deleteWebhookHandler,
  editCategoryHandler,
  createCategoryHandler,
  deleteCategoryHandler,
  listServersHandler,
  searchMessagesHandler   
} from './tools/tools.js';
import { Client, GatewayIntentBits } from "discord.js";
import { info, error } from './logger.js';

export interface MCPTransport {
    start(server: Server): Promise<void>;
    stop(): Promise<void>;
}

export class StdioTransport implements MCPTransport {
    private transport: StdioServerTransport | null = null;

    async start(server: Server): Promise<void> {
        this.transport = new StdioServerTransport();
        await server.connect(this.transport);
    }

    async stop(): Promise<void> {
        if (this.transport) {
            await this.transport.close();
            this.transport = null;
        }
    }
}

export class StreamableHttpTransport implements MCPTransport {
    private app: express.Application;
    private server: Server | null = null;
    private httpServer: any = null;
    private transport: StreamableHTTPServerTransport | null = null;
    private toolContext: ReturnType<typeof createToolContext> | null = null;
    private sessionId: string = '';

    constructor(private port: number = 8080) {
        this.app = express();
        this.app.use(express.json());
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        info(`Created HTTP transport with session ID: ${this.sessionId}`);
    }

    async start(server: Server): Promise<void> {
        this.server = server;
        info('Starting HTTP transport with server: ' + String(!!this.server));
        
        // Try to get client from the DiscordMCPServer instance
        if (server) {
            const anyServer = server as any;
            let client: Client | undefined;
            
            if (anyServer._context?.client) {
                client = anyServer._context.client;
                info('Found client in server._context');
            } 
            else if (anyServer.client instanceof Client) {
                client = anyServer.client;
                info('Found client directly on server object');
            }
            else if (anyServer._parent?.client instanceof Client) {
                client = anyServer._parent.client;
                info('Found client in server._parent');
            }
            
            if (client) {
                this.toolContext = createToolContext(client);
                info('Tool context initialized with Discord client');
            } else {
                info('Creating new Discord client for transport');
                const newClient = new Client({
                    intents: [
                        GatewayIntentBits.Guilds,
                        GatewayIntentBits.GuildMessages,
                        GatewayIntentBits.MessageContent,
                        GatewayIntentBits.GuildMessageReactions
                    ]
                });
                this.toolContext = createToolContext(newClient);
                info('Tool context initialized with new Discord client');
            }
        }
        
        // Create transport
        this.transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined // stateless
        });
        
        // Connect the transport
        await this.server.connect(this.transport);
        info('Transport connected');

        // Setup /mcp endpoint to use transport.handleRequest()
        this.app.all('/mcp', async (req: Request, res: Response) => {
            try {
                await this.transport!.handleRequest(req, res, req.body);
            } catch (err) {
                error('Error handling MCP request: ' + String(err));
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Internal server error' });
                }
            }
        });

        return new Promise((resolve) => {
            this.httpServer = this.app.listen(this.port, '0.0.0.0', () => {
                info(`MCP Server listening on 0.0.0.0:${this.port}`);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        if (this.transport) {
            await this.transport.close();
            this.transport = null;
        }

        if (this.server) {
            await this.server.close();
            this.server = null;
        }

        if (this.httpServer) {
            return new Promise((resolve) => {
                this.httpServer.close(() => {
                    info('HTTP server closed');
                    this.httpServer = null;
                    resolve();
                });
            });
        }
    }
} 