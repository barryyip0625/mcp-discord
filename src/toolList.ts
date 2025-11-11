export const toolList = [
  {
    name: "discord_create_category",
    description: "Creates a new category in a Discord server.",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        name: { type: "string" },
        position: { type: "number" },
        reason: { type: "string" }
      },
      required: ["guildId", "name"]
    }
  },
  {
    name: "discord_edit_category",
    description: "Edits an existing Discord category (name and position).",
    inputSchema: {
      type: "object",
      properties: {
        categoryId: { type: "string" },
        name: { type: "string" },
        position: { type: "number" },
        reason: { type: "string" }
      },
      required: ["categoryId"]
    }
  },
  {
    name: "discord_delete_category",
    description: "Deletes a Discord category by ID.",
    inputSchema: {
      type: "object",
      properties: {
        categoryId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["categoryId"]
    }
  },
  {
    name: "discord_login",
    description: "Logs in to Discord using the configured token",
    inputSchema: {
      type: "object",
      properties: {
        token: { type: "string" }
      },
      required: []
    }
  },
  {
    name: "discord_send",
    description: "Sends a message to a specified Discord text channel. Optionally reply to another message by providing its message ID.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        message: { type: "string" },
        replyToMessageId: { type: "string" }
      },
      required: ["channelId", "message"]
    }
  },
  {
    name: "discord_get_forum_channels",
    description: "Lists all forum channels in a specified Discord server (guild)",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" }
      },
      required: ["guildId"]
    }
  },
  {
    name: "discord_create_forum_post",
    description: "Creates a new post in a Discord forum channel with optional tags",
    inputSchema: {
      type: "object",
      properties: {
        forumChannelId: { type: "string" },
        title: { type: "string" },
        content: { type: "string" },
        tags: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["forumChannelId", "title", "content"]
    }
  },
  {
    name: "discord_get_forum_post",
    description: "Retrieves details about a forum post including its messages",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string" }
      },
      required: ["threadId"]
    }
  },
  {
    name: "discord_reply_to_forum",
    description: "Adds a reply to an existing forum post or thread",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string" },
        message: { type: "string" }
      },
      required: ["threadId", "message"]
    }
  },
  {
    name: "discord_create_text_channel",
    description: "Creates a new text channel in a Discord server with an optional topic",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        channelName: { type: "string" },
        topic: { type: "string" }
      },
      required: ["guildId", "channelName"]
    }
  },
  {
    name: "discord_delete_channel",
    description: "Deletes a Discord channel with an optional reason",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["channelId"]
    }
  },
  {
    name: "discord_read_messages",
    description: "Retrieves messages from a Discord text channel with a configurable limit",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        limit: {
          type: "number",
          minimum: 1,
          maximum: 100,
          default: 50
        }
      },
      required: ["channelId"]
    }
  },
  {
    name: "discord_get_server_info",
    description: "Retrieves detailed information about a Discord server including channels and member count",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" }
      },
      required: ["guildId"]
    }
  },
  {
    name: "discord_add_reaction",
    description: "Adds an emoji reaction to a specific Discord message",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        messageId: { type: "string" },
        emoji: { type: "string" }
      },
      required: ["channelId", "messageId", "emoji"]
    }
  },
  {
    name: "discord_add_multiple_reactions",
    description: "Adds multiple emoji reactions to a Discord message at once",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        messageId: { type: "string" },
        emojis: {
          type: "array",
          items: { type: "string" }
        }
      },
      required: ["channelId", "messageId", "emojis"]
    }
  },
  {
    name: "discord_remove_reaction",
    description: "Removes a specific emoji reaction from a Discord message",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        messageId: { type: "string" },
        emoji: { type: "string" },
        userId: { type: "string" }
      },
      required: ["channelId", "messageId", "emoji"]
    }
  },
  {
    name: "discord_delete_forum_post",
    description: "Deletes a forum post or thread with an optional reason",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["threadId"]
    }
  },
  {
    name: "discord_delete_message",
    description: "Deletes a specific message from a Discord text channel",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        messageId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["channelId", "messageId"]
    }
  },
  {
    name: "discord_create_webhook",
    description: "Creates a new webhook for a Discord channel",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        name: { type: "string" },
        avatar: { type: "string" },
        reason: { type: "string" }
      },
      required: ["channelId", "name"]
    }
  },
  {
    name: "discord_send_webhook_message",
    description: "Sends a message to a Discord channel using a webhook",
    inputSchema: {
      type: "object",
      properties: {
        webhookId: { type: "string" },
        webhookToken: { type: "string" },
        content: { type: "string" },
        username: { type: "string" },
        avatarURL: { type: "string" },
        threadId: { type: "string" }
      },
      required: ["webhookId", "webhookToken", "content"]
    }
  },
  {
    name: "discord_edit_webhook",
    description: "Edits an existing webhook for a Discord channel",
    inputSchema: {
      type: "object",
      properties: {
        webhookId: { type: "string" },
        webhookToken: { type: "string" },
        name: { type: "string" },
        avatar: { type: "string" },
        channelId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["webhookId"]
    }
  },
  {
    name: "discord_delete_webhook",
    description: "Deletes an existing webhook for a Discord channel",
    inputSchema: {
      type: "object",
      properties: {
        webhookId: { type: "string" },
        webhookToken: { type: "string" },
        reason: { type: "string" }
      },
      required: ["webhookId"]
    }
  },
  {
    name: "discord_list_servers",
    description: "Lists all Discord servers the bot is a member of",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "discord_search_messages",
    description: "Searches for messages in a Discord server",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string", description: "The ID of the Discord server (guild) to search within" },
        content: { type: "string", description: "Search for messages containing specific text" },
        authorId: { type: "string", description: "Filter messages by a specific user ID" },
        mentions: { type: "string", description: "Filter messages that mention a specific user ID" },
        has: { type: "string", description: "Filter messages that contain specific content types (e.g., link, embed, file, poll, image, video, sound, sticker, snapshot)", enum: ["link", "embed", "file", "poll", "image", "video", "sound", "sticker", "snapshot"] },
        maxId: { type: "string", description: "Filter messages with IDs less than this value (messages before this ID)" },
        minId: { type: "string", description: "Filter messages with IDs greater than this value (messages after this ID)" },
        channelId: { type: "string", description: "Filter messages within a specific channel ID" },
        pinned: { type: "boolean", description: "Filter messages based on whether they are pinned" },
        authorType: { type: "string", description: "Filter messages by author type (user, bot, webhook)", enum: ["user", "bot", "webhook"] },
        sortBy: { type: "string", description: "Sort results by 'timestamp' or 'relevance'", enum: ["timestamp", "relevance"] },
        sortOrder: { type: "string", description: "Sort order: 'desc' for descending or 'asc' for ascending", enum: ["desc", "asc"] },
        limit: { type: "number", description: "Maximum number of messages to return (default 25, max 100)" },
        offset: { type: "number", description: "Number of messages to skip (for pagination)" }
      },
      required: ["guildId"]
    }
  },
  {
    name: "discord_set_presence",
    description: "Sets the bot's presence (status and activity) in Discord",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["online", "idle", "dnd", "invisible"], description: "The presence status to set." },
        afk: { type: "boolean", description: "Whether the bot is AFK." },
        activities: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["PLAYING", "STREAMING", "LISTENING", "WATCHING", "COMPETING", "CUSTOM"], description: "The type of activity (e.g. 'Listening to...', 'Playing...')." },
            name: { type: "string", description: "The name of the activity." },
            url: { type: "string", description: "The URL for the activity (only for STREAMING type)." }
          }
        }
      },
      required: ["status"]
    }
  },
  {
    name: "discord_set_nickname",
    description: "Sets the bot's nickname in a specified Discord server (guild).",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string", description: "The ID of the server where to set the nickname." },
        nick: { type: "string", description: "The nickname to set for the bot. Use null or empty string to clear the nickname." }
      },
      required: ["guildId"]
    }
  },
  {
    name: "discord_set_about_me",
    description: "Sets the global 'About Me' section content for the bot's Discord profile.",
    inputSchema: {
      type: "object",
      properties: {
        aboutMe: { type: "string", description: "The global 'About Me' section content." }
      },
      required: ["aboutMe"]
    }
  },
  {
    name: "discord_set_bio",
    description: "Sets the 'Bio' section content for the bot in a specified Discord server (guild).",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string", description: "The ID of the server where to set the bio." },
        bio: { type: "string", description: "The 'Bio' section content to set for the bot in the specified server." }
      },
      required: ["guildId"]
    }
  }
];
