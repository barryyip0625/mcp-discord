import { Client } from "discord.js";
import {
  loginHandler,
  sendMessageHandler,
  getForumChannelsHandler,
  createForumPostHandler,
  getForumPostHandler,
  replyToForumHandler,
  deleteForumPostHandler,
  createTextChannelHandler,
  deleteChannelHandler,
  readMessagesHandler,
  getServerInfoHandler,
  addReactionHandler,
  addMultipleReactionsHandler,
  removeReactionHandler,
  deleteMessageHandler,
  createWebhookHandler,
  sendWebhookMessageHandler,
  editWebhookHandler,
  deleteWebhookHandler,
  createCategoryHandler,
  editCategoryHandler,
  deleteCategoryHandler,
  listServersHandler,
  searchMessagesHandler,
  createToolContext
} from "./tools.js";

describe('tools.ts exports', () => {
  // Test that all exported functions exist
  test('should export loginHandler', () => {
    expect(loginHandler).toBeDefined();
    expect(typeof loginHandler).toBe('function');
  });

  test('should export sendMessageHandler', () => {
    expect(sendMessageHandler).toBeDefined();
    expect(typeof sendMessageHandler).toBe('function');
  });

  test('should export forum handlers', () => {
    expect(getForumChannelsHandler).toBeDefined();
    expect(createForumPostHandler).toBeDefined();
    expect(getForumPostHandler).toBeDefined();
    expect(replyToForumHandler).toBeDefined();
    expect(deleteForumPostHandler).toBeDefined();

    expect(typeof getForumChannelsHandler).toBe('function');
    expect(typeof createForumPostHandler).toBe('function');
    expect(typeof getForumPostHandler).toBe('function');
    expect(typeof replyToForumHandler).toBe('function');
    expect(typeof deleteForumPostHandler).toBe('function');
  });

  test('should export channel handlers', () => {
    expect(createTextChannelHandler).toBeDefined();
    expect(deleteChannelHandler).toBeDefined();
    expect(readMessagesHandler).toBeDefined();
    expect(createCategoryHandler).toBeDefined();
    expect(editCategoryHandler).toBeDefined();
    expect(deleteCategoryHandler).toBeDefined();

    expect(typeof createTextChannelHandler).toBe('function');
    expect(typeof deleteChannelHandler).toBe('function');
    expect(typeof readMessagesHandler).toBe('function');
    expect(typeof createCategoryHandler).toBe('function');
    expect(typeof editCategoryHandler).toBe('function');
    expect(typeof deleteCategoryHandler).toBe('function');
  });

  test('should export server handlers', () => {
    expect(getServerInfoHandler).toBeDefined();
    expect(listServersHandler).toBeDefined();
    expect(searchMessagesHandler).toBeDefined();

    expect(typeof getServerInfoHandler).toBe('function');
    expect(typeof listServersHandler).toBe('function');
    expect(typeof searchMessagesHandler).toBe('function');
  });

  test('should export reaction handlers', () => {
    expect(addReactionHandler).toBeDefined();
    expect(addMultipleReactionsHandler).toBeDefined();
    expect(removeReactionHandler).toBeDefined();
    expect(deleteMessageHandler).toBeDefined();

    expect(typeof addReactionHandler).toBe('function');
    expect(typeof addMultipleReactionsHandler).toBe('function');
    expect(typeof removeReactionHandler).toBe('function');
    expect(typeof deleteMessageHandler).toBe('function');
  });

  test('should export webhook handlers', () => {
    expect(createWebhookHandler).toBeDefined();
    expect(sendWebhookMessageHandler).toBeDefined();
    expect(editWebhookHandler).toBeDefined();
    expect(deleteWebhookHandler).toBeDefined();

    expect(typeof createWebhookHandler).toBe('function');
    expect(typeof sendWebhookMessageHandler).toBe('function');
    expect(typeof editWebhookHandler).toBe('function');
    expect(typeof deleteWebhookHandler).toBe('function');
  });

  test('should export createToolContext function', () => {
    expect(createToolContext).toBeDefined();
    expect(typeof createToolContext).toBe('function');
  });

  describe('createToolContext', () => {
    test('should create a valid tool context with client', () => {
      const mockClient = {} as Client;
      const context = createToolContext(mockClient);

      expect(context).toBeDefined();
      expect(context.client).toBe(mockClient);
    });
  });
});