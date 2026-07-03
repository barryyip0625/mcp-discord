import {
  addReactionHandler,
  addMultipleReactionsHandler,
  removeReactionHandler,
  deleteMessageHandler
} from './reactions.js';
import { AddReactionSchema, AddMultipleReactionsSchema, RemoveReactionSchema, DeleteMessageSchema } from '../schemas.js';
import { ToolContext } from './types.js';

// Mock the errorHandler module
jest.mock('../errorHandler', () => ({
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
    isError: true
  }))
}));

describe('reactions', () => {
  let mockClient: any;
  let mockChannel: any;
  let mockMessage: any;
  let mockReactionsCache: any;
  let mockReaction: any;
  let context: ToolContext;

  beforeEach(() => {
    mockReaction = {
      emoji: { toString: () => '👍', name: 'thumbsup' },
      users: {
        remove: jest.fn()
      }
    };

    mockReactionsCache = new Map([['thumbsup', mockReaction]]);

    // Mock the find method that is used in the removeReactionHandler
    const mockFind = jest.fn();
    mockReactionsCache.find = mockFind;

    mockMessage = {
      react: jest.fn(),
      delete: jest.fn(),
      reactions: {
        cache: mockReactionsCache
      }
    };

    mockChannel = {
      isTextBased: () => true,
      messages: {
        fetch: jest.fn()
      }
    };

    mockClient = {
      isReady: jest.fn(() => true),
      channels: {
        fetch: jest.fn(),
      },
      user: {
        id: 'bot-user-id'
      }
    };

    context = { client: mockClient };

    // Default mocks for successful flows
    mockClient.channels.fetch.mockResolvedValue(mockChannel);
    mockChannel.messages.fetch.mockResolvedValue(mockMessage);

    // Setup default find behavior to return the mock reaction
    mockReactionsCache.find = jest.fn().mockImplementation((predicate) => {
      if (predicate(mockReaction)) {
        return mockReaction;
      }
      return undefined;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset find mock
    mockReactionsCache.find = jest.fn();
  });

  describe('addReactionHandler', () => {
    const validArgs = {
      channelId: '123',
      messageId: '456',
      emoji: '👍'
    };

    it('should successfully add a reaction to a message', async () => {
      const result = await addReactionHandler(validArgs, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('123');
      expect(mockChannel.messages.fetch).toHaveBeenCalledWith('456');
      expect(mockMessage.react).toHaveBeenCalledWith('👍');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully added reaction 👍 to message ID: 456' }]
      });
    });

    it('should return error if client is not ready', async () => {
      mockClient.isReady.mockReturnValue(false);

      const result = await addReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Discord client not logged in.' }],
        isError: true
      });
    });

    it('should return error if channel is not found', async () => {
      mockClient.channels.fetch.mockResolvedValue(null);

      const result = await addReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find text channel with ID: 123' }],
        isError: true
      });
    });

    it('should return error if channel is not text-based', async () => {
      const voiceChannel = {
        isTextBased: () => false
      };
      mockClient.channels.fetch.mockResolvedValue(voiceChannel);

      const result = await addReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find text channel with ID: 123' }],
        isError: true
      });
    });

    it('should return error if channel has no messages property', async () => {
      const nonTextChannel = {
        isTextBased: () => true
        // Missing 'messages' property
      };
      mockClient.channels.fetch.mockResolvedValue(nonTextChannel);

      const result = await addReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find text channel with ID: 123' }],
        isError: true
      });
    });

    it('should return error if message is not found', async () => {
      mockChannel.messages.fetch.mockResolvedValue(null);

      const result = await addReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find message with ID: 456' }],
        isError: true
      });
    });

    it('should handle Discord errors gracefully', async () => {
      const error = new Error('Test Discord error');
      mockMessage.react.mockRejectedValue(error);

      const result = await addReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Test Discord error' }],
        isError: true
      });
    });

    it('should validate input with AddReactionSchema', () => {
      expect(() => AddReactionSchema.parse(validArgs)).not.toThrow();
      expect(() => AddReactionSchema.parse({})).toThrow();
      expect(() => AddReactionSchema.parse({ channelId: '123' })).toThrow();
    });
  });

  describe('addMultipleReactionsHandler', () => {
    const validArgs = {
      channelId: '123',
      messageId: '456',
      emojis: ['👍', '👎', '❤️']
    };

    it('should successfully add multiple reactions to a message', async () => {
      const result = await addMultipleReactionsHandler(validArgs, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('123');
      expect(mockChannel.messages.fetch).toHaveBeenCalledWith('456');
      expect(mockMessage.react).toHaveBeenNthCalledWith(1, '👍');
      expect(mockMessage.react).toHaveBeenNthCalledWith(2, '👎');
      expect(mockMessage.react).toHaveBeenNthCalledWith(3, '❤️');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully added 3 reactions to message ID: 456' }]
      });
    });

    it('should return error if client is not ready', async () => {
      mockClient.isReady.mockReturnValue(false);

      const result = await addMultipleReactionsHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Discord client not logged in.' }],
        isError: true
      });
    });

    it('should return error if channel is not found', async () => {
      mockClient.channels.fetch.mockResolvedValue(null);

      const result = await addMultipleReactionsHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find text channel with ID: 123' }],
        isError: true
      });
    });

    it('should return error if message is not found', async () => {
      mockChannel.messages.fetch.mockResolvedValue(null);

      const result = await addMultipleReactionsHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find message with ID: 456' }],
        isError: true
      });
    });

    it('should handle Discord errors gracefully', async () => {
      const error = new Error('Test Discord error');
      mockMessage.react.mockRejectedValue(error);

      const result = await addMultipleReactionsHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Test Discord error' }],
        isError: true
      });
    });

    it('should validate input with AddMultipleReactionsSchema', () => {
      expect(() => AddMultipleReactionsSchema.parse(validArgs)).not.toThrow();
      expect(() => AddMultipleReactionsSchema.parse({})).toThrow();
      expect(() => AddMultipleReactionsSchema.parse({ channelId: '123' })).toThrow();
    });
  });

  describe('removeReactionHandler', () => {
    const validArgs = {
      channelId: '123',
      messageId: '456',
      emoji: '👍'
    };

    it('should successfully remove bot\'s reaction from a message', async () => {
      const result = await removeReactionHandler(validArgs, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('123');
      expect(mockChannel.messages.fetch).toHaveBeenCalledWith('456');
      expect(mockReaction.users.remove).toHaveBeenCalledWith('bot-user-id');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully removed bot\'s reaction 👍 from message ID: 456' }]
      });
    });

    it('should successfully remove a specific user\'s reaction from a message', async () => {
      const argsWithUserId = {
        ...validArgs,
        userId: '789'
      };

      const result = await removeReactionHandler(argsWithUserId, context);

      expect(mockReaction.users.remove).toHaveBeenCalledWith('789');
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully removed reaction 👍 from user ID: 789 on message ID: 456' }]
      });
    });

    it('should return error if client is not ready', async () => {
      mockClient.isReady.mockReturnValue(false);

      const result = await removeReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Discord client not logged in.' }],
        isError: true
      });
    });

    it('should return error if channel is not found', async () => {
      mockClient.channels.fetch.mockResolvedValue(null);

      const result = await removeReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find text channel with ID: 123' }],
        isError: true
      });
    });

    it('should return error if message is not found', async () => {
      mockChannel.messages.fetch.mockResolvedValue(null);

      const result = await removeReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find message with ID: 456' }],
        isError: true
      });
    });

    it('should return error if reaction is not found', async () => {
      // Mock find to return undefined to simulate no matching reaction
      mockReactionsCache.find = jest.fn().mockReturnValue(undefined);

      const result = await removeReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Reaction 👍 not found on message ID: 456' }],
        isError: true
      });
    });

    it('should handle Discord errors gracefully', async () => {
      const error = new Error('Test Discord error');
      mockReaction.users.remove.mockRejectedValue(error);

      const result = await removeReactionHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Test Discord error' }],
        isError: true
      });
    });

    it('should validate input with RemoveReactionSchema', () => {
      expect(() => RemoveReactionSchema.parse(validArgs)).not.toThrow();
      expect(() => RemoveReactionSchema.parse({})).toThrow();
      expect(() => RemoveReactionSchema.parse({ channelId: '123' })).toThrow();
    });
  });

  describe('deleteMessageHandler', () => {
    const validArgs = {
      channelId: '123',
      messageId: '456'
    };

    it('should successfully delete a message', async () => {
      const result = await deleteMessageHandler(validArgs, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith('123');
      expect(mockChannel.messages.fetch).toHaveBeenCalledWith('456');
      expect(mockMessage.delete).toHaveBeenCalled();
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully deleted message with ID: 456 from channel: 123' }]
      });
    });

    it('should successfully delete a message with a reason', async () => {
      const argsWithReason = {
        ...validArgs,
        reason: 'Spam'
      };

      const result = await deleteMessageHandler(argsWithReason, context);

      expect(mockMessage.delete).toHaveBeenCalled();
      expect(result).toEqual({
        content: [{ type: 'text', text: 'Successfully deleted message with ID: 456 from channel: 123' }]
      });
    });

    it('should return error if client is not ready', async () => {
      mockClient.isReady.mockReturnValue(false);

      const result = await deleteMessageHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Discord client not logged in.' }],
        isError: true
      });
    });

    it('should return error if channel is not found', async () => {
      mockClient.channels.fetch.mockResolvedValue(null);

      const result = await deleteMessageHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find text channel with ID: 123' }],
        isError: true
      });
    });

    it('should return error if channel is not text-based', async () => {
      const voiceChannel = {
        isTextBased: () => false
      };
      mockClient.channels.fetch.mockResolvedValue(voiceChannel);

      const result = await deleteMessageHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find text channel with ID: 123' }],
        isError: true
      });
    });

    it('should return error if message is not found', async () => {
      mockChannel.messages.fetch.mockResolvedValue(null);

      const result = await deleteMessageHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Cannot find message with ID: 456' }],
        isError: true
      });
    });

    it('should handle Discord errors gracefully', async () => {
      const error = new Error('Test Discord error');
      mockMessage.delete.mockRejectedValue(error);

      const result = await deleteMessageHandler(validArgs, context);

      expect(result).toEqual({
        content: [{ type: 'text', text: 'Error: Test Discord error' }],
        isError: true
      });
    });

    it('should validate input with DeleteMessageSchema', () => {
      expect(() => DeleteMessageSchema.parse(validArgs)).not.toThrow();
      expect(() => DeleteMessageSchema.parse({})).toThrow();
      expect(() => DeleteMessageSchema.parse({ channelId: '123' })).toThrow();
    });
  });
});