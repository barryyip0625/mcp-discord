import { Client } from "discord.js";
import { z } from "zod";
import { ToolResponse, ToolContext, ToolHandler } from "./types.js";
import { loginHandler } from './login.js';
import { sendMessageHandler, editMessageHandler } from './send-message.js';
import {
  getForumChannelsHandler,
  createForumPostHandler,
  getForumPostHandler,
  listForumThreadsHandler,
  replyToForumHandler,
  deleteForumPostHandler,
  getForumTagsHandler,
  setForumTagsHandler,
  updateForumPostHandler
} from './forum.js';
import {
  createTextChannelHandler,
  createForumChannelHandler,
  editChannelHandler,
  deleteChannelHandler,
  readMessagesHandler,
  createCategoryHandler,
  editCategoryHandler,
  deleteCategoryHandler,
  createVoiceChannelHandler,
  setChannelPermissionsHandler,
  removeChannelPermissionsHandler
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
  listRolesHandler,
  createRoleHandler,
  editRoleHandler,
  deleteRoleHandler,
  assignRoleHandler,
  removeRoleHandler,
  listMembersHandler,
  getMemberHandler
} from './roles.js';

// Export tool handlers
export {
  loginHandler,
  sendMessageHandler,
  getForumChannelsHandler,
  createForumPostHandler,
  getForumPostHandler,
  listForumThreadsHandler,
  replyToForumHandler,
  deleteForumPostHandler,
  getForumTagsHandler,
  setForumTagsHandler,
  updateForumPostHandler,
  editMessageHandler,
  createTextChannelHandler,
  createForumChannelHandler,
  editChannelHandler,
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
  createVoiceChannelHandler,
  setChannelPermissionsHandler,
  removeChannelPermissionsHandler,
  listRolesHandler,
  createRoleHandler,
  editRoleHandler,
  deleteRoleHandler,
  assignRoleHandler,
  removeRoleHandler,
  listMembersHandler,
  getMemberHandler,
  listServersHandler,
  searchMessagesHandler
};

// Export common types
export { ToolResponse, ToolContext, ToolHandler };

// Create tool context
export function createToolContext(client: Client): ToolContext {
  return { client };
}
