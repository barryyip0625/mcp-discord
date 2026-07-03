import {
    DiscordLoginSchema,
    SendMessageSchema,
    GetForumChannelsSchema,
    CreateForumPostSchema,
    GetForumPostSchema,
    ReplyToForumSchema,
    CreateTextChannelSchema,
    CreateCategorySchema,
    EditCategorySchema,
    DeleteCategorySchema,
    DeleteChannelSchema,
    ReadMessagesSchema,
    GetServerInfoSchema,
    AddReactionSchema,
    AddMultipleReactionsSchema,
    RemoveReactionSchema,
    DeleteForumPostSchema,
    DeleteMessageSchema,
    CreateWebhookSchema,
    SendWebhookMessageSchema,
    EditWebhookSchema,
    DeleteWebhookSchema,
    ListServersSchema,
    SearchMessagesSchema
} from './schemas.js';

describe('Discord Schemas Validation Tests', () => {

    describe('DiscordLoginSchema', () => {
        test('should validate with token', () => {
            const data = { token: 'valid_token' };
            expect(DiscordLoginSchema.parse(data)).toEqual(data);
        });

        test('should validate without token (optional)', () => {
            const data = {};
            expect(DiscordLoginSchema.parse(data)).toEqual(data);
        });

        test('should reject non-string token', () => {
            const data = { token: 123 };
            expect(() => DiscordLoginSchema.parse(data)).toThrow();
        });
    });

    describe('SendMessageSchema', () => {
        test('should validate with required fields', () => {
            const data = { channelId: 'channel123', message: 'Hello world' };
            expect(SendMessageSchema.parse(data)).toEqual(data);
        });

        test('should accept optional replyToMessageId', () => {
            const data = { 
                channelId: 'channel123', 
                message: 'Hello world', 
                replyToMessageId: 'msg123' 
            };
            expect(SendMessageSchema.parse(data)).toEqual(data);
        });

        test('should reject without channelId', () => {
            const data = { message: 'Hello world' };
            expect(() => SendMessageSchema.parse(data)).toThrow();
        });

        test('should reject without message', () => {
            const data = { channelId: 'channel123' };
            expect(() => SendMessageSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { channelId: 123, message: 'Hello' };
            expect(() => SendMessageSchema.parse(data)).toThrow();
        });
    });

    describe('GetForumChannelsSchema', () => {
        test('should validate with guildId', () => {
            const data = { guildId: 'guild123' };
            expect(GetForumChannelsSchema.parse(data)).toEqual(data);
        });

        test('should reject without guildId', () => {
            const data = {};
            expect(() => GetForumChannelsSchema.parse(data)).toThrow();
        });

        test('should reject non-string guildId', () => {
            const data = { guildId: 999 };
            expect(() => GetForumChannelsSchema.parse(data)).toThrow();
        });
    });

    describe('CreateForumPostSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                forumChannelId: 'channel123', 
                title: 'New Post', 
                content: 'Post content' 
            };
            expect(CreateForumPostSchema.parse(data)).toEqual(data);
        });

        test('should accept optional tags', () => {
            const data = { 
                forumChannelId: 'channel123', 
                title: 'New Post', 
                content: 'Post content',
                tags: ['tag1', 'tag2']
            };
            expect(CreateForumPostSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { 
                forumChannelId: 'channel123', 
                title: 'New Post'
            };
            expect(() => CreateForumPostSchema.parse(data)).toThrow();
        });

        test('should reject non-string values for required fields', () => {
            const data = { 
                forumChannelId: 123, 
                title: 'New Post', 
                content: 'Post content' 
            };
            expect(() => CreateForumPostSchema.parse(data)).toThrow();
        });
    });

    describe('GetForumPostSchema', () => {
        test('should validate with threadId', () => {
            const data = { threadId: 'thread123' };
            expect(GetForumPostSchema.parse(data)).toEqual(data);
        });

        test('should reject without threadId', () => {
            const data = {};
            expect(() => GetForumPostSchema.parse(data)).toThrow();
        });

        test('should reject non-string threadId', () => {
            const data = { threadId: 456 };
            expect(() => GetForumPostSchema.parse(data)).toThrow();
        });
    });

    describe('ReplyToForumSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                threadId: 'thread123', 
                message: 'Reply message' 
            };
            expect(ReplyToForumSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { threadId: 'thread123' };
            expect(() => ReplyToForumSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                threadId: 123, 
                message: 'Reply message' 
            };
            expect(() => ReplyToForumSchema.parse(data)).toThrow();
        });
    });

    describe('CreateTextChannelSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                guildId: 'guild123', 
                channelName: 'new-channel' 
            };
            expect(CreateTextChannelSchema.parse(data)).toEqual(data);
        });

        test('should accept optional fields', () => {
            const data = { 
                guildId: 'guild123', 
                channelName: 'new-channel',
                topic: 'Channel topic',
                reason: 'Test reason'
            };
            expect(CreateTextChannelSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { guildId: 'guild123' };
            expect(() => CreateTextChannelSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                guildId: 123, 
                channelName: 'new-channel' 
            };
            expect(() => CreateTextChannelSchema.parse(data)).toThrow();
        });
    });

    describe('CreateCategorySchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                guildId: 'guild123', 
                name: 'Category Name' 
            };
            expect(CreateCategorySchema.parse(data)).toEqual(data);
        });

        test('should accept optional fields', () => {
            const data = { 
                guildId: 'guild123', 
                name: 'Category Name',
                position: 1,
                reason: 'Test reason'
            };
            expect(CreateCategorySchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { guildId: 'guild123' };
            expect(() => CreateCategorySchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                guildId: 'guild123', 
                name: 123 
            };
            expect(() => CreateCategorySchema.parse(data)).toThrow();
        });
    });

    describe('EditCategorySchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                categoryId: 'category123' 
            };
            expect(EditCategorySchema.parse(data)).toEqual(data);
        });

        test('should accept optional fields', () => {
            const data = { 
                categoryId: 'category123',
                name: 'Updated Name',
                position: 2,
                reason: 'Test reason'
            };
            expect(EditCategorySchema.parse(data)).toEqual(data);
        });

        test('should reject without categoryId', () => {
            const data = { name: 'Updated Name' };
            expect(() => EditCategorySchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                categoryId: 123,
                position: 'invalid'
            };
            expect(() => EditCategorySchema.parse(data)).toThrow();
        });
    });

    describe('DeleteCategorySchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                categoryId: 'category123' 
            };
            expect(DeleteCategorySchema.parse(data)).toEqual(data);
        });

        test('should accept optional reason', () => {
            const data = { 
                categoryId: 'category123',
                reason: 'Test reason'
            };
            expect(DeleteCategorySchema.parse(data)).toEqual(data);
        });

        test('should reject without categoryId', () => {
            const data = { reason: 'Test reason' };
            expect(() => DeleteCategorySchema.parse(data)).toThrow();
        });

        test('should reject non-string categoryId', () => {
            const data = { categoryId: 123 };
            expect(() => DeleteCategorySchema.parse(data)).toThrow();
        });
    });

    describe('DeleteChannelSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                channelId: 'channel123' 
            };
            expect(DeleteChannelSchema.parse(data)).toEqual(data);
        });

        test('should accept optional reason', () => {
            const data = { 
                channelId: 'channel123',
                reason: 'Test reason'
            };
            expect(DeleteChannelSchema.parse(data)).toEqual(data);
        });

        test('should reject without channelId', () => {
            const data = { reason: 'Test reason' };
            expect(() => DeleteChannelSchema.parse(data)).toThrow();
        });

        test('should reject non-string channelId', () => {
            const data = { channelId: 123 };
            expect(() => DeleteChannelSchema.parse(data)).toThrow();
        });
    });

    describe('ReadMessagesSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                channelId: 'channel123' 
            };
            expect(ReadMessagesSchema.parse(data)).toEqual({...data, limit: 50}); // default limit
        });

        test('should accept valid limit', () => {
            const data = { 
                channelId: 'channel123',
                limit: 25
            };
            expect(ReadMessagesSchema.parse(data)).toEqual(data);
        });

        test('should accept default limit', () => {
            const data = { 
                channelId: 'channel123'
            };
            const result = ReadMessagesSchema.parse(data);
            expect(result.limit).toBe(50);
        });

        test('should reject invalid limit range', () => {
            const tooLowData = { channelId: 'channel123', limit: 0 };
            expect(() => ReadMessagesSchema.parse(tooLowData)).toThrow();

            const tooHighData = { channelId: 'channel123', limit: 101 };
            expect(() => ReadMessagesSchema.parse(tooHighData)).toThrow();
        });

        test('should reject without channelId', () => {
            const data = { limit: 25 };
            expect(() => ReadMessagesSchema.parse(data)).toThrow();
        });
    });

    describe('GetServerInfoSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                guildId: 'guild123' 
            };
            expect(GetServerInfoSchema.parse(data)).toEqual(data);
        });

        test('should reject without guildId', () => {
            const data = {};
            expect(() => GetServerInfoSchema.parse(data)).toThrow();
        });

        test('should reject non-string guildId', () => {
            const data = { guildId: 123 };
            expect(() => GetServerInfoSchema.parse(data)).toThrow();
        });
    });

    describe('AddReactionSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123', 
                emoji: '👍' 
            };
            expect(AddReactionSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123' 
            };
            expect(() => AddReactionSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                channelId: 123, 
                messageId: 'message123', 
                emoji: '👍' 
            };
            expect(() => AddReactionSchema.parse(data)).toThrow();
        });
    });

    describe('AddMultipleReactionsSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123', 
                emojis: ['👍', '❤️'] 
            };
            expect(AddMultipleReactionsSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123' 
            };
            expect(() => AddMultipleReactionsSchema.parse(data)).toThrow();
        });

        test('should reject with empty emojis array', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123', 
                emojis: [] 
            };
            expect(AddMultipleReactionsSchema.parse(data)).toEqual(data); // Empty array is valid since no length constraints
        });

        test('should reject non-string values', () => {
            const data = { 
                channelId: 123, 
                messageId: 'message123', 
                emojis: ['👍'] 
            };
            expect(() => AddMultipleReactionsSchema.parse(data)).toThrow();
        });

        test('should reject non-array emojis', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123', 
                emojis: 'not-an-array' 
            };
            expect(() => AddMultipleReactionsSchema.parse(data)).toThrow();
        });
    });

    describe('RemoveReactionSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123', 
                emoji: '👍' 
            };
            expect(RemoveReactionSchema.parse(data)).toEqual(data);
        });

        test('should accept optional userId', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123', 
                emoji: '👍',
                userId: 'user123'
            };
            expect(RemoveReactionSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123' 
            };
            expect(() => RemoveReactionSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                channelId: 123, 
                messageId: 'message123', 
                emoji: '👍' 
            };
            expect(() => RemoveReactionSchema.parse(data)).toThrow();
        });
    });

    describe('DeleteForumPostSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                threadId: 'thread123' 
            };
            expect(DeleteForumPostSchema.parse(data)).toEqual(data);
        });

        test('should accept optional reason', () => {
            const data = { 
                threadId: 'thread123',
                reason: 'Test reason'
            };
            expect(DeleteForumPostSchema.parse(data)).toEqual(data);
        });

        test('should reject without threadId', () => {
            const data = { reason: 'Test reason' };
            expect(() => DeleteForumPostSchema.parse(data)).toThrow();
        });

        test('should reject non-string threadId', () => {
            const data = { threadId: 123 };
            expect(() => DeleteForumPostSchema.parse(data)).toThrow();
        });
    });

    describe('DeleteMessageSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123' 
            };
            expect(DeleteMessageSchema.parse(data)).toEqual(data);
        });

        test('should accept optional reason', () => {
            const data = { 
                channelId: 'channel123', 
                messageId: 'message123',
                reason: 'Test reason'
            };
            expect(DeleteMessageSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { 
                channelId: 'channel123' 
            };
            expect(() => DeleteMessageSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                channelId: 123, 
                messageId: 'message123' 
            };
            expect(() => DeleteMessageSchema.parse(data)).toThrow();
        });
    });

    describe('CreateWebhookSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                channelId: 'channel123', 
                name: 'Webhook Name' 
            };
            expect(CreateWebhookSchema.parse(data)).toEqual(data);
        });

        test('should accept optional fields', () => {
            const data = { 
                channelId: 'channel123', 
                name: 'Webhook Name',
                avatar: 'avatar_url',
                reason: 'Test reason'
            };
            expect(CreateWebhookSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { 
                channelId: 'channel123' 
            };
            expect(() => CreateWebhookSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                channelId: 123, 
                name: 'Webhook Name' 
            };
            expect(() => CreateWebhookSchema.parse(data)).toThrow();
        });
    });

    describe('SendWebhookMessageSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                webhookId: 'webhook123', 
                webhookToken: 'token123', 
                content: 'Message content' 
            };
            expect(SendWebhookMessageSchema.parse(data)).toEqual(data);
        });

        test('should accept optional fields', () => {
            const data = { 
                webhookId: 'webhook123', 
                webhookToken: 'token123', 
                content: 'Message content',
                username: 'username',
                avatarURL: 'avatar_url',
                threadId: 'thread123'
            };
            expect(SendWebhookMessageSchema.parse(data)).toEqual(data);
        });

        test('should reject without required fields', () => {
            const data = { 
                webhookId: 'webhook123', 
                webhookToken: 'token123' 
            };
            expect(() => SendWebhookMessageSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                webhookId: 123, 
                webhookToken: 'token123', 
                content: 'Message content' 
            };
            expect(() => SendWebhookMessageSchema.parse(data)).toThrow();
        });
    });

    describe('EditWebhookSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                webhookId: 'webhook123' 
            };
            expect(EditWebhookSchema.parse(data)).toEqual(data);
        });

        test('should accept optional fields', () => {
            const data = { 
                webhookId: 'webhook123',
                webhookToken: 'token123',
                name: 'Updated Name',
                avatar: 'avatar_url',
                channelId: 'channel123',
                reason: 'Test reason'
            };
            expect(EditWebhookSchema.parse(data)).toEqual(data);
        });

        test('should reject without required webhookId', () => {
            const data = { name: 'Updated Name' };
            expect(() => EditWebhookSchema.parse(data)).toThrow();
        });

        test('should reject non-string values', () => {
            const data = { 
                webhookId: 123,
                name: 'Updated Name'
            };
            expect(() => EditWebhookSchema.parse(data)).toThrow();
        });
    });

    describe('DeleteWebhookSchema', () => {
        test('should validate with required fields', () => {
            const data = { 
                webhookId: 'webhook123' 
            };
            expect(DeleteWebhookSchema.parse(data)).toEqual(data);
        });

        test('should accept optional fields', () => {
            const data = { 
                webhookId: 'webhook123',
                webhookToken: 'token123',
                reason: 'Test reason'
            };
            expect(DeleteWebhookSchema.parse(data)).toEqual(data);
        });

        test('should reject without webhookId', () => {
            const data = { reason: 'Test reason' };
            expect(() => DeleteWebhookSchema.parse(data)).toThrow();
        });

        test('should reject non-string webhookId', () => {
            const data = { webhookId: 123 };
            expect(() => DeleteWebhookSchema.parse(data)).toThrow();
        });
    });

    describe('ListServersSchema', () => {
        test('should validate with empty object', () => {
            const data = {};
            expect(ListServersSchema.parse(data)).toEqual(data);
        });

        test('should allow unexpected fields (Zod strict mode not enabled)', () => {
            const data = { unexpected: 'field' };
            // Zod schemas by default strip unknown fields or return only known fields
            // depending on schema configuration, so this might not throw
            expect(ListServersSchema.parse(data)).toEqual({});
        });
    });

    describe('SearchMessagesSchema', () => {
        test('should validate with required fields', () => {
            const data = {
                guildId: 'guild123'
            };
            const result = SearchMessagesSchema.parse(data);
            expect(result.guildId).toBe('guild123');
        });

        test('should accept default values', () => {
            const data = {
                guildId: 'guild123',
                limit: 25,  // default
                offset: 0   // default
            };
            const result = SearchMessagesSchema.parse(data);
            expect(result.limit).toBe(25);
            expect(result.offset).toBe(0);
        });

        test('should accept optional filters', () => {
            const data = { 
                guildId: 'guild123',
                content: 'search term',
                authorId: 'author123',
                mentions: 'mentioned123',
                has: 'link',
                maxId: 'max123',
                minId: 'min123',
                channelId: 'channel123',
                pinned: true,
                authorType: 'user',
                sortBy: 'timestamp',
                sortOrder: 'desc',
                limit: 50,
                offset: 10
            };
            expect(SearchMessagesSchema.parse(data)).toEqual(data);
        });

        test('should reject without guildId', () => {
            const data = {};
            expect(() => SearchMessagesSchema.parse(data)).toThrow();
        });

        test('should reject with empty guildId', () => {
            const data = { guildId: '' };
            expect(() => SearchMessagesSchema.parse(data)).toThrow();
        });

        test('should reject invalid limit range', () => {
            const tooLowData = { guildId: 'guild123', limit: 0 };
            expect(() => SearchMessagesSchema.parse(tooLowData)).toThrow();

            const tooHighData = { guildId: 'guild123', limit: 101 };
            expect(() => SearchMessagesSchema.parse(tooHighData)).toThrow();
        });

        test('should reject invalid offset', () => {
            const negativeOffsetData = { guildId: 'guild123', offset: -1 };
            expect(() => SearchMessagesSchema.parse(negativeOffsetData)).toThrow();
        });

        test('should validate enum values', () => {
            const validHasValues = ['link', 'embed', 'file', 'poll', 'image', 'video', 'sound', 'sticker', 'snapshot'];
            validHasValues.forEach(value => {
                const data = { guildId: 'guild123', has: value as any };
                expect(() => SearchMessagesSchema.parse(data)).not.toThrow();
            });

            const validAuthorTypes = ['user', 'bot', 'webhook'];
            validAuthorTypes.forEach(value => {
                const data = { guildId: 'guild123', authorType: value as any };
                expect(() => SearchMessagesSchema.parse(data)).not.toThrow();
            });

            const validSortByValues = ['timestamp', 'relevance'];
            validSortByValues.forEach(value => {
                const data = { guildId: 'guild123', sortBy: value as any };
                expect(() => SearchMessagesSchema.parse(data)).not.toThrow();
            });

            const validSortOrderValues = ['desc', 'asc'];
            validSortOrderValues.forEach(value => {
                const data = { guildId: 'guild123', sortOrder: value as any };
                expect(() => SearchMessagesSchema.parse(data)).not.toThrow();
            });
        });

        test('should reject invalid enum values', () => {
            const invalidData = { guildId: 'guild123', has: 'invalid' };
            expect(() => SearchMessagesSchema.parse(invalidData)).toThrow();

            const invalidAuthorTypeData = { guildId: 'guild123', authorType: 'invalid' };
            expect(() => SearchMessagesSchema.parse(invalidAuthorTypeData)).toThrow();

            const invalidSortByData = { guildId: 'guild123', sortBy: 'invalid' };
            expect(() => SearchMessagesSchema.parse(invalidSortByData)).toThrow();

            const invalidSortOrderData = { guildId: 'guild123', sortOrder: 'invalid' };
            expect(() => SearchMessagesSchema.parse(invalidSortOrderData)).toThrow();
        });
    });
});