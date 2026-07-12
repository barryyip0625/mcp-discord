import { DiscordMCPServer } from './server.js';
import { Client } from 'discord.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { MCPTransport } from './transport.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { toolList } from './toolList.js';

// Mock the external dependencies
jest.mock('@modelcontextprotocol/sdk/server/index.js');
jest.mock('discord.js');
jest.mock('./transport.js', () => ({
  MCPTransport: jest.fn()
}));
jest.mock('./toolList.js');
jest.mock('zod', () => ({
  z: {
    ...jest.requireActual('zod'),
    ZodError: class ZodError extends Error { }
  }
}));
jest.mock('./tools/tools.js', () => ({
  createToolContext: jest.fn(() => ({})),
  loginHandler: jest.fn(),
  sendMessageHandler: jest.fn(),
  getForumChannelsHandler: jest.fn(),
  createForumPostHandler: jest.fn(),
  getForumPostHandler: jest.fn(),
  replyToForumHandler: jest.fn(),
  deleteForumPostHandler: jest.fn(),
  createTextChannelHandler: jest.fn(),
  deleteChannelHandler: jest.fn(),
  readMessagesHandler: jest.fn(),
  getServerInfoHandler: jest.fn(),
  addReactionHandler: jest.fn(),
  addMultipleReactionsHandler: jest.fn(),
  removeReactionHandler: jest.fn(),
  deleteMessageHandler: jest.fn(),
  createWebhookHandler: jest.fn(),
  sendWebhookMessageHandler: jest.fn(),
  editWebhookHandler: jest.fn(),
  deleteWebhookHandler: jest.fn(),
  createCategoryHandler: jest.fn(),
  editCategoryHandler: jest.fn(),
  deleteCategoryHandler: jest.fn(),
  listServersHandler: jest.fn(),
  searchMessagesHandler: jest.fn()
}));
jest.mock('./logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

const mockedServer = {
  setRequestHandler: jest.fn(),
};

const mockedTransport = {
  start: jest.fn(),
  stop: jest.fn(),
};

const mockedClient = {
  isReady: jest.fn(),
  destroy: jest.fn().mockResolvedValue(undefined),
  user: null,
  token: null,
};

describe('DiscordMCPServer', () => {
  let discordMCPServer: DiscordMCPServer;
  let mockServer: any;
  let mockTransport: any;
  let mockClient: any;

  beforeEach(() => {
    // Mock setInterval globally before creating the instance
    jest.useFakeTimers();

    jest.clearAllMocks();

    // Setup mocks
    (Server as jest.MockedClass<any>).mockReturnValue(mockedServer);
    (require('./transport.js').MCPTransport as jest.Mock).mockImplementation(() => mockedTransport);
    (Client as jest.MockedClass<any>).mockReturnValue(mockedClient);

    mockServer = mockedServer;
    mockTransport = mockedTransport;
    mockClient = mockedClient;

    discordMCPServer = new DiscordMCPServer(mockClient, mockTransport);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('constructor', () => {
    it('should initialize server with correct parameters', () => {
      expect(Server).toHaveBeenCalledWith(
        {
          name: 'MCP-Discord',
          version: '1.0.0'
        },
        {
          capabilities: {
            tools: {}
          }
        }
      );
      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2); // ListTools and CallTool handlers
    });

    it('should setup request handlers', () => {
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(ListToolsRequestSchema, expect.any(Function));
      expect(mockServer.setRequestHandler).toHaveBeenCalledWith(CallToolRequestSchema, expect.any(Function));
    });
  });

  describe('request handlers', () => {
    let listToolsHandler: any;
    let callToolHandler: any;

    beforeEach(() => {
      // Extract the handlers that were registered
      const mockCalls = (mockServer.setRequestHandler as jest.Mock).mock.calls;
      listToolsHandler = mockCalls.find((call: any[]) => call[0] === ListToolsRequestSchema)?.[1];
      callToolHandler = mockCalls.find((call: any[]) => call[0] === CallToolRequestSchema)?.[1];
    });

    describe('ListTools handler', () => {
      it('should return the tool list', async () => {
        const result = await listToolsHandler();
        
        expect(result).toEqual({
          tools: toolList
        });
      });
    });

    describe('CallTool handler', () => {
      it('should handle discord_create_category tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').createCategoryHandler as jest.Mock).mockResolvedValue(mockResult);

        const mockArgs = { categoryName: 'test-category' };
        const result = await callToolHandler({
          params: {
            name: 'discord_create_category',
            arguments: mockArgs
          }
        } as any);

        expect(require('./tools/tools.js').createCategoryHandler).toHaveBeenCalledWith(
          mockArgs,
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_edit_category tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').editCategoryHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_edit_category',
            arguments: { categoryId: '123', newName: 'edited-category' }
          }
        } as any);

        expect(require('./tools/tools.js').editCategoryHandler).toHaveBeenCalledWith(
          { categoryId: '123', newName: 'edited-category' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_delete_category tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').deleteCategoryHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_delete_category',
            arguments: { categoryId: '123' }
          }
        } as any);

        expect(require('./tools/tools.js').deleteCategoryHandler).toHaveBeenCalledWith(
          { categoryId: '123' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_login tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').loginHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_login',
            arguments: { token: 'fake-token' }
          }
        } as any);

        expect(require('./tools/tools.js').loginHandler).toHaveBeenCalledWith(
          { token: 'fake-token' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_send tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').sendMessageHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_send',
            arguments: { channelId: '123', message: 'hello' }
          }
        } as any);

        expect(require('./tools/tools.js').sendMessageHandler).toHaveBeenCalledWith(
          { channelId: '123', message: 'hello' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_get_forum_channels tool', async () => {
        const mockResult = { channels: [] };
        (require('./tools/tools.js').getForumChannelsHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_get_forum_channels',
            arguments: { serverId: '123' }
          }
        } as any);

        expect(require('./tools/tools.js').getForumChannelsHandler).toHaveBeenCalledWith(
          { serverId: '123' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_create_forum_post tool', async () => {
        const mockResult = { postId: '456' };
        (require('./tools/tools.js').createForumPostHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_create_forum_post',
            arguments: { channelId: '123', title: 'test', content: 'content' }
          }
        } as any);

        expect(require('./tools/tools.js').createForumPostHandler).toHaveBeenCalledWith(
          { channelId: '123', title: 'test', content: 'content' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_get_forum_post tool', async () => {
        const mockResult = { post: {} };
        (require('./tools/tools.js').getForumPostHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_get_forum_post',
            arguments: { postId: '456' }
          }
        } as any);

        expect(require('./tools/tools.js').getForumPostHandler).toHaveBeenCalledWith(
          { postId: '456' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_reply_to_forum tool', async () => {
        const mockResult = { replyId: '789' };
        (require('./tools/tools.js').replyToForumHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_reply_to_forum',
            arguments: { postId: '456', content: 'reply' }
          }
        } as any);

        expect(require('./tools/tools.js').replyToForumHandler).toHaveBeenCalledWith(
          { postId: '456', content: 'reply' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_delete_forum_post tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').deleteForumPostHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_delete_forum_post',
            arguments: { postId: '456' }
          }
        } as any);

        expect(require('./tools/tools.js').deleteForumPostHandler).toHaveBeenCalledWith(
          { postId: '456' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_create_text_channel tool', async () => {
        const mockResult = { channelId: '999' };
        (require('./tools/tools.js').createTextChannelHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_create_text_channel',
            arguments: { serverId: '123', channelName: 'new-channel' }
          }
        } as any);

        expect(require('./tools/tools.js').createTextChannelHandler).toHaveBeenCalledWith(
          { serverId: '123', channelName: 'new-channel' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_delete_channel tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').deleteChannelHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_delete_channel',
            arguments: { channelId: '999' }
          }
        } as any);

        expect(require('./tools/tools.js').deleteChannelHandler).toHaveBeenCalledWith(
          { channelId: '999' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_read_messages tool', async () => {
        const mockResult = { messages: [] };
        (require('./tools/tools.js').readMessagesHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_read_messages',
            arguments: { channelId: '123', limit: 10 }
          }
        } as any);

        expect(require('./tools/tools.js').readMessagesHandler).toHaveBeenCalledWith(
          { channelId: '123', limit: 10 },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_get_server_info tool', async () => {
        const mockResult = { name: 'Test Server', id: '123' };
        (require('./tools/tools.js').getServerInfoHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_get_server_info',
            arguments: { serverId: '123' }
          }
        } as any);

        expect(require('./tools/tools.js').getServerInfoHandler).toHaveBeenCalledWith(
          { serverId: '123' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_add_reaction tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').addReactionHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_add_reaction',
            arguments: { messageId: '456', emoji: '👍' }
          }
        } as any);

        expect(require('./tools/tools.js').addReactionHandler).toHaveBeenCalledWith(
          { messageId: '456', emoji: '👍' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_add_multiple_reactions tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').addMultipleReactionsHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_add_multiple_reactions',
            arguments: { messageId: '456', emojis: ['👍', '👎'] }
          }
        } as any);

        expect(require('./tools/tools.js').addMultipleReactionsHandler).toHaveBeenCalledWith(
          { messageId: '456', emojis: ['👍', '👎'] },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_remove_reaction tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').removeReactionHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_remove_reaction',
            arguments: { messageId: '456', userId: '789', emoji: '👍' }
          }
        } as any);

        expect(require('./tools/tools.js').removeReactionHandler).toHaveBeenCalledWith(
          { messageId: '456', userId: '789', emoji: '👍' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_delete_message tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').deleteMessageHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_delete_message',
            arguments: { messageId: '456', channelId: '123' }
          }
        } as any);

        expect(require('./tools/tools.js').deleteMessageHandler).toHaveBeenCalledWith(
          { messageId: '456', channelId: '123' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_create_webhook tool', async () => {
        const mockResult = { webhookId: 'abc' };
        (require('./tools/tools.js').createWebhookHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_create_webhook',
            arguments: { channelId: '123', name: 'webhook-name' }
          }
        } as any);

        expect(require('./tools/tools.js').createWebhookHandler).toHaveBeenCalledWith(
          { channelId: '123', name: 'webhook-name' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_send_webhook_message tool', async () => {
        const mockResult = { messageId: 'def' };
        (require('./tools/tools.js').sendWebhookMessageHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_send_webhook_message',
            arguments: { webhookId: 'abc', message: 'hello' }
          }
        } as any);

        expect(require('./tools/tools.js').sendWebhookMessageHandler).toHaveBeenCalledWith(
          { webhookId: 'abc', message: 'hello' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_edit_webhook tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').editWebhookHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_edit_webhook',
            arguments: { webhookId: 'abc', newName: 'updated-name' }
          }
        } as any);

        expect(require('./tools/tools.js').editWebhookHandler).toHaveBeenCalledWith(
          { webhookId: 'abc', newName: 'updated-name' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_delete_webhook tool', async () => {
        const mockResult = { success: true };
        (require('./tools/tools.js').deleteWebhookHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_delete_webhook',
            arguments: { webhookId: 'abc' }
          }
        } as any);

        expect(require('./tools/tools.js').deleteWebhookHandler).toHaveBeenCalledWith(
          { webhookId: 'abc' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_list_servers tool', async () => {
        const mockResult = { servers: [] };
        (require('./tools/tools.js').listServersHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_list_servers',
            arguments: {}
          }
        } as any);

        expect(require('./tools/tools.js').listServersHandler).toHaveBeenCalledWith(
          {},
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should handle discord_search_messages tool', async () => {
        const mockResult = { messages: [] };
        (require('./tools/tools.js').searchMessagesHandler as jest.Mock).mockResolvedValue(mockResult);

        const result = await callToolHandler({
          params: {
            name: 'discord_search_messages',
            arguments: { query: 'test', channelId: '123' }
          }
        } as any);

        expect(require('./tools/tools.js').searchMessagesHandler).toHaveBeenCalledWith(
          { query: 'test', channelId: '123' },
          expect.anything()
        );
        expect(result).toBe(mockResult);
      });

      it('should return error for unknown tool', async () => {
        const result = await callToolHandler({
          params: {
            name: 'unknown_tool',
            arguments: {}
          }
        } as any);

        expect(result).toEqual({
          content: [{ type: "text", text: "Error executing tool: Unknown tool: unknown_tool" }],
          isError: true
        });
      });

      it('should handle Zod validation errors', async () => {
        // Create a proper ZodError mock that will pass the instanceof check
        const mockZodError = new (require('zod').z.ZodError)([] as any);
        mockZodError.errors = [
          { path: ['param'], message: 'Invalid param' }
        ];

        (require('./tools/tools.js').sendMessageHandler as jest.Mock).mockRejectedValue(mockZodError);

        const result = await callToolHandler({
          params: {
            name: 'discord_send',
            arguments: {}
          }
        } as any);

        expect(result).toEqual({
          content: [{ type: "text", text: "Invalid arguments: param: Invalid param" }],
          isError: true
        });
      });

      it('should handle generic errors', async () => {
        const mockError = new Error('Generic error');

        (require('./tools/tools.js').sendMessageHandler as jest.Mock).mockRejectedValue(mockError);

        const result = await callToolHandler({
          params: {
            name: 'discord_send',
            arguments: {}
          }
        } as any);

        expect(result).toEqual({
          content: [{ type: "text", text: "Error executing tool: Generic error" }],
          isError: true
        });
      });
    });
  });

  describe('start', () => {
    it('should start the transport and set up client state logging', async () => {
      jest.useFakeTimers();

      // Mock setInterval since it's a global function
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      await discordMCPServer.start();

      expect(mockTransport.start).toHaveBeenCalledWith(mockServer);
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

      // Clean up timer
      jest.useRealTimers();
    });

    it('should add client to server context', async () => {
      await discordMCPServer.start();

      // Check that client was added to the server context
      expect((mockServer as any)._context).toBeDefined();
      expect((mockServer as any).client).toBeDefined();
    });
  });

  describe('stop', () => {
    it('should stop the transport and clear the interval', async () => {
      jest.useFakeTimers();
      // First start to initialize the interval
      await discordMCPServer.start();

      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      await discordMCPServer.stop();

      expect(clearIntervalSpy).toHaveBeenCalled();
      expect(mockTransport.stop).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should stop even if interval is not set', async () => {
      // Don't call start, so no interval is set
      await discordMCPServer.stop();

      expect(mockTransport.stop).toHaveBeenCalled();
    });

    it('should destroy Discord even when transport shutdown rejects', async () => {
      mockTransport.stop.mockRejectedValueOnce(new Error('transport close failed'));

      await expect(discordMCPServer.stop()).rejects.toThrow('transport close failed');
      expect(mockClient.destroy).toHaveBeenCalled();
    });
  });
});