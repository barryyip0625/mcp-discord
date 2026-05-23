import { 
  createWebhookHandler, 
  sendWebhookMessageHandler,
  editWebhookHandler,
  deleteWebhookHandler
} from './webhooks.js';
import { handleDiscordError } from '../errorHandler.js';
import { ChannelType } from 'discord.js';
import { ToolContext } from './types.js';

// Mock Discord.js modules
const mockClient = {
  isReady: jest.fn(),
  channels: {
    fetch: jest.fn()
  },
  fetchWebhook: jest.fn()
};

const mockTextChannel = {
  isTextBased: () => true,
  createWebhook: jest.fn()
};
const mockVoiceChannel = {
  isTextBased: () => false
};
const mockTextChannelNoWebhookSupport = {
  isTextBased: () => true
  // No createWebhook property
};

const mockWebhook = {
  id: 'webhook123',
  token: 'webhook-token-abc',
  send: jest.fn(),
  edit: jest.fn(),
  delete: jest.fn()
};

describe('Webhooks Tool Handlers', () => {
  let context: ToolContext;

  beforeEach(() => {
    jest.clearAllMocks();
    context = { client: mockClient as any };
  });

  describe('createWebhookHandler', () => {
    const validArgs = {
      channelId: 'channel123',
      name: 'Test Webhook',
      avatar: 'avatar-url',
      reason: 'Test reason'
    };

    it('should return error if client is not ready', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(false);

      const result = await createWebhookHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if channel does not exist', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.channels.fetch as jest.Mock).mockResolvedValue(null);

      const result = await createWebhookHandler(validArgs, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('channel123');
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find text channel with ID: channel123" }],
        isError: true
      });
    });

    it('should return error if channel does not support webhooks', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.channels.fetch as jest.Mock).mockResolvedValue(mockTextChannelNoWebhookSupport);

      const result = await createWebhookHandler(validArgs, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('channel123');
      expect(result).toEqual({
        content: [{ type: "text", text: "Channel type does not support webhooks: channel123" }],
        isError: true
      });
    });

    it('should create webhook successfully', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.channels.fetch as jest.Mock).mockResolvedValue(mockTextChannel);
      (mockTextChannel.createWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const result = await createWebhookHandler(validArgs, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('channel123');
      expect(mockTextChannel.createWebhook).toHaveBeenCalledWith({
        name: 'Test Webhook',
        avatar: 'avatar-url',
        reason: 'Test reason'
      });
      expect(result).toEqual({
        content: [{
          type: "text",
          text: "Successfully created webhook with ID: webhook123 and token: webhook-token-abc"
        }]
      });
    });

    it('should handle Discord errors properly', async () => {
      const mockError = new Error('Discord API Error');
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.channels.fetch as jest.Mock).mockResolvedValue(mockTextChannel);
      (mockTextChannel.createWebhook as jest.Mock).mockRejectedValue(mockError);
      jest.spyOn(require('../errorHandler.js'), 'handleDiscordError').mockReturnValue({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });

      const result = await createWebhookHandler(validArgs, context);

      expect(handleDiscordError).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });
    });

    it('should call createWebhook without optional fields when not provided', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.channels.fetch as jest.Mock).mockResolvedValue(mockTextChannel);
      (mockTextChannel.createWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const argsWithoutOptionals = {
        channelId: 'channel123',
        name: 'Test Webhook'
        // No avatar or reason
      };

      const result = await createWebhookHandler(argsWithoutOptionals, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('channel123');
      expect(mockTextChannel.createWebhook).toHaveBeenCalledWith({
        name: 'Test Webhook',
        avatar: undefined,
        reason: undefined
      });
      expect(result).toEqual({
        content: [{
          type: "text",
          text: "Successfully created webhook with ID: webhook123 and token: webhook-token-abc"
        }]
      });
    });
  });

  describe('sendWebhookMessageHandler', () => {
    const validArgs = {
      webhookId: 'webhook123',
      webhookToken: 'webhook-token-abc',
      content: 'Test message',
      username: 'Test Bot',
      avatarURL: 'avatar-url',
      threadId: 'thread123'
    };

    it('should return error if client is not ready', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(false);

      const result = await sendWebhookMessageHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if webhook does not exist', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(null);

      const result = await sendWebhookMessageHandler(validArgs, context);

      expect(mockClient.fetchWebhook).toHaveBeenCalledWith('webhook123', 'webhook-token-abc');
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find webhook with ID: webhook123" }],
        isError: true
      });
    });

    it('should send webhook message successfully', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const result = await sendWebhookMessageHandler(validArgs, context);

      expect(mockClient.fetchWebhook).toHaveBeenCalledWith('webhook123', 'webhook-token-abc');
      expect(mockWebhook.send).toHaveBeenCalledWith({
        content: 'Test message',
        username: 'Test Bot',
        avatarURL: 'avatar-url',
        threadId: 'thread123'
      });
      expect(result).toEqual({
        content: [{
          type: "text",
          text: "Successfully sent webhook message to webhook ID: webhook123"
        }]
      });
    });

    it('should handle Discord errors properly', async () => {
      const mockError = new Error('Discord API Error');
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);
      (mockWebhook.send as jest.Mock).mockRejectedValue(mockError);
      jest.spyOn(require('../errorHandler.js'), 'handleDiscordError').mockReturnValue({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });

      const result = await sendWebhookMessageHandler(validArgs, context);

      expect(handleDiscordError).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });
    });

    it('should call send with only required fields when optionals are not provided', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const argsWithoutOptionals = {
        webhookId: 'webhook123',
        webhookToken: 'webhook-token-abc',
        content: 'Test message'
        // No username, avatarURL or threadId
      };

      await sendWebhookMessageHandler(argsWithoutOptionals, context);

      expect(mockWebhook.send).toHaveBeenCalledWith({
        content: 'Test message',
        username: undefined,
        avatarURL: undefined,
        threadId: undefined
      });
    });
  });

  describe('editWebhookHandler', () => {
    const validArgs = {
      webhookId: 'webhook123',
      webhookToken: 'webhook-token-abc',
      name: 'Updated Name',
      avatar: 'updated-avatar',
      channelId: 'new-channel-id',
      reason: 'Update reason'
    };

    it('should return error if client is not ready', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(false);

      const result = await editWebhookHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if webhook does not exist', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(null);

      const result = await editWebhookHandler(validArgs, context);

      expect(mockClient.fetchWebhook).toHaveBeenCalledWith('webhook123', 'webhook-token-abc');
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find webhook with ID: webhook123" }],
        isError: true
      });
    });

    it('should edit webhook successfully', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const result = await editWebhookHandler(validArgs, context);

      expect(mockClient.fetchWebhook).toHaveBeenCalledWith('webhook123', 'webhook-token-abc');
      expect(mockWebhook.edit).toHaveBeenCalledWith({
        name: 'Updated Name',
        avatar: 'updated-avatar',
        channel: 'new-channel-id',
        reason: 'Update reason'
      });
      expect(result).toEqual({
        content: [{
          type: "text",
          text: "Successfully edited webhook with ID: webhook123"
        }]
      });
    });

    it('should handle Discord errors properly', async () => {
      const mockError = new Error('Discord API Error');
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);
      (mockWebhook.edit as jest.Mock).mockRejectedValue(mockError);
      jest.spyOn(require('../errorHandler.js'), 'handleDiscordError').mockReturnValue({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });

      const result = await editWebhookHandler(validArgs, context);

      expect(handleDiscordError).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });
    });

    it('should call edit with only existing fields when not all options are provided', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const argsWithoutSomeOptionals = {
        webhookId: 'webhook123',
        webhookToken: 'webhook-token-abc',
        name: 'Updated Name'
        // Other optional fields not provided
      };

      await editWebhookHandler(argsWithoutSomeOptionals, context);

      expect(mockWebhook.edit).toHaveBeenCalledWith({
        name: 'Updated Name',
        avatar: undefined,
        channel: undefined,
        reason: undefined
      });
    });
  });

  describe('deleteWebhookHandler', () => {
    const validArgs = {
      webhookId: 'webhook123',
      webhookToken: 'webhook-token-abc',
      reason: 'Delete reason'
    };

    it('should return error if client is not ready', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(false);

      const result = await deleteWebhookHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if webhook does not exist', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(null);

      const result = await deleteWebhookHandler(validArgs, context);

      expect(mockClient.fetchWebhook).toHaveBeenCalledWith('webhook123', 'webhook-token-abc');
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find webhook with ID: webhook123" }],
        isError: true
      });
    });

    it('should delete webhook successfully', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const result = await deleteWebhookHandler(validArgs, context);

      expect(mockClient.fetchWebhook).toHaveBeenCalledWith('webhook123', 'webhook-token-abc');
      expect(mockWebhook.delete).toHaveBeenCalledWith('Delete reason');
      expect(result).toEqual({
        content: [{
          type: "text",
          text: "Successfully deleted webhook with ID: webhook123"
        }]
      });
    });

    it('should use default reason when reason is not provided', async () => {
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);

      const argsWithoutReason = {
        webhookId: 'webhook123',
        webhookToken: 'webhook-token-abc'
        // No reason provided
      };

      await deleteWebhookHandler(argsWithoutReason, context);

      expect(mockWebhook.delete).toHaveBeenCalledWith('Webhook deleted via API');
    });

    it('should handle Discord errors properly', async () => {
      const mockError = new Error('Discord API Error');
      (mockClient.isReady as jest.Mock).mockReturnValue(true);
      (mockClient.fetchWebhook as jest.Mock).mockResolvedValue(mockWebhook);
      (mockWebhook.delete as jest.Mock).mockRejectedValue(mockError);
      jest.spyOn(require('../errorHandler.js'), 'handleDiscordError').mockReturnValue({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });

      const result = await deleteWebhookHandler(validArgs, context);

      expect(handleDiscordError).toHaveBeenCalledWith(mockError);
      expect(result).toEqual({
        content: [{ type: "text", text: "Discord API Error: Discord API Error" }],
        isError: true
      });
    });
  });
});