import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { Client } from "discord.js";
import { z } from "zod";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
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
  createCategoryHandler,
  editCategoryHandler,
  deleteCategoryHandler,
  listServersHandler,
  searchMessagesHandler,
  setPresenceHandler,
  setNicknameHandler,
  setBioHandler,
} from './tools/tools.js';
import { MCPTransport } from './transport.js';
import { info, error } from './logger.js';

export class DiscordMCPServer {
  private server: Server;
  private toolContext: ReturnType<typeof createToolContext>;
  private clientStatusInterval: NodeJS.Timeout | null = null;

  constructor(
    private client: Client,
    private transport: MCPTransport
  ) {
    this.server = new Server(
      {
        name: "MCP-Discord",
        version: "1.0.0"
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.toolContext = createToolContext(client);
    this.setupHandlers();
  }

  private setupHandlers() {
    // Set up the tool list
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: toolList
      };
    });

    // Handle tool execution requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let toolResponse;
        switch (name) {
          case "discord_create_category":
            toolResponse = await createCategoryHandler(args, this.toolContext);
            return toolResponse;
          case "discord_edit_category":
            toolResponse = await editCategoryHandler(args, this.toolContext);
            return toolResponse;
          case "discord_delete_category":
            toolResponse = await deleteCategoryHandler(args, this.toolContext);
            return toolResponse;

          case "discord_login": toolResponse = await loginHandler(args, this.toolContext);
            this.logClientState("after discord_login handler");
            return toolResponse;

          case "discord_send":
            this.logClientState("before discord_send handler");
            toolResponse = await sendMessageHandler(args, this.toolContext);
            return toolResponse;

          case "discord_get_forum_channels":
            this.logClientState("before discord_get_forum_channels handler");
            toolResponse = await getForumChannelsHandler(args, this.toolContext);
            return toolResponse;

          case "discord_create_forum_post":
            this.logClientState("before discord_create_forum_post handler");
            toolResponse = await createForumPostHandler(args, this.toolContext);
            return toolResponse;

          case "discord_get_forum_post":
            this.logClientState("before discord_get_forum_post handler");
            toolResponse = await getForumPostHandler(args, this.toolContext);
            return toolResponse;

          case "discord_reply_to_forum":
            this.logClientState("before discord_reply_to_forum handler");
            toolResponse = await replyToForumHandler(args, this.toolContext);
            return toolResponse;

          case "discord_delete_forum_post":
            this.logClientState("before discord_delete_forum_post handler");
            toolResponse = await deleteForumPostHandler(args, this.toolContext);
            return toolResponse;

          case "discord_create_text_channel":
            this.logClientState("before discord_create_text_channel handler");
            toolResponse = await createTextChannelHandler(args, this.toolContext);
            return toolResponse;

          case "discord_delete_channel":
            this.logClientState("before discord_delete_channel handler");
            toolResponse = await deleteChannelHandler(args, this.toolContext);
            return toolResponse;

          case "discord_read_messages":
            this.logClientState("before discord_read_messages handler");
            toolResponse = await readMessagesHandler(args, this.toolContext);
            return toolResponse;

          case "discord_get_server_info":
            this.logClientState("before discord_get_server_info handler");
            toolResponse = await getServerInfoHandler(args, this.toolContext);
            return toolResponse;

          case "discord_add_reaction":
            this.logClientState("before discord_add_reaction handler");
            toolResponse = await addReactionHandler(args, this.toolContext);
            return toolResponse;

          case "discord_add_multiple_reactions":
            this.logClientState("before discord_add_multiple_reactions handler");
            toolResponse = await addMultipleReactionsHandler(args, this.toolContext);
            return toolResponse;

          case "discord_remove_reaction":
            this.logClientState("before discord_remove_reaction handler");
            toolResponse = await removeReactionHandler(args, this.toolContext);
            return toolResponse;

          case "discord_delete_message":
            this.logClientState("before discord_delete_message handler");
            toolResponse = await deleteMessageHandler(args, this.toolContext);
            return toolResponse;

          case "discord_create_webhook":
            this.logClientState("before discord_create_webhook handler");
            toolResponse = await createWebhookHandler(args, this.toolContext);
            return toolResponse;

          case "discord_send_webhook_message":
            this.logClientState("before discord_send_webhook_message handler");
            toolResponse = await sendWebhookMessageHandler(args, this.toolContext);
            return toolResponse;

          case "discord_edit_webhook":
            this.logClientState("before discord_edit_webhook handler");
            toolResponse = await editWebhookHandler(args, this.toolContext);
            return toolResponse;

          case "discord_delete_webhook":
            this.logClientState("before discord_delete_webhook handler");
            toolResponse = await deleteWebhookHandler(args, this.toolContext);
            return toolResponse;

          case "discord_list_servers":
            this.logClientState("before discord_list_servers handler");
            toolResponse = await listServersHandler(args, this.toolContext);
            return toolResponse;

          case "discord_search_messages":
            this.logClientState("before discord_search_messages handler");
            toolResponse = await searchMessagesHandler(args, this.toolContext);
            return toolResponse;

          case "discord_set_presence":
            this.logClientState("before discord_set_bot_presence handler");
            toolResponse = await setPresenceHandler(args, this.toolContext);
            return toolResponse;

          case "discord_set_nickname":
            this.logClientState("before discord_set_nickname handler");
            toolResponse = await setNicknameHandler(args, this.toolContext);
            return toolResponse;

          case "discord_set_bio":
            this.logClientState("before discord_set_bio handler");
            toolResponse = await setBioHandler(args, this.toolContext);
            return toolResponse;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            content: [{
              type: "text",
              text: `Invalid arguments: ${error.errors
                .map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`)
                .join(", ")}`
            }],
            isError: true
          };
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ type: "text", text: `Error executing tool: ${errorMessage}` }],
          isError: true
        };
      }
    });
  }

  private logClientState(context: string) {
    info(`Discord client state [${context}]: ${JSON.stringify({
      isReady: this.client.isReady(),
      hasToken: !!this.client.token,
      user: this.client.user ? {
        id: this.client.user.id,
        tag: this.client.user.tag,
      } : null
    })}`);
  }

  async start() {
    // Add client to server context so transport can access it
    (this.server as any)._context = { client: this.client };
    (this.server as any).client = this.client;

    // Setup periodic client state logging
    this.clientStatusInterval = setInterval(() => {
      this.logClientState("periodic check");
    }, 10000);

    await this.transport.start(this.server);
  }

  async stop() {
    // Clear the periodic check interval
    if (this.clientStatusInterval) {
      clearInterval(this.clientStatusInterval);
      this.clientStatusInterval = null;
    }

    await this.transport.stop();
  }
} 