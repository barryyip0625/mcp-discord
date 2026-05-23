import { Client, Guild, Collection, GuildChannelManager, REST, ChannelType } from "discord.js";
import { searchMessagesHandler, listServersHandler, getServerInfoHandler } from "./server.js";
import { ToolContext, ToolResponse } from "./types.js";
import { handleDiscordError } from "../errorHandler.js";

// Mock the external dependencies
jest.mock("../errorHandler.js", () => ({
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true
  }))
}));

describe("Server Handlers", () => {
  let mockClient: jest.Mocked<Client>;
  let mockGuild: jest.Mocked<Guild>;
  let mockContext: ToolContext;
  let mockREST: jest.Mocked<REST>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock REST client
    mockREST = {
      get: jest.fn()
    } as unknown as jest.Mocked<REST>;

    // Create mock guild
    mockGuild = {
      id: "123456789",
      name: "Test Guild",
      description: "A test guild",
      iconURL: jest.fn().mockReturnValue("https://example.com/icon.png"),
      ownerId: "987654321",
      createdAt: new Date(),
      approximateMemberCount: 100,
      features: ["ANIMATED_ICON", "INVITE_SPLASH"],
      premiumTier: 2,
      premiumSubscriptionCount: 5,
      fetch: jest.fn().mockResolvedValue(undefined),
      channels: {
        fetch: jest.fn().mockResolvedValue(new Collection())
      } as unknown as GuildChannelManager
    } as unknown as jest.Mocked<Guild>;

    // Create mock client
    // Create mock for guilds manager - make it flexible to allow individual test control
    const mockGuildsFetch = jest.fn().mockResolvedValue(
      new Collection([["123456789", mockGuild]])
    ) as jest.Mock<any, [any?]>;

    const mockGuildsManager = {
      fetch: mockGuildsFetch
    };

    mockClient = {
      isReady: jest.fn().mockReturnValue(true),
      guilds: mockGuildsManager,
      rest: mockREST
    } as unknown as jest.Mocked<Client>;

    // Create context
    mockContext = {
      client: mockClient
    } as ToolContext;
  });

  afterEach(() => {
    // Reset mock to default successful behavior
    (mockClient.guilds.fetch as jest.Mock).mockClear();
    (mockClient.guilds.fetch as jest.Mock).mockResolvedValue(
      new Collection([["123456789", mockGuild]])
    );
  });

  describe("searchMessagesHandler", () => {
    it("should return error when client is not ready", async () => {
      mockClient.isReady.mockReturnValueOnce(false);

      const result = await searchMessagesHandler({ guildId: "123456789" }, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it("should return error when guild is not found", async () => {
      // Clear the mock and set specific rejection for this test
      (mockClient.guilds.fetch as jest.Mock).mockClear();
      (mockClient.guilds.fetch as jest.Mock).mockRejectedValueOnce(new Error("Guild not found"));

      const result = await searchMessagesHandler({ guildId: "nonexistent" }, mockContext);

      expect(handleDiscordError).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        content: [{ type: "text", text: expect.stringContaining("Error:") }],
        isError: true
      }));
    });

    it("should search messages with correct parameters", async () => {
      const mockApiResponse = { messages: [] };
      mockREST.get.mockResolvedValueOnce(mockApiResponse);

      const args = {
        guildId: "123456789",
        content: "hello",
        authorId: "987654321",
        limit: 10,
        offset: 0
      };

      const result = await searchMessagesHandler(args, mockContext);

      expect(mockREST.get).toHaveBeenCalledWith("/guilds/123456789/messages/search?content=hello&author_id=987654321&limit=10&offset=0");
      expect(result.content[0].type).toBe("text");
      expect(JSON.parse(result.content[0].text)).toEqual(mockApiResponse);
    });

    it("should handle all search parameters correctly", async () => {
      const mockApiResponse = { messages: [{ id: "msg1", content: "test" }] };
      mockREST.get.mockResolvedValueOnce(mockApiResponse);

      const args = {
        guildId: "123456789",
        content: "test content",
        authorId: "author123",
        mentions: "mention123",
        has: "link",
        maxId: "max123",
        minId: "min123",
        channelId: "channel123",
        pinned: true,
        authorType: "bot",
        sortBy: "timestamp",
        sortOrder: "asc",
        limit: 25,
        offset: 5
      };

      await searchMessagesHandler(args, mockContext);

      expect(mockREST.get).toHaveBeenCalledWith(
        "/guilds/123456789/messages/search?" +
        "content=test+content&" +
        "author_id=author123&" +
        "mentions=mention123&" +
        "has=link&" +
        "max_id=max123&" +
        "min_id=min123&" +
        "channel_id=channel123&" +
        "pinned=true&" +
        "author_type=bot&" +
        "sort_by=timestamp&" +
        "sort_order=asc&" +
        "limit=25&" +
        "offset=5"
      );
    });

    it("should return error response when API call fails", async () => {
      mockREST.get.mockRejectedValueOnce(new Error("API Error"));

      const result = await searchMessagesHandler({ guildId: "123456789" }, mockContext);

      expect(handleDiscordError).toHaveBeenCalledWith(new Error("API Error"));
      expect(result.isError).toBe(true);
    });
  });

  describe("listServersHandler", () => {
    it("should return error when client is not ready", async () => {
      mockClient.isReady.mockReturnValueOnce(false);

      const result = await listServersHandler({}, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it("should return server information when client is ready", async () => {
      const result = await listServersHandler({}, mockContext);

      expect(mockClient.guilds.fetch).toHaveBeenCalled();
      expect(result.content[0].type).toBe("text");

      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent).toEqual([
        {
          id: "123456789",
          name: "Test Guild",
          icon: "https://example.com/icon.png"
        }
      ]);
    });

    it("should return message when no servers are found", async () => {
      // Clear the mock and return empty collection for this test
      (mockClient.guilds.fetch as jest.Mock).mockClear();
      (mockClient.guilds.fetch as jest.Mock).mockResolvedValueOnce(new Collection());

      const result = await listServersHandler({}, mockContext);

      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toBe("No servers found. The bot is not a member of any servers.");
    });

    it("should return error when fetching guilds fails", async () => {
      // Clear the mock and set specific rejection for this test
      (mockClient.guilds.fetch as jest.Mock).mockClear();
      (mockClient.guilds.fetch as jest.Mock).mockRejectedValueOnce(new Error("Failed to fetch"));

      const result = await listServersHandler({}, mockContext);

      expect(handleDiscordError).toHaveBeenCalledWith(new Error("Failed to fetch"));
      expect(result.isError).toBe(true);
    });
  });

  describe("getServerInfoHandler", () => {
    it("should return error when client is not ready", async () => {
      mockClient.isReady.mockReturnValueOnce(false);

      const result = await getServerInfoHandler({ guildId: "123456789" }, mockContext);

      expect(result).toEqual({
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      });
    });

    it("should return error when guild is not found", async () => {
      // Clear the mock and set specific rejection for this test
      (mockClient.guilds.fetch as jest.Mock).mockClear();
      (mockClient.guilds.fetch as jest.Mock).mockRejectedValueOnce(new Error("Guild not found"));

      const result = await getServerInfoHandler({ guildId: "nonexistent" }, mockContext);

      expect(handleDiscordError).toHaveBeenCalled();
      expect(result.isError).toBe(true);
    });

    it("should return detailed server information", async () => {
      // Create a fresh mock guild specifically for this test
      const mockChannelsCollection = new Collection([
        ["channel1", {
          id: "channel1",
          name: "general",
          type: ChannelType.GuildText,
          parentId: null,
          position: 0,
          topic: "General discussion"
        } as any],
        ["channel2", {
          id: "channel2",
          name: "voice-channel",
          type: ChannelType.GuildVoice,
          parentId: null,
          position: 1
        } as any]
      ]);

      const mockGuildWithChannels = {
        id: "123456789",
        name: "Test Guild",
        description: "A test guild",
        iconURL: jest.fn().mockReturnValue("https://example.com/icon.png"),
        ownerId: "987654321",
        createdAt: new Date(),
        approximateMemberCount: 100,
        features: ["ANIMATED_ICON", "INVITE_SPLASH"],
        premiumTier: 2,
        premiumSubscriptionCount: 5,
        fetch: jest.fn().mockResolvedValue(undefined),
        channels: {
          fetch: jest.fn().mockResolvedValue(mockChannelsCollection)
        }
      } as any;

      // For this specific test, we need to mock the single guild fetch (with ID parameter)
      (mockClient.guilds.fetch as jest.Mock).mockClear(); // Clear any previous calls
      (mockClient.guilds.fetch as jest.Mock).mockImplementation((guildIdOrOptions?: any) => {
        if (guildIdOrOptions && typeof guildIdOrOptions === 'object') {
          // This is fetching all guilds (no options or options object)
          return Promise.resolve(new Collection([["123456789", mockGuildWithChannels]]));
        } else {
          // This is fetching a single guild by ID
          return Promise.resolve(mockGuildWithChannels);
        }
      });

      const result = await getServerInfoHandler({ guildId: "123456789" }, mockContext);

      expect(result.content[0].type).toBe("text");
      const parsedContent = JSON.parse(result.content[0].text);

      expect(parsedContent).toEqual({
        id: "123456789",
        name: "Test Guild",
        description: "A test guild",
        icon: "https://example.com/icon.png",
        owner: "987654321",
        createdAt: mockGuildWithChannels.createdAt.toISOString(),
        memberCount: 100,
        channels: {
          count: {
            text: 1,
            voice: 1,
            category: 0,
            forum: 0,
            announcement: 0,
            stage: 0,
            total: 2
          },
          details: {
            text: [{
              id: "channel1",
              name: "general",
              type: "GuildText",
              categoryId: null,
              position: 0,
              topic: "General discussion"
            }],
            voice: [{
              id: "channel2",
              name: "voice-channel",
              type: "GuildVoice",
              categoryId: null,
              position: 1,
              topic: null
            }],
            category: [],
            forum: [],
            announcement: [],
            stage: [],
            all: [
              {
                id: "channel1",
                name: "general",
                type: "GuildText",
                categoryId: null,
                position: 0,
                topic: "General discussion"
              },
              {
                id: "channel2",
                name: "voice-channel",
                type: "GuildVoice",
                categoryId: null,
                position: 1,
                topic: null
              }
            ]
          }
        },
        features: ["ANIMATED_ICON", "INVITE_SPLASH"],
        premium: {
          tier: 2,
          subscriptions: 5
        }
      });
    });

    it("should handle error when fetching server info fails", async () => {
      (<jest.Mock>mockClient.guilds.fetch).mockRejectedValueOnce(new Error("Failed to fetch server"));

      const result = await getServerInfoHandler({ guildId: "123456789" }, mockContext);

      expect(handleDiscordError).toHaveBeenCalledWith(new Error("Failed to fetch server"));
      expect(result.isError).toBe(true);
    });
  });
});