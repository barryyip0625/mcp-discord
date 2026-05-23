import { ChannelType } from "discord.js";
import { 
  createCategoryHandler,
  editCategoryHandler,
  deleteCategoryHandler,
  createTextChannelHandler,
  deleteChannelHandler,
  readMessagesHandler
} from "./channel.js";
import { ToolContext } from "./types.js";

// Mock Discord.js client and related objects
const createMockClient = (isReady: boolean) => {
  return {
    isReady: jest.fn(() => isReady),
    guilds: {
      fetch: jest.fn(),
    },
    channels: {
      fetch: jest.fn(),
    },
  } as unknown as any;
};

const createMockGuild = (id: string, name: string) => ({
  id,
  name,
  channels: {
    create: jest.fn(),
  },
});

const createMockCategory = (id: string, name: string) => ({
  id,
  name,
  type: ChannelType.GuildCategory,
  edit: jest.fn(),
  delete: jest.fn(),
});

const createMockChannel = (id: string, name: string, type: ChannelType = ChannelType.GuildText) => ({
  id,
  name,
  type,
  isTextBased: () => true,
  delete: jest.fn(),
  messages: {
    fetch: jest.fn(),
  },
});

const createMockMessage = (id: string, content: string, authorId: string, authorUsername: string) => ({
  id,
  content,
  createdAt: new Date(),
  author: {
    id: authorId,
    username: authorUsername,
    bot: false,
  },
  reference: null,
  attachments: { size: 0 },
  embeds: [],
});

// Mock the errorHandler module since it's used in the channel module
jest.mock("../errorHandler", () => ({
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: "text", text: `An unexpected error occurred: ${error.message || error}` }],
    isError: true
  }))
}));

describe("Channel Tool Handlers", () => {
  let context: ToolContext;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCategoryHandler", () => {
    test("should return error when client is not ready", async () => {
      context = { client: createMockClient(false) } as ToolContext;
      const args = {
        guildId: "123456789",
        name: "Test Category",
      };

      const result = await createCategoryHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true,
      });
    });

    test("should return error when guild is not found", async () => {
      const mockClient = createMockClient(true);
      const mockGuildFetch = jest.fn().mockResolvedValue(null);
      mockClient.guilds.fetch = mockGuildFetch;

      context = { client: mockClient } as ToolContext;
      const args = {
        guildId: "123456789",
        name: "Test Category",
      };

      const result = await createCategoryHandler(args, context);

      expect(mockGuildFetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find guild with ID: 123456789" }],
        isError: true,
      });
    });

    test("should create category successfully", async () => {
      const mockClient = createMockClient(true);
      const mockGuild = createMockGuild("123456789", "Test Guild");
      const mockCategory = createMockCategory("987654321", "Test Category");

      jest.spyOn(mockGuild.channels, 'create').mockResolvedValue(mockCategory);
      mockClient.guilds.fetch = jest.fn().mockResolvedValue(mockGuild);

      context = { client: mockClient } as ToolContext;
      const args = {
        guildId: "123456789",
        name: "Test Category",
      };

      const result = await createCategoryHandler(args, context);

      expect(mockGuild.channels.create).toHaveBeenCalledWith({
        name: "Test Category",
        type: ChannelType.GuildCategory,
      });
      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully created category "Test Category" with ID: 987654321' }],
      });
    });

    test("should create category with all options", async () => {
      const mockClient = createMockClient(true);
      const mockGuild = createMockGuild("123456789", "Test Guild");
      const mockCategory = createMockCategory("987654321", "Test Category");

      jest.spyOn(mockGuild.channels, 'create').mockResolvedValue(mockCategory);
      mockClient.guilds.fetch = jest.fn().mockResolvedValue(mockGuild);

      context = { client: mockClient } as ToolContext;
      const args = {
        guildId: "123456789",
        name: "Test Category",
        position: 1,
        reason: "Testing purposes",
      };

      const result = await createCategoryHandler(args, context);

      expect(mockGuild.channels.create).toHaveBeenCalledWith({
        name: "Test Category",
        type: ChannelType.GuildCategory,
        position: 1,
        reason: "Testing purposes",
      });
      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully created category "Test Category" with ID: 987654321' }],
      });
    });
  });

  describe("editCategoryHandler", () => {
    test("should return error when client is not ready", async () => {
      context = { client: createMockClient(false) } as ToolContext;
      const args = {
        categoryId: "123456789",
        name: "Updated Category Name",
      };

      const result = await editCategoryHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true,
      });
    });

    test("should return error when category is not found", async () => {
      const mockClient = createMockClient(true);
      mockClient.channels.fetch = jest.fn().mockResolvedValue(null);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
        name: "Updated Category Name",
      };

      const result = await editCategoryHandler(args, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find category with ID: 123456789" }],
        isError: true,
      });
    });

    test("should return error when channel is not a category", async () => {
      const mockClient = createMockClient(true);
      const mockChannel = createMockChannel("123456789", "Test Channel", ChannelType.GuildText);
      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannel);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
        name: "Updated Category Name",
      };

      const result = await editCategoryHandler(args, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find category with ID: 123456789" }],
        isError: true,
      });
    });

    test("should edit category successfully", async () => {
      const mockClient = createMockClient(true);
      const mockCategory = createMockCategory("123456789", "Old Category Name");

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockCategory);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
        name: "Updated Category Name",
      };

      const result = await editCategoryHandler(args, context);

      expect(mockCategory.edit).toHaveBeenCalledWith({
        name: "Updated Category Name",
      });
      expect(result).toEqual({
        content: [{ type: "text", text: "Successfully edited category with ID: 123456789" }],
      });
    });

    test("should edit category with all options", async () => {
      const mockClient = createMockClient(true);
      const mockCategory = createMockCategory("123456789", "Old Category Name");

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockCategory);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
        name: "Updated Category Name",
        position: 2,
        reason: "Testing purposes",
      };

      const result = await editCategoryHandler(args, context);

      expect(mockCategory.edit).toHaveBeenCalledWith({
        name: "Updated Category Name",
        position: 2,
        reason: "Testing purposes",
      });
      expect(result).toEqual({
        content: [{ type: "text", text: "Successfully edited category with ID: 123456789" }],
      });
    });
  });

  describe("deleteCategoryHandler", () => {
    test("should return error when client is not ready", async () => {
      context = { client: createMockClient(false) } as ToolContext;
      const args = {
        categoryId: "123456789",
      };

      const result = await deleteCategoryHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true,
      });
    });

    test("should return error when category is not found", async () => {
      const mockClient = createMockClient(true);
      mockClient.channels.fetch = jest.fn().mockResolvedValue(null);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
      };

      const result = await deleteCategoryHandler(args, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find category with ID: 123456789" }],
        isError: true,
      });
    });

    test("should return error when channel is not a category", async () => {
      const mockClient = createMockClient(true);
      const mockChannel = createMockChannel("123456789", "Test Channel", ChannelType.GuildText);
      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannel);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
      };

      const result = await deleteCategoryHandler(args, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find category with ID: 123456789" }],
        isError: true,
      });
    });

    test("should delete category successfully", async () => {
      const mockClient = createMockClient(true);
      const mockCategory = createMockCategory("123456789", "Test Category");

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockCategory);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
      };

      const result = await deleteCategoryHandler(args, context);

      expect(mockCategory.delete).toHaveBeenCalledWith("Category deleted via API");
      expect(result).toEqual({
        content: [{ type: "text", text: "Successfully deleted category with ID: 123456789" }],
      });
    });

    test("should delete category with custom reason", async () => {
      const mockClient = createMockClient(true);
      const mockCategory = createMockCategory("123456789", "Test Category");

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockCategory);

      context = { client: mockClient } as ToolContext;
      const args = {
        categoryId: "123456789",
        reason: "Testing purposes",
      };

      const result = await deleteCategoryHandler(args, context);

      expect(mockCategory.delete).toHaveBeenCalledWith("Testing purposes");
      expect(result).toEqual({
        content: [{ type: "text", text: "Successfully deleted category with ID: 123456789" }],
      });
    });
  });

  describe("createTextChannelHandler", () => {
    test("should return error when client is not ready", async () => {
      context = { client: createMockClient(false) } as ToolContext;
      const args = {
        guildId: "123456789",
        channelName: "test-channel",
      };

      const result = await createTextChannelHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true,
      });
    });

    test("should return error when guild is not found", async () => {
      const mockClient = createMockClient(true);
      const mockGuildFetch = jest.fn().mockResolvedValue(null);
      mockClient.guilds.fetch = mockGuildFetch;

      context = { client: mockClient } as ToolContext;
      const args = {
        guildId: "123456789",
        channelName: "test-channel",
      };

      const result = await createTextChannelHandler(args, context);

      expect(mockGuildFetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find guild with ID: 123456789" }],
        isError: true,
      });
    });

    test("should create text channel successfully", async () => {
      const mockClient = createMockClient(true);
      const mockGuild = createMockGuild("123456789", "Test Guild");
      const mockChannel = createMockChannel("987654321", "test-channel");

      jest.spyOn(mockGuild.channels, 'create').mockResolvedValue(mockChannel);
      mockClient.guilds.fetch = jest.fn().mockResolvedValue(mockGuild);

      context = { client: mockClient } as ToolContext;
      const args = {
        guildId: "123456789",
        channelName: "test-channel",
      };

      const result = await createTextChannelHandler(args, context);

      expect(mockGuild.channels.create).toHaveBeenCalledWith({
        name: "test-channel",
        type: ChannelType.GuildText,
      });
      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully created text channel "test-channel" with ID: 987654321' }],
      });
    });

    test("should create text channel with all options", async () => {
      const mockClient = createMockClient(true);
      const mockGuild = createMockGuild("123456789", "Test Guild");
      const mockChannel = createMockChannel("987654321", "test-channel");

      jest.spyOn(mockGuild.channels, 'create').mockResolvedValue(mockChannel);
      mockClient.guilds.fetch = jest.fn().mockResolvedValue(mockGuild);

      context = { client: mockClient } as ToolContext;
      const args = {
        guildId: "123456789",
        channelName: "test-channel",
        topic: "Test topic",
        reason: "Testing purposes",
      };

      const result = await createTextChannelHandler(args, context);

      expect(mockGuild.channels.create).toHaveBeenCalledWith({
        name: "test-channel",
        type: ChannelType.GuildText,
        topic: "Test topic",
        reason: "Testing purposes",
      });
      expect(result).toEqual({
        content: [{ type: "text", text: 'Successfully created text channel "test-channel" with ID: 987654321' }],
      });
    });
  });

  describe("deleteChannelHandler", () => {
    test("should return error when client is not ready", async () => {
      context = { client: createMockClient(false) } as ToolContext;
      const args = {
        channelId: "123456789",
      };

      const result = await deleteChannelHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true,
      });
    });

    test("should return error when channel is not found", async () => {
      const mockClient = createMockClient(true);
      mockClient.channels.fetch = jest.fn().mockResolvedValue(null);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
      };

      const result = await deleteChannelHandler(args, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find channel with ID: 123456789" }],
        isError: true,
      });
    });

    test("should return error when channel doesn't support deletion", async () => {
      const mockClient = createMockClient(true);
      const mockChannelWithoutDelete = {
        id: "123456789",
        // intentionally not including delete method
      };
      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannelWithoutDelete);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
      };

      const result = await deleteChannelHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "This channel type does not support deletion or the bot lacks permissions" }],
        isError: true,
      });
    });

    test("should delete channel successfully", async () => {
      const mockClient = createMockClient(true);
      const mockChannel = createMockChannel("123456789", "test-channel");

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannel);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
      };

      const result = await deleteChannelHandler(args, context);

      expect(mockChannel.delete).toHaveBeenCalledWith("Channel deleted via API");
      expect(result).toEqual({
        content: [{ type: "text", text: "Successfully deleted channel with ID: 123456789" }],
      });
    });

    test("should delete channel with custom reason", async () => {
      const mockClient = createMockClient(true);
      const mockChannel = createMockChannel("123456789", "test-channel");

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannel);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
        reason: "Testing purposes",
      };

      const result = await deleteChannelHandler(args, context);

      expect(mockChannel.delete).toHaveBeenCalledWith("Testing purposes");
      expect(result).toEqual({
        content: [{ type: "text", text: "Successfully deleted channel with ID: 123456789" }],
      });
    });
  });

  describe("readMessagesHandler", () => {
    test("should return error when client is not ready", async () => {
      context = { client: createMockClient(false) } as ToolContext;
      const args = {
        channelId: "123456789",
        limit: 10,
      };

      const result = await readMessagesHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true,
      });
    });

    test("should return error when channel is not found", async () => {
      const mockClient = createMockClient(true);
      mockClient.channels.fetch = jest.fn().mockResolvedValue(null);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
        limit: 10,
      };

      const result = await readMessagesHandler(args, context);

      expect(mockClient.channels.fetch).toHaveBeenCalledWith("123456789");
      expect(result).toEqual({
        content: [{ type: "text", text: "Cannot find channel with ID: 123456789" }],
        isError: true,
      });
    });

    test("should return error when channel doesn't support reading messages", async () => {
      const mockClient = createMockClient(true);
      const mockChannelWithoutMessages = {
        id: "123456789",
        isTextBased: () => false,
        // intentionally not including messages property
      };
      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannelWithoutMessages);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
        limit: 10,
      };

      const result = await readMessagesHandler(args, context);

      expect(result).toEqual({
        content: [{ type: "text", text: "Channel type does not support reading messages" }],
        isError: true,
      });
    });

    test("should return no messages found when channel has no messages", async () => {
      const mockClient = createMockClient(true);
      const mockChannel = createMockChannel("123456789", "test-channel");
      // Mocking an empty map-like collection with size property (simulating Discord Collection)
      const emptyMessagesCollection = new Map();
      // Mock the map method for the collection
      Object.defineProperty(emptyMessagesCollection, 'map', {
        value: (fn: (value: any, index: number, array: any[]) => any) => Array.from(emptyMessagesCollection.values()).map(fn),
        writable: true,
        configurable: true
      });

      (mockChannel.messages.fetch as jest.Mock).mockResolvedValue(emptyMessagesCollection);

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannel);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
        limit: 10,
      };

      const result = await readMessagesHandler(args, context);

      expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 10 });
      expect(result).toEqual({
        content: [{ type: "text", text: "No messages found in channel" }],
      });
    });

    test("should return formatted messages", async () => {
      const mockClient = createMockClient(true);
      const mockChannel = createMockChannel("123456789", "test-channel");
      const mockMessage = createMockMessage("msg123", "Hello world!", "author123", "TestUser");

      // Mocking a map-like collection with size property (simulating Discord Collection)
      const mockMessagesCollection = new Map([
        ['msg123', mockMessage]
      ]);
      // Mock the map method for the collection
      Object.defineProperty(mockMessagesCollection, 'map', {
        value: (fn: (value: any, index: number, array: any[]) => any) => Array.from(mockMessagesCollection.values()).map(fn),
        writable: true,
        configurable: true
      });

      (mockChannel.messages.fetch as jest.Mock).mockResolvedValue(mockMessagesCollection);

      mockClient.channels.fetch = jest.fn().mockResolvedValue(mockChannel);

      context = { client: mockClient } as ToolContext;
      const args = {
        channelId: "123456789",
        limit: 10,
      };

      const result = await readMessagesHandler(args, context);

      expect(mockChannel.messages.fetch).toHaveBeenCalledWith({ limit: 10 });
      expect(result.content[0].text).toContain('channelId');
      expect(result.content[0].text).toContain('messageCount');

      // Parse the JSON string to validate the structure
      const parsedResult = JSON.parse(result.content[0].text);
      expect(parsedResult.channelId).toBe("123456789");
      expect(parsedResult.messageCount).toBe(1);
      expect(parsedResult.messages[0]).toHaveProperty("id", "msg123");
      expect(parsedResult.messages[0]).toHaveProperty("content", "Hello world!");
      expect(parsedResult.messages[0].author).toHaveProperty("username", "TestUser");
    });
  });
});