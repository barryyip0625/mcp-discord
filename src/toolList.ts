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
    name: "discord_list_forum_threads",
    description: "Lists all threads (posts) in a Discord forum channel, including both active and archived threads",
    inputSchema: {
      type: "object",
      properties: {
        forumChannelId: { type: "string", description: "The ID of the forum channel to list threads from" },
        includeArchived: { type: "boolean", description: "Whether to include archived threads (default: true)", default: true },
        limit: { type: "number", description: "Maximum number of archived threads to fetch (default: 100, max: 100)", minimum: 1, maximum: 100, default: 100 }
      },
      required: ["forumChannelId"]
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
    description: "Creates a new text channel in a Discord server with an optional topic and parent category",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        channelName: { type: "string" },
        topic: { type: "string" },
        categoryId: { type: "string", description: "Parent category ID to place the channel under" }
      },
      required: ["guildId", "channelName"]
    }
  },
  {
    name: "discord_create_forum_channel",
    description: "Creates a new forum channel in a Discord server, optionally under a category",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        name: { type: "string" },
        topic: { type: "string", description: "The forum channel guidelines/description" },
        categoryId: { type: "string", description: "The ID of the parent category to create the channel under" }
      },
      required: ["guildId", "name"]
    }
  },
  {
    name: "discord_edit_channel",
    description: "Edits a Discord channel's name, topic, parent category, or position",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "The ID of the channel to edit" },
        name: { type: "string", description: "New name for the channel" },
        topic: { type: "string", description: "New topic for the channel" },
        parentId: { type: "string", description: "The ID of a category to move the channel under" },
        position: { type: "number", description: "New position of the channel in the list" },
        reason: { type: "string", description: "Reason for editing (shown in audit log)" }
      },
      required: ["channelId"]
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
    description: "Retrieves messages from a Discord text channel. Supports date-based filtering via before/after/around params (accepts snowflake IDs or ISO 8601 dates).",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string" },
        limit: {
          type: "number",
          minimum: 1,
          maximum: 100,
          default: 50
        },
        before: { type: "string", description: "Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages before this point." },
        after: { type: "string", description: "Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages after this point." },
        around: { type: "string", description: "Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages around this point." }
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
    name: "discord_get_forum_tags",
    description: "Gets all available tags for a Discord forum channel, including tag IDs, names, and emoji",
    inputSchema: {
      type: "object",
      properties: {
        forumChannelId: { type: "string", description: "The ID of the forum channel to get tags from" }
      },
      required: ["forumChannelId"]
    }
  },
  {
    name: "discord_set_forum_tags",
    description: "Sets the available tags for a Discord forum channel. Replaces all existing tags.",
    inputSchema: {
      type: "object",
      properties: {
        forumChannelId: { type: "string", description: "The ID of the forum channel to set tags on" },
        tags: {
          type: "array",
          description: "Array of tag objects to set on the forum channel",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Tag name" },
              emoji: { type: "string", description: "Unicode emoji for the tag (e.g. '🔬')" },
              moderated: { type: "boolean", description: "Whether only moderators can apply this tag (default: false)" }
            },
            required: ["name"]
          }
        }
      },
      required: ["forumChannelId", "tags"]
    }
  },
  {
    name: "discord_update_forum_post",
    description: "Updates a forum post's title, applied tags, archived status, or locked status. Tags can be specified by name or ID.",
    inputSchema: {
      type: "object",
      properties: {
        threadId: { type: "string", description: "The ID of the forum post/thread to update" },
        name: { type: "string", description: "New title for the forum post" },
        tags: { type: "array", items: { type: "string" }, description: "Tags to apply (by name or ID). Replaces all existing tags." },
        archived: { type: "boolean", description: "Whether to archive or unarchive the post" },
        locked: { type: "boolean", description: "Whether to lock or unlock the post" }
      },
      required: ["threadId"]
    }
  },
  {
    name: "discord_edit_message",
    description: "Edits a message previously sent by the bot. Only messages authored by the bot can be edited.",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "The ID of the channel containing the message" },
        messageId: { type: "string", description: "The ID of the message to edit" },
        content: { type: "string", description: "The new content for the message" }
      },
      required: ["channelId", "messageId", "content"]
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
    name: "discord_list_roles",
    description: "Lists all roles in a Discord server with their properties",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" }
      },
      required: ["guildId"]
    }
  },
  {
    name: "discord_create_role",
    description: "Creates a new role in a Discord server",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        name: { type: "string" },
        color: { type: "string", description: "Hex color string (e.g. '#FF0000') or color name" },
        hoist: { type: "boolean", description: "Whether the role should be displayed separately in the sidebar" },
        mentionable: { type: "boolean", description: "Whether the role can be mentioned by anyone" },
        permissions: { type: "array", items: { type: "string" }, description: "Array of permission flag names (e.g. ['SendMessages', 'ViewChannel'])" },
        reason: { type: "string" }
      },
      required: ["guildId", "name"]
    }
  },
  {
    name: "discord_edit_role",
    description: "Edits an existing role in a Discord server",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        roleId: { type: "string" },
        name: { type: "string" },
        color: { type: "string", description: "Hex color string (e.g. '#FF0000') or color name" },
        hoist: { type: "boolean" },
        mentionable: { type: "boolean" },
        permissions: { type: "array", items: { type: "string" }, description: "Array of permission flag names" },
        position: { type: "number", description: "New position in the role hierarchy" },
        reason: { type: "string" }
      },
      required: ["guildId", "roleId"]
    }
  },
  {
    name: "discord_delete_role",
    description: "Deletes a role from a Discord server",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        roleId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["guildId", "roleId"]
    }
  },
  {
    name: "discord_assign_role",
    description: "Assigns a role to a member in a Discord server",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        userId: { type: "string" },
        roleId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["guildId", "userId", "roleId"]
    }
  },
  {
    name: "discord_remove_role",
    description: "Removes a role from a member in a Discord server",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        userId: { type: "string" },
        roleId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["guildId", "userId", "roleId"]
    }
  },
  {
    name: "discord_list_members",
    description: "Lists members in a Discord server with their roles",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        limit: { type: "number", description: "Maximum number of members to return (default 100, max 1000)", minimum: 1, maximum: 1000, default: 100 },
        after: { type: "string", description: "User ID to paginate after" }
      },
      required: ["guildId"]
    }
  },
  {
    name: "discord_get_member",
    description: "Gets detailed information about a specific member in a Discord server",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        userId: { type: "string" }
      },
      required: ["guildId", "userId"]
    }
  },
  {
    name: "discord_create_voice_channel",
    description: "Creates a new voice channel in a Discord server with an optional parent category",
    inputSchema: {
      type: "object",
      properties: {
        guildId: { type: "string" },
        channelName: { type: "string" },
        categoryId: { type: "string", description: "Parent category ID to place the channel under" },
        userLimit: { type: "number", description: "Maximum number of users allowed (0 for unlimited)", minimum: 0, maximum: 99 },
        reason: { type: "string" }
      },
      required: ["guildId", "channelName"]
    }
  },
  {
    name: "discord_set_channel_permissions",
    description: "Sets permission overrides for a role or user on a channel or category",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "Channel or category ID" },
        roleId: { type: "string", description: "Role or user ID to set permissions for" },
        allow: { type: "array", items: { type: "string" }, description: "Permission flags to allow (e.g. ['ViewChannel', 'SendMessages'])" },
        deny: { type: "array", items: { type: "string" }, description: "Permission flags to deny (e.g. ['ViewChannel', 'SendMessages'])" },
        reason: { type: "string" }
      },
      required: ["channelId", "roleId"]
    }
  },
  {
    name: "discord_remove_channel_permissions",
    description: "Removes all permission overrides for a role or user on a channel or category",
    inputSchema: {
      type: "object",
      properties: {
        channelId: { type: "string", description: "Channel or category ID" },
        roleId: { type: "string", description: "Role or user ID to remove overrides for" },
        reason: { type: "string" }
      },
      required: ["channelId", "roleId"]
    }
  }
]; 