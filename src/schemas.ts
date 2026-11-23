import { z } from "zod";

export const DiscordLoginSchema = z.object({
    token: z.string().describe("The bot token to use for login.").optional()
}).describe("Login to Discord using a bot token. If no token is provided, the bot will attempt to use the token from the environment variable DISCORD_TOKEN.");

export const SendMessageSchema = z.object({
    channelId: z.string().describe("The ID of the channel to send the message to."),
    message: z.string().describe("The content of the message to send."),
    replyToMessageId: z.string().describe("The ID of the message to reply to, if any.").optional()
}).describe("Send a message to a specified channel, optionally as a reply to another message.");

export const GetForumChannelsSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) to get forum channels from.")
}).describe("Get all forum channels in a specified server (guild).");

export const CreateForumPostSchema = z.object({
    forumChannelId: z.string().describe("The ID of the forum channel where the thread will be created."),
    title: z.string().describe("The title of the forum post (thread)."),
    content: z.string().describe("The body content of the forum post."),
    tags: z.array(z.string().describe("A tag to attach to the forum post.")).optional(),
    pinned: z.boolean().describe("If true, pin the post to the top of the forum channel after creating it.").optional()
}).describe("Create a new forum post (thread) in a specified forum channel.");

export const GetForumPostSchema = z.object({
    threadId: z.string().describe("The ID of the forum thread to retrieve.")
}).describe("Get details of a specific forum post (thread) by its ID.");

export const ListForumThreadsSchema = z.object({
    forumChannelId: z.string(),
    includeArchived: z.boolean().optional().default(true),
    limit: z.number().min(1).max(100).optional().default(100)
});

export const ReplyToForumSchema = z.object({
    threadId: z.string().describe("The ID of the forum thread to reply to."),
    message: z.string().describe("The content of the reply message.")
}).describe("Reply to a specific forum post (thread) by its ID.");

export const CreateTextChannelSchema = z.object({
    guildId: z.string(),
    channelName: z.string(),
    topic: z.string().optional(),
    categoryId: z.string().optional(),
    reason: z.string().optional()
});

export const CreateForumChannelSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) to create the forum channel in."),
    name: z.string().describe("The name of the forum channel to create."),
    topic: z.string().describe("The forum channel guidelines/description.").optional(),
    categoryId: z.string().describe("The ID of the parent category to create the channel under.").optional(),
    reason: z.string().describe("Optional reason for audit logs.").optional()
}).describe("Create a new forum channel in a specified server (guild), optionally under a category.");

export const EditChannelSchema = z.object({
    channelId: z.string().describe("The ID of the channel to edit."),
    name: z.string().describe("New name for the channel.").optional(),
    topic: z.string().describe("New topic for the channel.").optional(),
    parentId: z.string().describe("The ID of a category to move the channel under.").optional(),
    position: z.number().describe("New position of the channel in the list.").optional(),
    reason: z.string().describe("Optional reason for audit logs.").optional()
}).describe("Edit a Discord channel's name, topic, parent category, or position.");

// Category schemas
export const CreateCategorySchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) where the category will be created."),
    name: z.string().describe("The name of the category to create."),
    position: z.number().describe("Optional sorting position index for the category.").optional(),
    reason: z.string().describe("Optional reason for audit logs when creating the category.").optional()
}).describe("Create a new category in a specified server (guild).");

export const EditCategorySchema = z.object({
    categoryId: z.string().describe("The ID of the category to edit."),
    name: z.string().describe("New name for the category (optional).").optional(),
    position: z.number().describe("New position index for the category (optional).").optional(),
    reason: z.string().describe("Optional reason for audit logs when editing the category.").optional()
}).describe("Edit an existing category's properties.");

export const DeleteCategorySchema = z.object({
    categoryId: z.string().describe("The ID of the category to delete."),
    reason: z.string().describe("Optional reason for audit logs when deleting the category.").optional()
}).describe("Delete a category by its ID.");

export const DeleteChannelSchema = z.object({
    channelId: z.string().describe("The ID of the channel to delete."),
    reason: z.string().describe("Optional reason for audit logs when deleting the channel.").optional()
}).describe("Delete a channel by its ID.");

export const ReadMessagesBaseSchema = z.object({
    channelId: z.string().describe("The ID of the channel to read messages from."),
    limit: z.number().describe("How many recent messages to fetch (1-100).").min(1).max(100).optional().default(50),
    before: z.string().describe("Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages before this point.").optional(),
    after: z.string().describe("Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages after this point.").optional(),
    around: z.string().describe("Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages around this point.").optional(),
}).describe("Retrieves messages from a Discord text channel. Supports date-based filtering via before/after/around (snowflake IDs or ISO 8601 dates). Only one of before, after, or around may be specified.");

export const ReadMessagesSchema = ReadMessagesBaseSchema.refine(
    (data) => [data.before, data.after, data.around].filter(Boolean).length <= 1,
    { message: "Only one of 'before', 'after', or 'around' can be specified." }
);

export const GetServerInfoSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) to get information for.")
}).describe("Get information about a specific server (guild) by its ID.");

export const AddReactionSchema = z.object({
    channelId: z.string().describe("The ID of the channel containing the message to react to."),
    messageId: z.string().describe("The ID of the message to add a reaction to."),
    emoji: z.string().describe("The emoji to use for the reaction (unicode or custom).")
}).describe("Add a reaction to a specific message in a channel.");

export const AddMultipleReactionsSchema = z.object({
    channelId: z.string().describe("The ID of the channel containing the message to react to."),
    messageId: z.string().describe("The ID of the message to add reactions to."),
    emojis: z.array(z.string().describe("An emoji to add (unicode or custom)."))
}).describe("Add multiple reactions to a specific message in a channel.");

export const RemoveReactionSchema = z.object({
    channelId: z.string().describe("The ID of the channel containing the message to modify reactions on."),
    messageId: z.string().describe("The ID of the message to remove the reaction from."),
    emoji: z.string().describe("The emoji reaction to remove."),
    userId: z.string().describe("Optional ID of the user whose reaction should be removed; if omitted, removes the current bot's reaction.").optional()
}).describe("Remove a reaction from a specific message in a channel.");

export const GetReactionUsersSchema = z.object({
    channelId: z.string().describe("The ID of the channel containing the message."),
    messageId: z.string().describe("The ID of the message to inspect reactions on."),
    emoji: z.string().describe("The emoji whose reactors should be listed (unicode name or custom emoji name)."),
    limit: z.number().describe("Maximum number of users to fetch per reaction (1-100, default 100).").int().min(1).max(100).default(100).optional()
}).describe("List the users who reacted with a specific emoji to a message. Uses REST fetch and does not require Gateway intents.");

export const DeleteForumPostSchema = z.object({
    threadId: z.string().describe("The ID of the forum thread to delete."),
    reason: z.string().describe("Optional reason for audit logs when deleting the forum post.").optional()
}).describe("Delete a forum post (thread) by its ID.");

export const GetForumTagsSchema = z.object({
    forumChannelId: z.string()
});

export const UpdateForumPostSchema = z.object({
    threadId: z.string(),
    name: z.string().optional(),
    tags: z.array(z.string()).optional(),
    archived: z.boolean().optional(),
    locked: z.boolean().optional(),
    pinned: z.boolean().optional()
});

export const SetForumTagsSchema = z.object({
    forumChannelId: z.string().describe("The ID of the forum channel to set tags on."),
    tags: z.array(z.object({
        name: z.string().describe("Tag name."),
        emoji: z.string().describe("Unicode emoji for the tag (e.g. '🔬').").optional(),
        moderated: z.boolean().describe("Whether only moderators can apply this tag (default: false).").optional()
    }))
}).describe("Sets the available tags for a Discord forum channel. Replaces all existing tags.");

export const EditMessageSchema = z.object({
    channelId: z.string(),
    messageId: z.string(),
    content: z.string()
});

export const DeleteMessageSchema = z.object({
    channelId: z.string().describe("The ID of the channel containing the message to delete."),
    messageId: z.string().describe("The ID of the message to delete."),
    reason: z.string().describe("Optional reason for audit logs when deleting the message.").optional()
}).describe("Delete a message by its ID in a specified channel.");

export const PinMessageSchema = z.object({
    channelId: z.string().describe("The ID of the channel containing the message to pin."),
    messageId: z.string().describe("The ID of the message to pin."),
    reason: z.string().describe("Optional reason for audit logs when pinning the message.").optional()
}).describe("Pin a message to its channel. A channel can hold at most 50 pinned messages.");

export const UnpinMessageSchema = z.object({
    channelId: z.string().describe("The ID of the channel containing the message to unpin."),
    messageId: z.string().describe("The ID of the message to unpin."),
    reason: z.string().describe("Optional reason for audit logs when unpinning the message.").optional()
}).describe("Remove a message from its channel's pinned messages.");

export const ListPinnedMessagesSchema = z.object({
    channelId: z.string().describe("The ID of the channel to list pinned messages from."),
    limit: z.number().describe("Maximum number of pinned messages to return (1-50, default 50).").min(1).max(50).optional().default(50)
}).describe("List the pinned messages of a channel, newest pin first.");

export const CreateWebhookSchema = z.object({
    channelId: z.string().describe("The ID of the channel to create the webhook in."),
    name: z.string().describe("The name to assign to the webhook."),
    avatar: z.string().describe("Optional avatar URL or data for the webhook.").optional(),
    reason: z.string().describe("Optional reason for audit logs when creating the webhook.").optional()
}).describe("Create a webhook in a specified channel.");

export const SendWebhookMessageSchema = z.object({
    webhookId: z.string().describe("The ID of the webhook to send the message with."),
    webhookToken: z.string().describe("The token for the webhook (used for authentication)."),
    content: z.string().describe("The message content to send via the webhook."),
    username: z.string().describe("Optional username to display for the webhook message.").optional(),
    avatarURL: z.string().describe("Optional avatar URL to display for the webhook message.").optional(),
    threadId: z.string().describe("Optional ID of the thread to post the webhook message into.").optional()
}).describe("Send a message using a webhook.");

export const EditWebhookSchema = z.object({
    webhookId: z.string().describe("The ID of the webhook to edit."),
    webhookToken: z.string().describe("Optional token for the webhook if required to authorize edits.").optional(),
    name: z.string().describe("Optional new name for the webhook.").optional(),
    avatar: z.string().describe("Optional new avatar URL or data for the webhook.").optional(),
    channelId: z.string().describe("Optional channel ID to move the webhook to.").optional(),
    reason: z.string().describe("Optional reason for audit logs when editing the webhook.").optional()
}).describe("Edit a webhook's properties.");

export const DeleteWebhookSchema = z.object({
    webhookId: z.string().describe("The ID of the webhook to delete."),
    webhookToken: z.string().describe("Optional token for the webhook if required for deletion.").optional(),
    reason: z.string().describe("Optional reason for audit logs when deleting the webhook.").optional()
}).describe("Delete a webhook by its ID and token.");

export const ListServersSchema = z.object({}).describe("List all servers (guilds) the bot is a member of.");

// Role schemas
export const ListRolesSchema = z.object({
    guildId: z.string()
});

export const CreateRoleSchema = z.object({
    guildId: z.string(),
    name: z.string(),
    color: z.string().optional(),
    hoist: z.boolean().optional(),
    mentionable: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),
    reason: z.string().optional()
});

export const EditRoleSchema = z.object({
    guildId: z.string(),
    roleId: z.string(),
    name: z.string().optional(),
    color: z.string().optional(),
    hoist: z.boolean().optional(),
    mentionable: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),
    position: z.number().optional(),
    reason: z.string().optional()
});

export const DeleteRoleSchema = z.object({
    guildId: z.string(),
    roleId: z.string(),
    reason: z.string().optional()
});

export const AssignRoleSchema = z.object({
    guildId: z.string(),
    userId: z.string(),
    roleId: z.string(),
    reason: z.string().optional()
});

export const RemoveRoleSchema = z.object({
    guildId: z.string(),
    userId: z.string(),
    roleId: z.string(),
    reason: z.string().optional()
});

export const ListMembersSchema = z.object({
    guildId: z.string(),
    limit: z.number().min(1).max(1000).optional().default(100),
    after: z.string().optional()
});

export const GetMemberSchema = z.object({
    guildId: z.string(),
    userId: z.string()
});

export const SearchMembersSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) to search in."),
    query: z.string().min(1).describe("Start of a username or nickname (Discord matches prefixes, case-insensitive)."),
    limit: z.number().min(1).max(1000).optional().default(10).describe("Maximum number of members to return (default 10, max 1000).")
}).describe("Search server members by the start of their username or nickname.");

// Direct message schema
export const SendDirectMessageSchema = z.object({
    guildId: z.string().describe("The server (guild) the recipient must be a member of."),
    userId: z.string().describe("The ID of the user to send the direct message to."),
    message: z.string().min(1).max(2000).describe("The content of the direct message (max 2000 characters).")
}).describe("Send a direct message to a member of a server the bot is in.");

// Scheduled event schemas
export const CreateScheduledEventSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) to create the event in."),
    name: z.string().min(1).max(100).describe("Name of the event."),
    startTime: z.string().datetime({ offset: true }).describe("Start time as ISO 8601, e.g. 2026-11-20T18:00:00+01:00."),
    endTime: z.string().datetime({ offset: true }).optional().describe("End time as ISO 8601. Required for external events."),
    description: z.string().max(1000).optional().describe("Description of the event."),
    entityType: z.enum(["voice", "external"]).describe("voice = in a voice channel of the server, external = somewhere else (link or place)."),
    channelId: z.string().optional().describe("Voice channel ID. Required for voice events."),
    location: z.string().max(100).optional().describe("Location or link. Required for external events."),
    reason: z.string().optional().describe("Optional reason for audit logs.")
}).superRefine((value, ctx) => {
    if (value.entityType === "voice" && !value.channelId) {
        ctx.addIssue({ code: "custom", path: ["channelId"], message: "channelId is required for voice events" });
    }
    if (value.entityType === "external" && !value.location) {
        ctx.addIssue({ code: "custom", path: ["location"], message: "location is required for external events" });
    }
    if (value.entityType === "external" && !value.endTime) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "endTime is required for external events" });
    }
    if (value.endTime && Date.parse(value.endTime) <= Date.parse(value.startTime)) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "endTime must be after startTime" });
    }
}).describe("Create a scheduled event in a server, in a voice channel or at an external location.");

export const ListScheduledEventsSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) to list events for.")
}).describe("List the scheduled events of a server.");

export const DeleteScheduledEventSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) the event belongs to."),
    eventId: z.string().describe("The ID of the scheduled event to delete.")
}).describe("Delete a scheduled event.");

// Channel permission schemas
export const SetChannelPermissionsSchema = z.object({
    channelId: z.string(),
    roleId: z.string(),
    allow: z.array(z.string()).optional(),
    deny: z.array(z.string()).optional(),
    reason: z.string().optional()
});

export const RemoveChannelPermissionsSchema = z.object({
    channelId: z.string(),
    roleId: z.string(),
    reason: z.string().optional()
});

// Voice channel schema
export const CreateVoiceChannelSchema = z.object({
    guildId: z.string(),
    channelName: z.string(),
    categoryId: z.string().optional(),
    userLimit: z.number().min(0).max(99).optional(),
    reason: z.string().optional()
});

export const SearchMessagesSchema = z.object({
    guildId: z.string().describe("The ID of the server (guild) to search in.").min(1, "guildId is required"),
    // Optional filters
    content: z.string().describe("Search for messages that contain this text.").optional(),
    authorId: z.string().describe("Filter messages to those authored by this user ID.").optional(),
    mentions: z.string().describe("Filter messages that mention a specific user or role ID.").optional(),
    has: z.enum(['link', 'embed', 'file', 'poll', 'image', 'video', 'sound', 'sticker', 'snapshot']).describe("Filter messages that contain a specific type of content.").optional(),
    maxId: z.string().describe("Only include messages with IDs less than or equal to this (pagination).").optional(),
    minId: z.string().describe("Only include messages with IDs greater than or equal to this (pagination).").optional(),
    channelId: z.string().describe("If provided, restrict search to a specific channel ID.").optional(),
    pinned: z.boolean().describe("If true, only include pinned messages; if false, only include unpinned; if omitted, include both.").optional(),
    authorType: z.enum(['user', 'bot', 'webhook']).describe("Filter by the type of author (user, bot, or webhook).").optional(),
    sortBy: z.enum(['timestamp', 'relevance']).describe("Field to sort search results by.").optional(),
    sortOrder: z.enum(['desc', 'asc']).describe("Sort direction for results.").optional(),
    limit: z.number().describe("Number of results to return (1-100).").min(1).max(100).default(25).optional(),
    offset: z.number().describe("Number of results to skip (for pagination).").min(0).default(0).optional()
}).describe("Search messages in a server with various filters.");
