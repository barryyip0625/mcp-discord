import { 
  createCategoryHandler, 
  editCategoryHandler, 
  deleteCategoryHandler, 
  createTextChannelHandler, 
  deleteChannelHandler, 
  readMessagesHandler 
} from './channel.js';
import { ChannelType } from 'discord.js';

// Mock the errorHandler module since it's used in the channel module
jest.mock('../errorHandler', () => ({
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: "text", text: `An unexpected error occurred: ${error.message}` }],
    isError: true
  }))
}));

// Create mock objects outside the mock function to avoid initialization issues
const mockGuild = {
  channels: {
    create: jest.fn(),
  },
  id: 'guildId',
};

const mockCategoryChannel = {
  id: 'categoryId',
  type: ChannelType.GuildCategory,
  edit: jest.fn(),
  delete: jest.fn(),
};

const mockTextChannel = {
  id: 'textChannelId',
  type: ChannelType.GuildText,
  delete: jest.fn(),
  isTextBased: () => true,
  messages: {
    fetch: jest.fn(),
  },
};

const mockNonTextChannel = {
  id: 'nonTextChannelId',
  type: ChannelType.GuildVoice,
  isTextBased: () => false,
};

const mockMessage = {
  id: 'messageId',
  content: 'Test message content',
  author: {
    id: 'authorId',
    username: 'TestUser',
    bot: false,
  },
  createdAt: new Date('2023-09-01T12:00:00Z'),
  attachments: { size: 0 },
  embeds: [],
  reference: null,
};

// Mock the Discord.js module
jest.mock('discord.js', () => {
  const actualDiscordJs = jest.requireActual('discord.js');
  
  const mockClient = {
    isReady: jest.fn(),
    guilds: {
      fetch: jest.fn(),
    },
    channels: {
      fetch: jest.fn(),
    },
  };

  return {
    ...actualDiscordJs,
    Client: jest.fn(() => mockClient),
    Guild: jest.fn(() => mockGuild),
    TextChannel: jest.fn(() => mockTextChannel),
    CategoryChannel: jest.fn(() => mockCategoryChannel),
    VoiceChannel: jest.fn(() => mockNonTextChannel),
  };
});

describe('Channel Handlers', () => {
  let mockContext = {} as any;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock the Discord.js client
    const mockClient = {
      isReady: jest.fn(),
      guilds: {
        fetch: jest.fn(),
      },
      channels: {
        fetch: jest.fn(),
      },
    };

    // Setup default context
    mockContext = {
      client: mockClient,
    };
  });

  describe('createCategoryHandler', () => {
    it('should create a category successfully', async () => {
      const args = {
        guildId: 'guildId',
        name: 'New Category',
        position: 1,
        reason: 'Test creation'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.guilds.fetch.mockResolvedValue(mockGuild);
      mockGuild.channels.create.mockResolvedValue(mockCategoryChannel);

      const result = await createCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully created category "New Category" with ID: categoryId' }]
      });
      expect(mockGuild.channels.create).toHaveBeenCalledWith({
        name: 'New Category',
        type: ChannelType.GuildCategory,
        position: 1,
        reason: 'Test creation'
      });
    });

    it('should return error if client is not ready', async () => {
      const args = {
        guildId: 'guildId',
        name: 'New Category',
        position: 1,
        reason: 'Test creation'
      };

      mockContext.client.isReady.mockReturnValue(false);

      const result = await createCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if guild is not found', async () => {
      const args = {
        guildId: 'nonexistentGuildId',
        name: 'New Category',
        position: 1,
        reason: 'Test creation'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.guilds.fetch.mockResolvedValue(null);

      const result = await createCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find guild with ID: nonexistentGuildId' }],
        isError: true
      });
    });

    it('should handle Discord errors', async () => {
      const args = {
        guildId: 'guildId',
        name: 'New Category',
        position: 1,
        reason: 'Test creation'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.guilds.fetch.mockResolvedValue(mockGuild);
      mockGuild.channels.create.mockRejectedValue(new Error('Discord API error'));

      const result = await createCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "An unexpected error occurred: Discord API error" }],
        isError: true
      });
    });
  });

  describe('editCategoryHandler', () => {
    it('should edit a category successfully', async () => {
      const args = {
        categoryId: 'categoryId',
        name: 'Updated Category Name',
        position: 2,
        reason: 'Test update'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockCategoryChannel);

      const result = await editCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully edited category with ID: categoryId' }]
      });
      expect(mockCategoryChannel.edit).toHaveBeenCalledWith({
        name: 'Updated Category Name',
        position: 2,
        reason: 'Test update'
      });
    });

    it('should return error if client is not ready', async () => {
      const args = {
        categoryId: 'categoryId',
        name: 'Updated Category Name',
        position: 2,
        reason: 'Test update'
      };

      mockContext.client.isReady.mockReturnValue(false);

      const result = await editCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if category is not found', async () => {
      const args = {
        categoryId: 'nonexistentCategoryId',
        name: 'Updated Category Name',
        position: 2,
        reason: 'Test update'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(null);

      const result = await editCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find category with ID: nonexistentCategoryId' }],
        isError: true
      });
    });

    it('should return error if channel is not a category', async () => {
      const args = {
        categoryId: 'voiceChannelId',
        name: 'Updated Category Name',
        position: 2,
        reason: 'Test update'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel); // Text channel, not category

      const result = await editCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find category with ID: voiceChannelId' }],
        isError: true
      });
    });

    it('should handle Discord errors', async () => {
      const args = {
        categoryId: 'categoryId',
        name: 'Updated Category Name',
        position: 2,
        reason: 'Test update'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockCategoryChannel);
      mockCategoryChannel.edit.mockRejectedValue(new Error('Discord API error'));

      const result = await editCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "An unexpected error occurred: Discord API error" }],
        isError: true
      });
    });
  });

  describe('deleteCategoryHandler', () => {
    it('should delete a category successfully', async () => {
      const args = {
        categoryId: 'categoryId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockCategoryChannel);

      const result = await deleteCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully deleted category with ID: categoryId' }]
      });
      expect(mockCategoryChannel.delete).toHaveBeenCalledWith('Test deletion');
    });

    it('should delete a category with default reason if none provided', async () => {
      const args = {
        categoryId: 'categoryId'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockCategoryChannel);

      const result = await deleteCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully deleted category with ID: categoryId' }]
      });
      expect(mockCategoryChannel.delete).toHaveBeenCalledWith('Category deleted via API');
    });

    it('should return error if client is not ready', async () => {
      const args = {
        categoryId: 'categoryId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(false);

      const result = await deleteCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if category is not found', async () => {
      const args = {
        categoryId: 'nonexistentCategoryId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(null);

      const result = await deleteCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find category with ID: nonexistentCategoryId' }],
        isError: true
      });
    });

    it('should return error if channel is not a category', async () => {
      const args = {
        categoryId: 'textChannelId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel); // Text channel, not category

      const result = await deleteCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find category with ID: textChannelId' }],
        isError: true
      });
    });

    it('should handle Discord errors', async () => {
      const args = {
        categoryId: 'categoryId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockCategoryChannel);
      mockCategoryChannel.delete.mockRejectedValue(new Error('Discord API error'));

      const result = await deleteCategoryHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "An unexpected error occurred: Discord API error" }],
        isError: true
      });
    });
  });

  describe('createTextChannelHandler', () => {
    it('should create a text channel successfully', async () => {
      const args = {
        guildId: 'guildId',
        channelName: 'New Text Channel',
        topic: 'This is a test channel',
        reason: 'Test creation'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.guilds.fetch.mockResolvedValue(mockGuild);
      mockGuild.channels.create.mockResolvedValue(mockTextChannel);

      const result = await createTextChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully created text channel "New Text Channel" with ID: textChannelId' }]
      });
      expect(mockGuild.channels.create).toHaveBeenCalledWith({
        name: 'New Text Channel',
        type: ChannelType.GuildText,
        topic: 'This is a test channel',
        reason: 'Test creation'
      });
    });

    it('should create a text channel without optional fields', async () => {
      const args = {
        guildId: 'guildId',
        channelName: 'New Text Channel'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.guilds.fetch.mockResolvedValue(mockGuild);
      mockGuild.channels.create.mockResolvedValue(mockTextChannel);

      const result = await createTextChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully created text channel "New Text Channel" with ID: textChannelId' }]
      });
      expect(mockGuild.channels.create).toHaveBeenCalledWith({
        name: 'New Text Channel',
        type: ChannelType.GuildText
      });
    });

    it('should return error if client is not ready', async () => {
      const args = {
        guildId: 'guildId',
        channelName: 'New Text Channel'
      };

      mockContext.client.isReady.mockReturnValue(false);

      const result = await createTextChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if guild is not found', async () => {
      const args = {
        guildId: 'nonexistentGuildId',
        channelName: 'New Text Channel'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.guilds.fetch.mockResolvedValue(null);

      const result = await createTextChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find guild with ID: nonexistentGuildId' }],
        isError: true
      });
    });

    it('should handle Discord errors', async () => {
      const args = {
        guildId: 'guildId',
        channelName: 'New Text Channel'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.guilds.fetch.mockResolvedValue(mockGuild);
      mockGuild.channels.create.mockRejectedValue(new Error('Discord API error'));

      const result = await createTextChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "An unexpected error occurred: Discord API error" }],
        isError: true
      });
    });
  });

  describe('deleteChannelHandler', () => {
    it('should delete a channel successfully', async () => {
      const args = {
        channelId: 'textChannelId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel);

      const result = await deleteChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully deleted channel with ID: textChannelId' }]
      });
      expect(mockTextChannel.delete).toHaveBeenCalledWith('Test deletion');
    });

    it('should delete a channel with default reason if none provided', async () => {
      const args = {
        channelId: 'textChannelId'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel);

      const result = await deleteChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully deleted channel with ID: textChannelId' }]
      });
      expect(mockTextChannel.delete).toHaveBeenCalledWith('Channel deleted via API');
    });

    it('should return error if client is not ready', async () => {
      const args = {
        channelId: 'textChannelId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(false);

      const result = await deleteChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if channel is not found', async () => {
      const args = {
        channelId: 'nonexistentChannelId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(null);

      const result = await deleteChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find channel with ID: nonexistentChannelId' }],
        isError: true
      });
    });

    it('should return error if channel does not support deletion', async () => {
      const nonDeletableChannel = {
        id: 'someChannelId',
        isTextBased: () => true,
        messages: {
          fetch: jest.fn(),
        },
        // Does not have delete method
      };
      
      const args = {
        channelId: 'someChannelId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(nonDeletableChannel);

      const result = await deleteChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'This channel type does not support deletion or the bot lacks permissions' }],
        isError: true
      });
    });

    it('should handle Discord errors', async () => {
      const args = {
        channelId: 'textChannelId',
        reason: 'Test deletion'
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel);
      mockTextChannel.delete.mockRejectedValue(new Error('Discord API error'));

      const result = await deleteChannelHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "An unexpected error occurred: Discord API error" }],
        isError: true
      });
    });
  });

  describe('readMessagesHandler', () => {
    it('should read messages successfully', async () => {
      const mockMessageWithAttachment = { ...mockMessage, id: 'messageId2', attachments: { size: 2 }, embeds: [], reference: null };
      const mockMessagesCollection = new Map([
        ['messageId', mockMessage],
        ['messageId2', mockMessageWithAttachment]
      ]);

      // Mock the map method for the collection
      Object.defineProperty(mockMessagesCollection, 'map', {
        value: (fn: (value: any) => any) => Array.from(mockMessagesCollection.values()).map(fn),
        writable: true,
        configurable: true
      });

      const args = {
        channelId: 'textChannelId',
        limit: 10
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel);
      mockTextChannel.messages.fetch.mockResolvedValue(mockMessagesCollection);

      const result = await readMessagesHandler(args, mockContext);

      expect(result.content[0].text).toContain('messageCount');
      expect(JSON.parse(result.content[0].text)).toHaveProperty('messages');
      expect(JSON.parse(result.content[0].text).messages).toHaveLength(2);
      expect(mockTextChannel.messages.fetch).toHaveBeenCalledWith({ limit: 10 });
    });

    it('should return error if client is not ready', async () => {
      const args = {
        channelId: 'textChannelId',
        limit: 10
      };

      mockContext.client.isReady.mockReturnValue(false);

      const result = await readMessagesHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it('should return error if channel is not found', async () => {
      const args = {
        channelId: 'nonexistentChannelId',
        limit: 10
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(null);

      const result = await readMessagesHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Cannot find channel with ID: nonexistentChannelId' }],
        isError: true
      });
    });

    it('should return error if channel does not support reading messages', async () => {
      const args = {
        channelId: 'nonTextChannelId',
        limit: 10
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockNonTextChannel);

      const result = await readMessagesHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'Channel type does not support reading messages' }],
        isError: true
      });
    });

    it('should return message when no messages found', async () => {
      const emptyMessagesCollection = new Map();
      // Mock the map method for the collection
      Object.defineProperty(emptyMessagesCollection, 'map', {
        value: (fn: (value: any) => any) => Array.from(emptyMessagesCollection.values()).map(fn),
        writable: true,
        configurable: true
      });

      const args = {
        channelId: 'textChannelId',
        limit: 10
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel);
      mockTextChannel.messages.fetch.mockResolvedValue(emptyMessagesCollection);

      const result = await readMessagesHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: 'No messages found in channel' }]
      });
    });

    it('should handle Discord errors', async () => {
      const args = {
        channelId: 'textChannelId',
        limit: 10
      };

      mockContext.client.isReady.mockReturnValue(true);
      mockContext.client.channels.fetch.mockResolvedValue(mockTextChannel);
      mockTextChannel.messages.fetch.mockRejectedValue(new Error('Discord API error'));

      const result = await readMessagesHandler(args, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "An unexpected error occurred: Discord API error" }],
        isError: true
      });
    });
  });
});