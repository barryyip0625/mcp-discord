import { ChannelType, ForumChannel } from 'discord.js';
import { GetForumChannelsSchema, CreateForumPostSchema, GetForumPostSchema, ListForumThreadsSchema, ReplyToForumSchema, DeleteForumPostSchema } from '../schemas.js';
import { ToolHandler } from './types.js';
import { handleDiscordError } from "../errorHandler.js";

export const getForumChannelsHandler: ToolHandler = async (args, { client }) => {
  const { guildId } = GetForumChannelsSchema.parse(args);
  
  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const guild = await client.guilds.fetch(guildId);
    if (!guild) {
      return {
        content: [{ type: "text", text: `Cannot find guild with ID: ${guildId}` }],
        isError: true
      };
    }

    // Fetch all channels from the guild
    const channels = await guild.channels.fetch();
    
    // Filter to get only forum channels
    const forumChannels = channels.filter(channel => channel?.type === ChannelType.GuildForum);
    
    if (forumChannels.size === 0) {
      return {
        content: [{ type: "text", text: `No forum channels found in guild: ${guild.name}` }]
      };
    }

    // Format forum channels information
    const forumInfo = forumChannels.map(channel => ({
      id: channel.id,
      name: channel.name,
      topic: channel.topic || "No topic set"
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(forumInfo, null, 2) }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const createForumPostHandler: ToolHandler = async (args, { client }) => {
  const { forumChannelId, title, content, tags } = CreateForumPostSchema.parse(args);
  
  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const channel = await client.channels.fetch(forumChannelId);
    if (!channel || channel.type !== ChannelType.GuildForum) {
      return {
        content: [{ type: "text", text: `Channel ID ${forumChannelId} is not a forum channel.` }],
        isError: true
      };
    }

    const forumChannel = channel as ForumChannel;
    
    // Get available tags in the forum
    const availableTags = forumChannel.availableTags;
    let selectedTagIds: string[] = [];
    
    // If tags are provided, find their IDs
    if (tags && tags.length > 0) {
      selectedTagIds = availableTags
        .filter(tag => tags.includes(tag.name))
        .map(tag => tag.id);
    }

    // Create the forum post
    const thread = await forumChannel.threads.create({
      name: title,
      message: {
        content: content
      },
      appliedTags: selectedTagIds.length > 0 ? selectedTagIds : undefined
    });

    return {
      content: [{ 
        type: "text", 
        text: `Successfully created forum post "${title}" with ID: ${thread.id}` 
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const getForumPostHandler: ToolHandler = async (args, { client }) => {
  const { threadId } = GetForumPostSchema.parse(args);
  
  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const thread = await client.channels.fetch(threadId);
    if (!thread || !(thread.isThread())) {
      return {
        content: [{ type: "text", text: `Cannot find thread with ID: ${threadId}` }],
        isError: true
      };
    }

    // Get messages from the thread
    const messages = await thread.messages.fetch({ limit: 10 });
    
    const threadDetails = {
      id: thread.id,
      name: thread.name,
      parentId: thread.parentId,
      messageCount: messages.size,
      createdAt: thread.createdAt,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        author: msg.author.tag,
        createdAt: msg.createdAt
      }))
    };

    return {
      content: [{ type: "text", text: JSON.stringify(threadDetails, null, 2) }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const listForumThreadsHandler: ToolHandler = async (args, { client }) => {
  const { forumChannelId, includeArchived, limit } = ListForumThreadsSchema.parse(args);

  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const channel = await client.channels.fetch(forumChannelId);
    if (!channel || channel.type !== ChannelType.GuildForum) {
      return {
        content: [{ type: "text", text: `Channel ID ${forumChannelId} is not a forum channel.` }],
        isError: true
      };
    }

    const forumChannel = channel as ForumChannel;

    // Fetch active threads
    const activeThreads = await forumChannel.threads.fetchActive();

    // Fetch archived threads if requested
    let archivedThreads: typeof activeThreads | null = null;
    if (includeArchived) {
      archivedThreads = await forumChannel.threads.fetchArchived({ limit: limit });
    }

    // Combine and format thread information
    const threads: Array<{
      id: string;
      name: string;
      createdAt: Date | null;
      archived: boolean;
      locked: boolean;
      messageCount: number | null;
      ownerId: string | null;
    }> = [];

    // Add active threads
    activeThreads.threads.forEach(thread => {
      threads.push({
        id: thread.id,
        name: thread.name,
        createdAt: thread.createdAt,
        archived: thread.archived || false,
        locked: thread.locked || false,
        messageCount: thread.messageCount,
        ownerId: thread.ownerId
      });
    });

    // Add archived threads if fetched
    if (archivedThreads) {
      archivedThreads.threads.forEach(thread => {
        // Avoid duplicates
        if (!threads.find(t => t.id === thread.id)) {
          threads.push({
            id: thread.id,
            name: thread.name,
            createdAt: thread.createdAt,
            archived: thread.archived || false,
            locked: thread.locked || false,
            messageCount: thread.messageCount,
            ownerId: thread.ownerId
          });
        }
      });
    }

    // Sort by creation date (newest first)
    threads.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          forumChannelId,
          totalThreads: threads.length,
          threads
        }, null, 2)
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const replyToForumHandler: ToolHandler = async (args, { client }) => {
  const { threadId, message } = ReplyToForumSchema.parse(args);
  
  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const thread = await client.channels.fetch(threadId);
    if (!thread || !(thread.isThread())) {
      return {
        content: [{ type: "text", text: `Cannot find thread with ID: ${threadId}` }],
        isError: true
      };
    }

    if (!('send' in thread)) {
      return {
        content: [{ type: "text", text: `This thread does not support sending messages` }],
        isError: true
      };
    }

    // Send the reply
    const sentMessage = await thread.send(message);

    return {
      content: [{ 
        type: "text", 
        text: `Successfully replied to forum post. Message ID: ${sentMessage.id}` 
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
};

export const deleteForumPostHandler: ToolHandler = async (args, { client }) => {
  const { threadId, reason } = DeleteForumPostSchema.parse(args);
  
  try {
    if (!client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const thread = await client.channels.fetch(threadId);
    if (!thread || !thread.isThread()) {
      return {
        content: [{ type: "text", text: `Cannot find forum post/thread with ID: ${threadId}` }],
        isError: true
      };
    }

    // Delete the forum post/thread
    await thread.delete(reason || "Forum post deleted via API");

    return {
      content: [{ 
        type: "text", 
        text: `Successfully deleted forum post/thread with ID: ${threadId}` 
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}; 