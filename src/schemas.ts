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

export const ListForumThreadsSchema = z.object({
    forumChannelId: z.string(),
    includeArchived: z.boolean().optional().default(true),
    limit: z.number().min(1).max(100).optional().default(100)
});

export const ReplyToForumSchema = z.object({
    threadId: z.string(),
    message: z.string()
});

export const CreateTextChannelSchema = z.object({
    guildId: z.string(),
    channelName: z.string(),
    topic: z.string().optional(),
    categoryId: z.string().optional(),
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
  guildId: z.string().min(1, "guildId is required"),
  // Optional filters
  content: z.string().optional(),
  authorId: z.string().optional(),
  mentions: z.string().optional(),
  has: z.enum(['link','embed','file','poll','image','video','sound','sticker','snapshot']).optional(),
  maxId: z.string().optional(),
  minId: z.string().optional(),
  channelId: z.string().optional(),
  pinned: z.boolean().optional(),
  authorType: z.enum(['user','bot','webhook']).optional(),
  sortBy: z.enum(['timestamp','relevance']).optional(),
  sortOrder: z.enum(['desc','asc']).optional(),
  limit: z.number().min(1).max(100).default(25).optional(),
  offset: z.number().min(0).default(0).optional()
});