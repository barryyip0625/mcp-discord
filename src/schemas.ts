import { z } from "zod";

export const DiscordLoginSchema = z.object({
    token: z.string({ description: "The bot token to use for login." }).optional()
}, {
    description: "Login to Discord using a bot token. If no token is provided, the bot will attempt to use the token from the environment variable DISCORD_TOKEN."
});

export const SendMessageSchema = z.object({
    channelId: z.string({ description: "The ID of the channel to send the message to." }),
    message: z.string({ description: "The content of the message to send." }),
    replyToMessageId: z.string({ description: "The ID of the message to reply to, if any." }).optional()
}, {
    description: "Send a message to a specified channel, optionally as a reply to another message."
});

export const GetForumChannelsSchema = z.object({
    guildId: z.string({ description: "The ID of the server (guild) to get forum channels from." })
}, {
    description: "Get all forum channels in a specified server (guild)."
});

export const CreateForumPostSchema = z.object({
    forumChannelId: z.string({ description: "The ID of the forum channel where the thread will be created." }),
    title: z.string({ description: "The title of the forum post (thread)." }),
    content: z.string({ description: "The body content of the forum post." }),
    tags: z.array(z.string({ description: "A tag to attach to the forum post." })).optional()
}, {
    description: "Create a new forum post (thread) in a specified forum channel."
});

export const GetForumPostSchema = z.object({
    threadId: z.string({ description: "The ID of the forum thread to retrieve." })
}, {
    description: "Get details of a specific forum post (thread) by its ID."
});

export const ListForumThreadsSchema = z.object({
    forumChannelId: z.string(),
    includeArchived: z.boolean().optional().default(true),
    limit: z.number().min(1).max(100).optional().default(100)
});

export const ReplyToForumSchema = z.object({
    threadId: z.string({ description: "The ID of the forum thread to reply to." }),
    message: z.string({ description: "The content of the reply message." })
}, {
    description: "Reply to a specific forum post (thread) by its ID."
});

export const CreateTextChannelSchema = z.object({
    guildId: z.string(),
    channelName: z.string(),
    topic: z.string().optional(),
    categoryId: z.string().optional(),
    reason: z.string().optional()
});

export const CreateForumChannelSchema = z.object({
    guildId: z.string({ description: "The ID of the server (guild) to create the forum channel in." }),
    name: z.string({ description: "The name of the forum channel to create." }),
    topic: z.string({ description: "The forum channel guidelines/description." }).optional(),
    categoryId: z.string({ description: "The ID of the parent category to create the channel under." }).optional(),
    reason: z.string({ description: "Optional reason for audit logs." }).optional()
}, {
    description: "Create a new forum channel in a specified server (guild), optionally under a category."
});

export const EditChannelSchema = z.object({
    channelId: z.string({ description: "The ID of the channel to edit." }),
    name: z.string({ description: "New name for the channel." }).optional(),
    topic: z.string({ description: "New topic for the channel." }).optional(),
    parentId: z.string({ description: "The ID of a category to move the channel under." }).optional(),
    position: z.number({ description: "New position of the channel in the list." }).optional(),
    reason: z.string({ description: "Optional reason for audit logs." }).optional()
}, {
    description: "Edit a Discord channel's name, topic, parent category, or position."
});

// Category schemas
export const CreateCategorySchema = z.object({
    guildId: z.string({ description: "The ID of the server (guild) where the category will be created." }),
    name: z.string({ description: "The name of the category to create." }),
    position: z.number({ description: "Optional sorting position index for the category." }).optional(),
    reason: z.string({ description: "Optional reason for audit logs when creating the category." }).optional()
}, {
    description: "Create a new category in a specified server (guild)."
});

export const EditCategorySchema = z.object({
    categoryId: z.string({ description: "The ID of the category to edit." }),
    name: z.string({ description: "New name for the category (optional)." }).optional(),
    position: z.number({ description: "New position index for the category (optional)." }).optional(),
    reason: z.string({ description: "Optional reason for audit logs when editing the category." }).optional()
}, {
    description: "Edit an existing category's properties."
});

export const DeleteCategorySchema = z.object({
    categoryId: z.string({ description: "The ID of the category to delete." }),
    reason: z.string({ description: "Optional reason for audit logs when deleting the category." }).optional()
}, {
    description: "Delete a category by its ID."
});

export const DeleteChannelSchema = z.object({
    channelId: z.string({ description: "The ID of the channel to delete." }),
    reason: z.string({ description: "Optional reason for audit logs when deleting the channel." }).optional()
}, {
    description: "Delete a channel by its ID."
});

export const ReadMessagesSchema = z.object({
    channelId: z.string({ description: "The ID of the channel to read messages from." }),
    limit: z.number({ description: "How many recent messages to fetch (1-100)." }).min(1).max(100).optional().default(50),
    before: z.string({ description: "Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages before this point." }).optional(),
    after: z.string({ description: "Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages after this point." }).optional(),
    around: z.string({ description: "Snowflake ID or ISO 8601 date (e.g. '2025-03-01T00:00:00Z'). Get messages around this point." }).optional(),
}).refine(
    (data) => [data.before, data.after, data.around].filter(Boolean).length <= 1,
    { message: "Only one of 'before', 'after', or 'around' can be specified." }
);

export const GetServerInfoSchema = z.object({
    guildId: z.string({ description: "The ID of the server (guild) to get information for." })
}, {
    description: "Get information about a specific server (guild) by its ID."
});

export const AddReactionSchema = z.object({
    channelId: z.string({ description: "The ID of the channel containing the message to react to." }),
    messageId: z.string({ description: "The ID of the message to add a reaction to." }),
    emoji: z.string({ description: "The emoji to use for the reaction (unicode or custom)." })
}, {
    description: "Add a reaction to a specific message in a channel."
});

export const AddMultipleReactionsSchema = z.object({
    channelId: z.string({ description: "The ID of the channel containing the message to react to." }),
    messageId: z.string({ description: "The ID of the message to add reactions to." }),
    emojis: z.array(z.string({ description: "An emoji to add (unicode or custom)." }))
}, {
    description: "Add multiple reactions to a specific message in a channel."
});

export const RemoveReactionSchema = z.object({
    channelId: z.string({ description: "The ID of the channel containing the message to modify reactions on." }),
    messageId: z.string({ description: "The ID of the message to remove the reaction from." }),
    emoji: z.string({ description: "The emoji reaction to remove." }),
    userId: z.string({ description: "Optional ID of the user whose reaction should be removed; if omitted, removes the current bot's reaction." }).optional()
}, {
    description: "Remove a reaction from a specific message in a channel."
});

export const DeleteForumPostSchema = z.object({
    threadId: z.string({ description: "The ID of the forum thread to delete." }),
    reason: z.string({ description: "Optional reason for audit logs when deleting the forum post." }).optional()
}, {
    description: "Delete a forum post (thread) by its ID."
});

export const GetForumTagsSchema = z.object({
    forumChannelId: z.string()
});

export const UpdateForumPostSchema = z.object({
    threadId: z.string(),
    name: z.string().optional(),
    tags: z.array(z.string()).optional(),
    archived: z.boolean().optional(),
    locked: z.boolean().optional()
});

export const SetForumTagsSchema = z.object({
    forumChannelId: z.string({ description: "The ID of the forum channel to set tags on." }),
    tags: z.array(z.object({
        name: z.string({ description: "Tag name." }),
        emoji: z.string({ description: "Unicode emoji for the tag (e.g. '🔬')." }).optional(),
        moderated: z.boolean({ description: "Whether only moderators can apply this tag (default: false)." }).optional()
    }))
}, {
    description: "Sets the available tags for a Discord forum channel. Replaces all existing tags."
});

export const EditMessageSchema = z.object({
    channelId: z.string(),
    messageId: z.string(),
    content: z.string()
});

export const DeleteMessageSchema = z.object({
    channelId: z.string({ description: "The ID of the channel containing the message to delete." }),
    messageId: z.string({ description: "The ID of the message to delete." }),
    reason: z.string({ description: "Optional reason for audit logs when deleting the message." }).optional()
}, {
    description: "Delete a message by its ID in a specified channel."
});

export const CreateWebhookSchema = z.object({
    channelId: z.string({ description: "The ID of the channel to create the webhook in." }),
    name: z.string({ description: "The name to assign to the webhook." }),
    avatar: z.string({ description: "Optional avatar URL or data for the webhook." }).optional(),
    reason: z.string({ description: "Optional reason for audit logs when creating the webhook." }).optional()
}, {
    description: "Create a webhook in a specified channel."
});

export const SendWebhookMessageSchema = z.object({
    webhookId: z.string({ description: "The ID of the webhook to send the message with." }),
    webhookToken: z.string({ description: "The token for the webhook (used for authentication)." }),
    content: z.string({ description: "The message content to send via the webhook." }),
    username: z.string({ description: "Optional username to display for the webhook message." }).optional(),
    avatarURL: z.string({ description: "Optional avatar URL to display for the webhook message." }).optional(),
    threadId: z.string({ description: "Optional ID of the thread to post the webhook message into." }).optional()
}, {
    description: "Send a message using a webhook."
});

export const EditWebhookSchema = z.object({
    webhookId: z.string({ description: "The ID of the webhook to edit." }),
    webhookToken: z.string({ description: "Optional token for the webhook if required to authorize edits." }).optional(),
    name: z.string({ description: "Optional new name for the webhook." }).optional(),
    avatar: z.string({ description: "Optional new avatar URL or data for the webhook." }).optional(),
    channelId: z.string({ description: "Optional channel ID to move the webhook to." }).optional(),
    reason: z.string({ description: "Optional reason for audit logs when editing the webhook." }).optional()
}, {
    description: "Edit a webhook's properties."
});

export const DeleteWebhookSchema = z.object({
    webhookId: z.string({ description: "The ID of the webhook to delete." }),
    webhookToken: z.string({ description: "Optional token for the webhook if required for deletion." }).optional(),
    reason: z.string({ description: "Optional reason for audit logs when deleting the webhook." }).optional()
}, {
    description: "Delete a webhook by its ID and token."
});

export const ListServersSchema = z.object({}, {
    description: "List all servers (guilds) the bot is a member of."
});

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
    guildId: z.string({ description: "The ID of the server (guild) to search in." }).min(1, "guildId is required"),
    // Optional filters
    content: z.string({ description: "Search for messages that contain this text." }).optional(),
    authorId: z.string({ description: "Filter messages to those authored by this user ID." }).optional(),
    mentions: z.string({ description: "Filter messages that mention a specific user or role ID." }).optional(),
    has: z.enum(['link', 'embed', 'file', 'poll', 'image', 'video', 'sound', 'sticker', 'snapshot'], { description: "Filter messages that contain a specific type of content." }).optional(),
    maxId: z.string({ description: "Only include messages with IDs less than or equal to this (pagination)." }).optional(),
    minId: z.string({ description: "Only include messages with IDs greater than or equal to this (pagination)." }).optional(),
    channelId: z.string({ description: "If provided, restrict search to a specific channel ID." }).optional(),
    pinned: z.boolean({ description: "If true, only include pinned messages; if false, only include unpinned; if omitted, include both." }).optional(),
    authorType: z.enum(['user', 'bot', 'webhook'], { description: "Filter by the type of author (user, bot, or webhook)." }).optional(),
    sortBy: z.enum(['timestamp', 'relevance'], { description: "Field to sort search results by." }).optional(),
    sortOrder: z.enum(['desc', 'asc'], { description: "Sort direction for results." }).optional(),
    limit: z.number({ description: "Number of results to return (1-100)." }).min(1).max(100).default(25).optional(),
    offset: z.number({ description: "Number of results to skip (for pagination)." }).min(0).default(0).optional()
}, {
    description: "Search messages in a server with various filters."
});
