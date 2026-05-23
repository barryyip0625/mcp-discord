import { sendMessageHandler } from './send-message.js';
import { SendMessageSchema } from '../schemas.js';
import { handleDiscordError } from "../errorHandler.js";
import { Client, Channel, TextBasedChannel } from 'discord.js';

// Mock Discord client and related objects
const mockMessage = {
  id: 'message123',
  content: 'Test message',
};

const mockTextChannel: any = {
  id: 'channel123',
  isTextBased: () => true,
  send: jest.fn().mockResolvedValue(mockMessage),
  messages: {
    fetch: jest.fn().mockResolvedValue(mockMessage),
  },
};

const mockNonTextChannel: any = {
  id: 'voiceChannel123',
  isTextBased: () => false,
};

const mockClient: any = {
  isReady: jest.fn(),
  channels: {
    fetch: jest.fn(),
  },
};

describe('sendMessageHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when Discord client is not ready', async () => {
    // Arrange
    mockClient.isReady.mockReturnValue(false);
    
    // Act
    const result = await sendMessageHandler(
      { channelId: 'channel123', message: 'Hello World' },
      { client: mockClient }
    );

    // Assert
    expect(result).toEqual({
      content: [{ type: "text", text: "Discord client not logged in." }],
      isError: true
    });
  });

  it('should return error when channel is not found', async () => {
    // Arrange
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(null);
    
    // Act
    const result = await sendMessageHandler(
      { channelId: 'nonexistent', message: 'Hello World' },
      { client: mockClient }
    );

    // Assert
    expect(result).toEqual({
      content: [{ type: "text", text: "Cannot find text channel ID: nonexistent" }],
      isError: true
    });
  });

  it('should return error when channel is not text-based', async () => {
    // Arrange
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockNonTextChannel);
    
    // Act
    const result = await sendMessageHandler(
      { channelId: 'voiceChannel123', message: 'Hello World' },
      { client: mockClient }
    );

    // Assert
    expect(result).toEqual({
      content: [{ type: "text", text: "Cannot find text channel ID: voiceChannel123" }],
      isError: true
    });
  });

  it('should send message successfully to a text channel', async () => {
    // Arrange
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockTextChannel);
    
    // Act
    const result = await sendMessageHandler(
      { channelId: 'channel123', message: 'Hello World' },
      { client: mockClient }
    );

    // Assert
    expect(mockTextChannel.send).toHaveBeenCalledWith({ content: 'Hello World' });
    expect(result).toEqual({
      content: [{ type: "text", text: "Message successfully sent to channel ID: channel123" }]
    });
  });

  it('should send message as reply when replyToMessageId is provided and message exists', async () => {
    // Arrange
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockTextChannel);
    
    // Act
    const result = await sendMessageHandler(
      { 
        channelId: 'channel123', 
        message: 'Reply message', 
        replyToMessageId: 'message123' 
      },
      { client: mockClient }
    );

    // Mock expects the send function to be called with reply options
    expect(mockTextChannel.send).toHaveBeenCalledWith({
      content: 'Reply message',
      reply: { messageReference: 'message123' }
    });
    expect(result).toEqual({
      content: [{ type: "text", text: "Message successfully sent to channel ID: channel123 as a reply to message ID: message123" }]
    });
  });

  it('should return error when replyToMessageId is provided but message does not exist', async () => {
    // Arrange
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue({
      ...mockTextChannel,
      messages: {
        fetch: jest.fn().mockRejectedValue(new Error('Message not found')),
      },
    });
    
    // Act
    const result = await sendMessageHandler(
      { 
        channelId: 'channel123', 
        message: 'Reply message', 
        replyToMessageId: 'invalidMessageId' 
      },
      { client: mockClient }
    );

    // Assert
    expect(result).toEqual({
      content: [{ type: "text", text: "Cannot find message with ID: invalidMessageId in channel channel123" }],
      isError: true
    });
  });

  it('should return error when channel does not support messages', async () => {
    // Arrange - simulate a channel without send method
    const mockChannelWithoutSendMethod = {
      id: 'channel123',
      isTextBased: () => true,
    };
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockChannelWithoutSendMethod);
    
    // Act
    const result = await sendMessageHandler(
      { channelId: 'channel123', message: 'Hello World' },
      { client: mockClient }
    );

    // Assert
    expect(result).toEqual({
      content: [{ type: "text", text: "This channel type does not support sending messages" }],
      isError: true
    });
  });

  it('should handle Discord errors properly', async () => {
    // Arrange
    const mockError = new Error('Discord API error');
    const mockChannelWithError = {
      id: 'channel123',
      isTextBased: () => true,
      send: jest.fn().mockRejectedValue(mockError),
    };
    
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockChannelWithError);
    
    // Mock handleDiscordError to return a known value
    const mockHandleDiscordError = jest.spyOn(
      require("../errorHandler.js"), 
      "handleDiscordError"
    ).mockReturnValue({
      content: [{ type: "text", text: "Handled Discord error" }],
      isError: true
    });
    
    // Act
    const result = await sendMessageHandler(
      { channelId: 'channel123', message: 'Hello World' },
      { client: mockClient }
    );

    // Assert
    expect(mockHandleDiscordError).toHaveBeenCalledWith(mockError);
    expect(result).toEqual({
      content: [{ type: "text", text: "Handled Discord error" }],
      isError: true
    });
    
    // Cleanup
    mockHandleDiscordError.mockRestore();
  });

  it('should validate input arguments using SendMessageSchema', () => {
    // Test that the schema validation works correctly
    const validArgs = { channelId: 'channel123', message: 'Hello World' };
    expect(() => SendMessageSchema.parse(validArgs)).not.toThrow();

    // Test with invalid arguments
    const invalidArgs = { channelId: 'channel123' }; // Missing message
    expect(() => SendMessageSchema.parse(invalidArgs)).toThrow();
  });

  it('should return error when channel does not support message replies', async () => {
    // Arrange - simulate a channel without messages property
    const mockChannelWithoutMessages = {
      id: 'channel123',
      isTextBased: () => true,
      send: jest.fn().mockResolvedValue(mockMessage),
      // Missing messages property
    };
    
    mockClient.isReady.mockReturnValue(true);
    mockClient.channels.fetch.mockResolvedValue(mockChannelWithoutMessages);
    
    // Act
    const result = await sendMessageHandler(
      { 
        channelId: 'channel123', 
        message: 'Reply message', 
        replyToMessageId: 'message123' 
      },
      { client: mockClient }
    );

    // Assert
    expect(result).toEqual({
      content: [{ type: "text", text: "This channel type does not support message replies" }],
      isError: true
    });
  });
});