import {
  pinMessageHandler,
  unpinMessageHandler,
  listPinnedMessagesHandler
} from './pins.js';
import { ToolContext } from './types.js';

// Mock the errorHandler module
jest.mock('../errorHandler', () => ({
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
    isError: true
  }))
}));

describe('pins', () => {
  let mockClient: any;
  let mockChannel: any;
  let mockMessage: any;
  let context: ToolContext;

  beforeEach(() => {
    mockMessage = {
      id: 'message123',
      pinned: false,
      pin: jest.fn(),
      unpin: jest.fn()
    };

    mockChannel = {
      isTextBased: () => true,
      messages: {
        fetch: jest.fn(),
        fetchPins: jest.fn()
      }
    };

    mockClient = {
      isReady: jest.fn(() => true),
      channels: {
        fetch: jest.fn()
      }
    };

    context = { client: mockClient };

    mockClient.channels.fetch.mockResolvedValue(mockChannel);
    mockChannel.messages.fetch.mockResolvedValue(mockMessage);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('pinMessageHandler', () => {
    test('pins an unpinned message', async () => {
      const result = await pinMessageHandler(
        { channelId: 'channel123', messageId: 'message123' },
        context
      );

      expect(mockMessage.pin).toHaveBeenCalledWith(undefined);
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Successfully pinned message message123');
    });

    test('passes the audit log reason through', async () => {
      await pinMessageHandler(
        { channelId: 'channel123', messageId: 'message123', reason: 'important' },
        context
      );

      expect(mockMessage.pin).toHaveBeenCalledWith('important');
    });

    test('is a no-op when the message is already pinned', async () => {
      mockMessage.pinned = true;

      const result = await pinMessageHandler(
        { channelId: 'channel123', messageId: 'message123' },
        context
      );

      expect(mockMessage.pin).not.toHaveBeenCalled();
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('already pinned');
    });

    test('errors when the client is not logged in', async () => {
      mockClient.isReady.mockReturnValue(false);

      const result = await pinMessageHandler(
        { channelId: 'channel123', messageId: 'message123' },
        context
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not logged in');
    });

    test('errors when the channel is not text based', async () => {
      mockClient.channels.fetch.mockResolvedValue({ isTextBased: () => false });

      const result = await pinMessageHandler(
        { channelId: 'channel123', messageId: 'message123' },
        context
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Cannot find text channel');
    });

    test('delegates thrown errors to the Discord error handler', async () => {
      mockMessage.pin.mockRejectedValue(new Error('Missing Permissions'));

      const result = await pinMessageHandler(
        { channelId: 'channel123', messageId: 'message123' },
        context
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Missing Permissions');
    });
  });

  describe('unpinMessageHandler', () => {
    test('unpins a pinned message', async () => {
      mockMessage.pinned = true;

      const result = await unpinMessageHandler(
        { channelId: 'channel123', messageId: 'message123', reason: 'stale' },
        context
      );

      expect(mockMessage.unpin).toHaveBeenCalledWith('stale');
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Successfully unpinned message message123');
    });

    test('is a no-op when the message is not pinned', async () => {
      const result = await unpinMessageHandler(
        { channelId: 'channel123', messageId: 'message123' },
        context
      );

      expect(mockMessage.unpin).not.toHaveBeenCalled();
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('is not pinned');
    });

    test('errors when the client is not logged in', async () => {
      mockClient.isReady.mockReturnValue(false);

      const result = await unpinMessageHandler(
        { channelId: 'channel123', messageId: 'message123' },
        context
      );

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not logged in');
    });
  });

  describe('listPinnedMessagesHandler', () => {
    const pinnedAt = new Date('2025-01-02T03:04:05Z');
    const createdAt = new Date('2025-01-01T00:00:00Z');

    beforeEach(() => {
      mockChannel.messages.fetchPins.mockResolvedValue({
        hasMore: false,
        items: [
          {
            pinnedAt,
            pinnedTimestamp: pinnedAt.getTime(),
            message: {
              id: 'message123',
              content: 'Read the rules',
              author: { id: 'user123', tag: 'user#0001' },
              createdAt
            }
          }
        ]
      });
    });

    test('lists pinned messages with their pin timestamps', async () => {
      const result = await listPinnedMessagesHandler({ channelId: 'channel123' }, context);

      expect(mockChannel.messages.fetchPins).toHaveBeenCalledWith({ limit: 50 });
      expect(result.isError).toBeUndefined();

      const payload = JSON.parse(result.content[0].text);
      expect(payload.channelId).toBe('channel123');
      expect(payload.totalPinned).toBe(1);
      expect(payload.hasMore).toBe(false);
      expect(payload.pinnedMessages[0]).toMatchObject({
        id: 'message123',
        content: 'Read the rules',
        author: 'user#0001',
        authorId: 'user123'
      });
      expect(payload.pinnedMessages[0].pinnedAt).toBe(pinnedAt.toISOString());
    });

    test('forwards an explicit limit', async () => {
      await listPinnedMessagesHandler({ channelId: 'channel123', limit: 5 }, context);

      expect(mockChannel.messages.fetchPins).toHaveBeenCalledWith({ limit: 5 });
    });

    test('rejects a limit outside the Discord maximum', async () => {
      await expect(
        listPinnedMessagesHandler({ channelId: 'channel123', limit: 51 }, context)
      ).rejects.toThrow();
    });

    test('errors when the channel is not text based', async () => {
      mockClient.channels.fetch.mockResolvedValue({ isTextBased: () => false });

      const result = await listPinnedMessagesHandler({ channelId: 'channel123' }, context);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Cannot find text channel');
    });
  });
});
