import { PinMessageSchema, UnpinMessageSchema, ListPinnedMessagesSchema } from '../schemas.js';
import { ToolHandler } from './types.js';
import { handleDiscordError } from "../errorHandler.js";

export const pinMessageHandler: ToolHandler = async (args, { client }) => {
  const { channelId, messageId, reason } = PinMessageSchema.parse(args);

  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || !('messages' in channel)) {
      return {
        content: [{ type: "text", text: `Cannot find text channel with ID: ${channelId}` }],
        isError: true
      };
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      return {
        content: [{ type: "text", text: `Cannot find message with ID: ${messageId}` }],
        isError: true
      };
    }

    if (message.pinned) {
      return {
        content: [{ type: "text", text: `Message ${messageId} is already pinned in channel ${channelId}` }]
      };
    }

    await message.pin(reason);

    return {
      content: [{
        type: "text",
        text: `Successfully pinned message ${messageId} in channel ${channelId}`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const unpinMessageHandler: ToolHandler = async (args, { client }) => {
  const { channelId, messageId, reason } = UnpinMessageSchema.parse(args);

  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || !('messages' in channel)) {
      return {
        content: [{ type: "text", text: `Cannot find text channel with ID: ${channelId}` }],
        isError: true
      };
    }

    const message = await channel.messages.fetch(messageId);
    if (!message) {
      return {
        content: [{ type: "text", text: `Cannot find message with ID: ${messageId}` }],
        isError: true
      };
    }

    if (!message.pinned) {
      return {
        content: [{ type: "text", text: `Message ${messageId} is not pinned in channel ${channelId}` }]
      };
    }

    await message.unpin(reason);

    return {
      content: [{
        type: "text",
        text: `Successfully unpinned message ${messageId} in channel ${channelId}`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const listPinnedMessagesHandler: ToolHandler = async (args, { client }) => {
  const { channelId, limit } = ListPinnedMessagesSchema.parse(args);

  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased() || !('messages' in channel)) {
      return {
        content: [{ type: "text", text: `Cannot find text channel with ID: ${channelId}` }],
        isError: true
      };
    }

    const pins = await channel.messages.fetchPins({ limit });

    const pinnedMessages = pins.items.map(pin => ({
      id: pin.message.id,
      content: pin.message.content,
      author: pin.message.author?.tag ?? null,
      authorId: pin.message.author?.id ?? null,
      createdAt: pin.message.createdAt,
      pinnedAt: pin.pinnedAt
    }));

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          channelId,
          totalPinned: pinnedMessages.length,
          hasMore: pins.hasMore,
          pinnedMessages
        }, null, 2)
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};
