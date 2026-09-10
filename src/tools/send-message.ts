import { SendMessageSchema, EditMessageSchema } from '../schemas.js';
import { ToolHandler } from './types.js';
import { handleDiscordError } from "../errorHandler.js";

export const sendMessageHandler: ToolHandler = async (args, { client }) => {
  const { channelId, message, replyToMessageId, embeds } = SendMessageSchema.parse(args);
  
  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      return {
        content: [{ type: "text", text: `Cannot find text channel ID: ${channelId}` }],
        isError: true
      };
    }

    // Ensure channel is text-based and can send messages
    if ('send' in channel) {
      // Build message options
      const messageOptions: any = {};
      
      // If replyToMessageId is provided, verify the message exists and add reply option
      if (replyToMessageId) {
        if ('messages' in channel) {
          try {
            // Verify the message exists
            await channel.messages.fetch(replyToMessageId);
            messageOptions.reply = { messageReference: replyToMessageId };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Cannot find message with ID: ${replyToMessageId} in channel ${channelId}` }],
              isError: true
            };
          }
        } else {
          return {
            content: [{ type: "text", text: `This channel type does not support message replies` }],
            isError: true
          };
        }
      }
      
      // Set the message content
      messageOptions.content = message;
      
      // Attach embeds (plain APIEmbed objects are accepted by discord.js as-is)
      if (embeds && embeds.length > 0) {
        messageOptions.embeds = embeds;
      }

      const sent = await channel.send(messageOptions);
      
      const baseText = replyToMessageId
        ? `Message successfully sent to channel ID: ${channelId} as a reply to message ID: ${replyToMessageId}`
        : `Message successfully sent to channel ID: ${channelId}`;
      // Expose the sent message so callers can link to it or edit it later
      const responseText = `${baseText} (message ID: ${sent.id}, URL: ${sent.url})`;
      
      return {
        content: [{ type: "text", text: responseText }]
      };
    } else {
      return {
        content: [{ type: "text", text: `This channel type does not support sending messages` }],
        isError: true
      };
    }
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const editMessageHandler: ToolHandler = async (args, { client }) => {
  const { channelId, messageId, content } = EditMessageSchema.parse(args);

  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const channel = await client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      return {
        content: [{ type: "text", text: `Cannot find text channel ID: ${channelId}` }],
        isError: true
      };
    }

    if (!('messages' in channel)) {
      return {
        content: [{ type: "text", text: `This channel type does not support message editing` }],
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

    if (message.author.id !== client.user?.id) {
      return {
        content: [{ type: "text", text: `Cannot edit message: only messages sent by the bot can be edited` }],
        isError: true
      };
    }

    await message.edit(content);

    return {
      content: [{ type: "text", text: `Successfully edited message ${messageId} in channel ${channelId}` }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};