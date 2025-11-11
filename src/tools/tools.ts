import { Client } from "discord.js";
import { ToolResponse, ToolContext, ToolHandler } from "./types.js";
import { loginHandler } from './login.js';
import { sendMessageHandler } from './send-message.js';
import {
  getForumChannelsHandler,
  createForumPostHandler,
  getForumPostHandler,
  replyToForumHandler,
  deleteForumPostHandler
} from './forum.js';
import {
  createTextChannelHandler,
  deleteChannelHandler,
  readMessagesHandler,
  createCategoryHandler,
  editCategoryHandler,
  deleteCategoryHandler
} from './channel.js';
import {
  getServerInfoHandler,
  listServersHandler,
  searchMessagesHandler
} from "./server.js";
import {
  addReactionHandler,
  addMultipleReactionsHandler,
  removeReactionHandler,
  deleteMessageHandler
} from './reactions.js';
import {
  createWebhookHandler,
  sendWebhookMessageHandler,
  editWebhookHandler,
  deleteWebhookHandler
} from './webhooks.js';
import {
  setPresenceHandler,
  setNicknameHandler,
  setAboutMeHandler,
  setBioHandler
} from './presence.js';

// Export tool handlers
export {
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
  setPresenceHandler,
  setNicknameHandler,
  setAboutMeHandler,
  setBioHandler
};

// Export common types
export { ToolResponse, ToolContext, ToolHandler };

// Create tool context
export function createToolContext(client: Client): ToolContext {
  return { client };
} 