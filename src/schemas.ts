import { z } from "zod";

export const DiscordLoginSchema = z.object({
    token: z.string().optional()
});

export const SendMessageSchema = z.object({
    channelId: z.string(),
    message: z.string(),
    replyToMessageId: z.string().optional()
});

export const GetForumChannelsSchema = z.object({
    guildId: z.string()
});

export const CreateForumPostSchema = z.object({
    forumChannelId: z.string(),
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()).optional()
});

export const GetForumPostSchema = z.object({
    threadId: z.string()
});

export const ReplyToForumSchema = z.object({
    threadId: z.string(),
    message: z.string()
});

export const CreateTextChannelSchema = z.object({
    guildId: z.string(),
    channelName: z.string(),
    topic: z.string().optional(),
    reason: z.string().optional()
});

// Category schemas
export const CreateCategorySchema = z.object({
    guildId: z.string(),
    name: z.string(),
    position: z.number().optional(),
    reason: z.string().optional()
});

export const EditCategorySchema = z.object({
    categoryId: z.string(),
    name: z.string().optional(),
    position: z.number().optional(),
    reason: z.string().optional()
});

export const DeleteCategorySchema = z.object({
    categoryId: z.string(),
    reason: z.string().optional()
});

export const DeleteChannelSchema = z.object({
    channelId: z.string(),
    reason: z.string().optional()
});

export const ReadMessagesSchema = z.object({
    channelId: z.string(),
    limit: z.number().min(1).max(100).optional().default(50)
});

export const GetServerInfoSchema = z.object({
    guildId: z.string()
});

export const AddReactionSchema = z.object({
    channelId: z.string(),
    messageId: z.string(),
    emoji: z.string()
});

export const AddMultipleReactionsSchema = z.object({
    channelId: z.string(),
    messageId: z.string(),
    emojis: z.array(z.string())
});

export const RemoveReactionSchema = z.object({
    channelId: z.string(),
    messageId: z.string(),
    emoji: z.string(),
    userId: z.string().optional()
});

export const DeleteForumPostSchema = z.object({
    threadId: z.string(),
    reason: z.string().optional()
});

export const DeleteMessageSchema = z.object({
    channelId: z.string(),
    messageId: z.string(),
    reason: z.string().optional()
});

export const CreateWebhookSchema = z.object({
    channelId: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
    reason: z.string().optional()
});

export const SendWebhookMessageSchema = z.object({
    webhookId: z.string(),
    webhookToken: z.string(),
    content: z.string(),
    username: z.string().optional(),
    avatarURL: z.string().optional(),
    threadId: z.string().optional()
});

export const EditWebhookSchema = z.object({
    webhookId: z.string(),
    webhookToken: z.string().optional(),
    name: z.string().optional(),
    avatar: z.string().optional(),
    channelId: z.string().optional(),
    reason: z.string().optional()
});

export const DeleteWebhookSchema = z.object({
    webhookId: z.string(),
    webhookToken: z.string().optional(),
    reason: z.string().optional()
});

export const ListServersSchema = z.object({});

export const SearchMessagesSchema = z.object({
    guildId: z.string().min(1, "guildId is required"),
    // Optional filters
    content: z.string().optional(),
    authorId: z.string().optional(),
    mentions: z.string().optional(),
    has: z.enum(['link', 'embed', 'file', 'poll', 'image', 'video', 'sound', 'sticker', 'snapshot']).optional(),
    maxId: z.string().optional(),
    minId: z.string().optional(),
    channelId: z.string().optional(),
    pinned: z.boolean().optional(),
    authorType: z.enum(['user', 'bot', 'webhook']).optional(),
    sortBy: z.enum(['timestamp', 'relevance']).optional(),
    sortOrder: z.enum(['desc', 'asc']).optional(),
    limit: z.number().min(1).max(100).default(25).optional(),
    offset: z.number().min(0).default(0).optional()
});

// Bot presence/status schemas
export const SetPresenceSchema = z.object({
    status: z.enum(["online", "idle", "dnd", "invisible"], { description: "The presence status to set." }),
    afk: z.boolean({
        description: "Whether I am AFK.",
    }).optional(),
    activities: z.object({
        type: z.enum(
            ["PLAYING", "STREAMING", "LISTENING", "WATCHING", "COMPETING", "CUSTOM"],
            { description: "The type of activity." }),
        name: z.string(
            { description: "The name of the activity." }
        ),
        url: z.string(
            { description: "The URL for the activity (only for STREAMING type)." }
        ).optional()
    }).optional()
});

export const SetNicknameSchema = z.object({
    guildId: z.string({
        description: "The ID of the server where to set the nickname."
    }).min(1, "guildId is required"),
    nick: z.string({
        description: "The nickname to set (leave empty to reset)."
    }).optional()
});

export const SetAboutMeSchema = z.object({
    aboutMe: z.string({
        description: "The global 'About Me' section content."
    })
});

export const SetBioSchema = z.object({
    guildId: z.string({
        description: "The ID of the server where to set the bio."
    }).min(1, "guildId is required"),
    bio: z.string({
        description: "The 'Bio' section content to set for the bot in the specified server."
    }).optional()
}, {
    description: "Schema for setting the 'Bio' section in a specific server."
});

