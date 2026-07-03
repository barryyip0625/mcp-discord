jest.mock('../errorHandler.js');

import { 
  getForumChannelsHandler, 
  createForumPostHandler, 
  getForumPostHandler, 
  replyToForumHandler, 
  deleteForumPostHandler 
} from './forum.js';
import { 
  GetForumChannelsSchema, 
  CreateForumPostSchema, 
  GetForumPostSchema, 
  ReplyToForumSchema, 
  DeleteForumPostSchema 
} from '../schemas.js';
import { ChannelType, Client } from 'discord.js';
import { handleDiscordError } from '../errorHandler.js';

// Mock discord.js
const createMockCollectionWithFilter = (items: Array<any>) => {
  const collection = new Map();
  items.forEach(item => {
    if (item && item.id) {
      collection.set(item.id, item);
    }
  });

  // Add a filter method that behaves like Discord Collection
  (collection as any).filter = (predicate: (value: any, key: any, collection: any) => boolean) => {
    const filtered = new Map();
    for (const [key, value] of collection.entries()) {
      if (predicate(value, key, collection)) {
        filtered.set(key, value);
      }
    }
    // The filtered result should also have a map method since forum.ts calls .map() on it
    (filtered as any).map = (mapper: (value: any, key: any) => any) => {
      const result = [];
      for (const [key, value] of filtered.entries()) {
        result.push(mapper(value, key));
      }
      return result;
    };
    return filtered;
  };
  
  // Add map method to the main collection too
  (collection as any).map = (mapper: (value: any, key: any) => any) => {
    const result = [];
    for (const [key, value] of collection.entries()) {
      result.push(mapper(value, key));
    }
    return result;
  };

  return collection;
};

// Define the mock objects
const mockGuild = {
  id: 'guild123',
  name: 'Test Guild',
  channels: {
    fetch: jest.fn()
  }
};

const mockForumChannel = {
  id: 'forum123',
  name: 'General Forum',
  topic: 'General discussion',
  type: ChannelType.GuildForum,
  availableTags: [
    { id: 'tag1', name: 'help' },
    { id: 'tag2', name: 'discussion' }
  ],
  threads: {
    create: jest.fn()
  }
};

const mockNonForumChannel = {
  id: 'text123',
  name: 'General Chat',
  topic: undefined,
  type: ChannelType.GuildText
};

const mockMessage = {
  id: 'message123',
  content: 'Test message content',
  author: { tag: 'TestUser#1234' },
  createdAt: new Date()
};

const mockThread = {
  id: 'thread123',
  name: 'Test Thread',
  isThread: () => true,
  parentId: 'forum123',
  messages: {
    fetch: jest.fn()
  },
  send: jest.fn(),
  delete: jest.fn()
};

// Define the mock client managers
const mockGuildsManager = {
  fetch: jest.fn()
};

const mockChannelsManager = {
  fetch: jest.fn()
};

// Create a proper mock client using jest
const mockClient = {
  isReady: jest.fn(() => true),
  guilds: mockGuildsManager,
  channels: mockChannelsManager
} as any;

const mockContext = { client: mockClient };

// TypeScript type for the mocked function
const mockedHandleDiscordError = handleDiscordError as jest.MockedFunction<typeof handleDiscordError>;

describe('getForumChannelsHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default behavior
    mockClient.isReady.mockReturnValue(true);
  });

  it('should return error if client is not ready', async () => {
    mockClient.isReady.mockReturnValue(false);

    const result = await getForumChannelsHandler({ guildId: 'guild123' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Discord client not logged in." }],
      isError: true
    });
  });

  it('should return error if guild cannot be found', async () => {
    mockClient.isReady.mockReturnValue(true);

    // Mock the guild fetch to throw an error
    mockedHandleDiscordError.mockReturnValueOnce({
      content: [{ type: "text", text: "Cannot find guild with ID: nonexistent" }],
      isError: true
    });
    mockClient.guilds.fetch.mockRejectedValue(new Error());

    const result = await getForumChannelsHandler({ guildId: 'nonexistent' }, mockContext);

    expect(mockClient.guilds.fetch).toHaveBeenCalledWith('nonexistent');
    expect(mockedHandleDiscordError).toHaveBeenCalled();
  });

  it('should return error if no forum channels are found', async () => {
    mockClient.isReady.mockReturnValue(true);

    // Create a collection with no forum channels
    const mockChannels = createMockCollectionWithFilter([mockNonForumChannel]);
    mockGuild.channels.fetch.mockResolvedValue(mockChannels);
    mockClient.guilds.fetch.mockResolvedValue(mockGuild);

    const result = await getForumChannelsHandler({ guildId: 'guild123' }, mockContext);

    expect(result.content[0].text).toContain('No forum channels found in guild: Test Guild');
  });

  it('should return forum channels with their details', async () => {
    // Ensure error handler is not called during success path
    mockedHandleDiscordError.mockImplementation((error) => {
      // Fail the test if error handler is called unexpectedly
      throw new Error(`Unexpected error handler call: ${error.message}`);
    });

    mockClient.isReady.mockReturnValue(true);

    // Create a collection with a forum channel
    const mockChannels = createMockCollectionWithFilter([mockForumChannel, mockNonForumChannel]);
    mockGuild.channels.fetch.mockResolvedValue(mockChannels);
    mockClient.guilds.fetch.mockResolvedValue(mockGuild);

    const result = await getForumChannelsHandler({ guildId: 'guild123' }, mockContext);

    // Verify that error handler was not called
    expect(mockedHandleDiscordError).not.toHaveBeenCalled();
    
    expect(result.content[0].type).toBe('text');

    // Parse the result and check the content
    const parsedResult = JSON.parse(result.content[0].text);
    expect(Array.isArray(parsedResult)).toBe(true);
    expect(parsedResult[0]).toEqual({
      id: 'forum123',
      name: 'General Forum',
      topic: 'General discussion'
    });
  });
});

describe('createForumPostHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default behavior
    mockClient.isReady.mockReturnValue(true);
  });

  it('should return error if client is not ready', async () => {
    mockClient.isReady.mockReturnValue(false);

    const result = await createForumPostHandler(
      { 
        forumChannelId: 'forum123', 
        title: 'Test Post', 
        content: 'Test content' 
      }, 
      mockContext
    );

    expect(result).toEqual({
      content: [{ type: "text", text: "Discord client not logged in." }],
      isError: true
    });
  });

  it('should return error if channel is not a forum channel', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue({ type: ChannelType.GuildText }); // Not a forum

    const result = await createForumPostHandler(
      { 
        forumChannelId: 'forum123', 
        title: 'Test Post', 
        content: 'Test content' 
      }, 
      mockContext
    );

    expect(result).toEqual({
      content: [{ type: "text", text: "Channel ID forum123 is not a forum channel." }],
      isError: true
    });
  });

  it('should create a forum post successfully', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockForumChannel);
    mockForumChannel.threads.create.mockResolvedValue(mockThread);

    const result = await createForumPostHandler(
      { 
        forumChannelId: 'forum123', 
        title: 'Test Post', 
        content: 'Test content' 
      }, 
      mockContext
    );

    expect(mockForumChannel.threads.create).toHaveBeenCalledWith({
      name: 'Test Post',
      message: { content: 'Test content' },
      appliedTags: undefined
    });
    expect(result.content[0].text).toBe('Successfully created forum post "Test Post" with ID: thread123');
  });

  it('should create a forum post with tags', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockForumChannel);
    mockForumChannel.threads.create.mockResolvedValue(mockThread);

    const result = await createForumPostHandler(
      { 
        forumChannelId: 'forum123', 
        title: 'Test Post', 
        content: 'Test content',
        tags: ['help', 'discussion']
      }, 
      mockContext
    );

    expect(mockForumChannel.threads.create).toHaveBeenCalledWith({
      name: 'Test Post',
      message: { content: 'Test content' },
      appliedTags: ['tag1', 'tag2']
    });
    expect(result.content[0].text).toBe('Successfully created forum post "Test Post" with ID: thread123');
  });
});

describe('getForumPostHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default behavior
    mockClient.isReady.mockReturnValue(true);
  });

  it('should return error if client is not ready', async () => {
    mockClient.isReady.mockReturnValue(false);

    const result = await getForumPostHandler({ threadId: 'thread123' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Discord client not logged in." }],
      isError: true
    });
  });

  it('should return error if thread is not found', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(null);

    const result = await getForumPostHandler({ threadId: 'thread123' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Cannot find thread with ID: thread123" }],
      isError: true
    });
  });

  it('should return error if thread is not actually a thread', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue({ isThread: () => false });

    const result = await getForumPostHandler({ threadId: 'thread123' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Cannot find thread with ID: thread123" }],
      isError: true
    });
  });

  it('should return forum post details', async () => {
    // Ensure error handler is not called during success path
    mockedHandleDiscordError.mockImplementation((error) => {
      // Fail the test if error handler is called unexpectedly
      throw new Error(`Unexpected error handler call: ${error.message}`);
    });

    mockClient.isReady.mockReturnValue(true);
    const mockMessages = new Map();
    mockMessages.set('message123', mockMessage);
    // Add a map method to simulate Discord Collection behavior
    (mockMessages as any).map = (fn: (value: any, key: any) => any) => Array.from(mockMessages.values()).map((value, index) => fn(value, Array.from(mockMessages.keys())[index]));
    mockThread.messages.fetch.mockResolvedValue(mockMessages);

    mockClient.channels.fetch.mockResolvedValue(mockThread);

    const result = await getForumPostHandler({ threadId: 'thread123' }, mockContext);

    // Verify that error handler was not called
    expect(mockedHandleDiscordError).not.toHaveBeenCalled();

    expect(mockThread.messages.fetch).toHaveBeenCalledWith({ limit: 10 });
    const parsedResult = JSON.parse(result.content[0].text);
    expect(parsedResult.id).toBe('thread123');
    expect(parsedResult.name).toBe('Test Thread');
    expect(parsedResult.parentId).toBe('forum123'); // Check for parent ID too
    expect(parsedResult.messageCount).toBe(1);
    expect(parsedResult.messages[0].id).toBe('message123');
    expect(parsedResult.messages[0].content).toBe('Test message content');
    expect(parsedResult.messages[0].author).toBe('TestUser#1234');
  });
});

describe('replyToForumHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default behavior
    mockClient.isReady.mockReturnValue(true);
  });

  it('should return error if client is not ready', async () => {
    mockClient.isReady.mockReturnValue(false);

    const result = await replyToForumHandler({ threadId: 'thread123', message: 'Reply message' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Discord client not logged in." }],
      isError: true
    });
  });

  it('should return error if thread is not found', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(null);

    const result = await replyToForumHandler({ threadId: 'thread123', message: 'Reply message' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Cannot find thread with ID: thread123" }],
      isError: true
    });
  });

  it('should return error if thread does not support sending messages', async () => {
    mockClient.isReady.mockReturnValue(true);
    // Create an object without the send property to trigger the check
    const threadWithoutSend = { isThread: () => true };
    mockClient.channels.fetch.mockResolvedValue(threadWithoutSend);

    const result = await replyToForumHandler({ threadId: 'thread123', message: 'Reply message' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "This thread does not support sending messages" }],
      isError: true
    });
  });

  it('should send a reply to the forum thread', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockThread);
    mockThread.send.mockResolvedValue(mockMessage);

    const result = await replyToForumHandler({ threadId: 'thread123', message: 'Reply message' }, mockContext);

    expect(mockThread.send).toHaveBeenCalledWith('Reply message');
    expect(result.content[0].text).toBe('Successfully replied to forum post. Message ID: message123');
  });
});

describe('deleteForumPostHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock to default behavior
    mockClient.isReady.mockReturnValue(true);
  });

  it('should return error if client is not ready', async () => {
    mockClient.isReady.mockReturnValue(false);

    const result = await deleteForumPostHandler({ threadId: 'thread123' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Discord client not logged in." }],
      isError: true
    });
  });

  it('should return error if forum post cannot be found', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(null);

    const result = await deleteForumPostHandler({ threadId: 'thread123' }, mockContext);

    expect(result).toEqual({
      content: [{ type: "text", text: "Cannot find forum post/thread with ID: thread123" }],
      isError: true
    });
  });

  it('should delete a forum post successfully', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockThread);

    const result = await deleteForumPostHandler({ threadId: 'thread123' }, mockContext);

    expect(mockThread.delete).toHaveBeenCalledWith('Forum post deleted via API');
    expect(result.content[0].text).toBe('Successfully deleted forum post/thread with ID: thread123');
  });

  it('should delete a forum post with a custom reason', async () => {
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockThread);

    const result = await deleteForumPostHandler({ 
      threadId: 'thread123', 
      reason: 'Spam content' 
    }, mockContext);

    expect(mockThread.delete).toHaveBeenCalledWith('Spam content');
    expect(result.content[0].text).toBe('Successfully deleted forum post/thread with ID: thread123');
  });
});