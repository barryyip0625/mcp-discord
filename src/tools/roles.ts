import { ChannelType, PermissionsBitField } from "discord.js";
import { ToolContext, ToolResponse } from "./types.js";
import {
  ListRolesSchema,
  CreateRoleSchema,
  EditRoleSchema,
  DeleteRoleSchema,
  AssignRoleSchema,
  RemoveRoleSchema,
  ListMembersSchema,
  GetMemberSchema
} from "../schemas.js";
import { handleDiscordError } from "../errorHandler.js";

// Helper to resolve permission strings to bitfield
function resolvePermissions(perms: string[]): bigint {
  let bits = BigInt(0);
  for (const perm of perms) {
    const flag = PermissionsBitField.Flags[perm as keyof typeof PermissionsBitField.Flags];
    if (flag !== undefined) {
      bits |= flag;
    }
  }
  return bits;
}

export async function listRolesHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId } = ListRolesSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const roles = await guild.roles.fetch();
    const formatted = roles
      .sort((a, b) => b.position - a.position)
      .map(role => ({
        id: role.id,
        name: role.name,
        color: role.hexColor,
        position: role.position,
        hoist: role.hoist,
        mentionable: role.mentionable,
        managed: role.managed,
        memberCount: role.members.size
      }));
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ guildId, roleCount: formatted.length, roles: formatted }, null, 2)
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function createRoleHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, name, color, hoist, mentionable, permissions, reason } = CreateRoleSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const options: any = { name };
    if (color) options.color = color;
    if (typeof hoist === "boolean") options.hoist = hoist;
    if (typeof mentionable === "boolean") options.mentionable = mentionable;
    if (permissions) options.permissions = resolvePermissions(permissions);
    if (reason) options.reason = reason;
    const role = await guild.roles.create(options);
    return {
      content: [{
        type: "text",
        text: `Successfully created role "${name}" with ID: ${role.id}`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function editRoleHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, roleId, name, color, hoist, mentionable, permissions, position, reason } = EditRoleSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const role = await guild.roles.fetch(roleId);
    if (!role) {
      return {
        content: [{ type: "text", text: `Cannot find role with ID: ${roleId}` }],
        isError: true
      };
    }
    const update: any = {};
    if (name) update.name = name;
    if (color) update.color = color;
    if (typeof hoist === "boolean") update.hoist = hoist;
    if (typeof mentionable === "boolean") update.mentionable = mentionable;
    if (permissions) update.permissions = resolvePermissions(permissions);
    if (typeof position === "number") update.position = position;
    if (reason) update.reason = reason;
    await role.edit(update);
    return {
      content: [{
        type: "text",
        text: `Successfully edited role "${role.name}" (ID: ${roleId})`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function deleteRoleHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, roleId, reason } = DeleteRoleSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const role = await guild.roles.fetch(roleId);
    if (!role) {
      return {
        content: [{ type: "text", text: `Cannot find role with ID: ${roleId}` }],
        isError: true
      };
    }
    const roleName = role.name;
    await role.delete(reason || "Role deleted via API");
    return {
      content: [{
        type: "text",
        text: `Successfully deleted role "${roleName}" (ID: ${roleId})`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function assignRoleHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, userId, roleId, reason } = AssignRoleSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    if (!member) {
      return {
        content: [{ type: "text", text: `Cannot find member with ID: ${userId}` }],
        isError: true
      };
    }
    await member.roles.add(roleId, reason || "Role assigned via API");
    return {
      content: [{
        type: "text",
        text: `Successfully assigned role ${roleId} to member ${member.user.tag} (${userId})`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function removeRoleHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, userId, roleId, reason } = RemoveRoleSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    if (!member) {
      return {
        content: [{ type: "text", text: `Cannot find member with ID: ${userId}` }],
        isError: true
      };
    }
    await member.roles.remove(roleId, reason || "Role removed via API");
    return {
      content: [{
        type: "text",
        text: `Successfully removed role ${roleId} from member ${member.user.tag} (${userId})`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function listMembersHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, limit, after } = ListMembersSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const fetchOptions: { limit: number; after?: string } = { limit };
    if (after) fetchOptions.after = after;
    const members = await guild.members.list(fetchOptions);
    const formatted = members.map((member) => ({
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      bot: member.user.bot,
      roles: member.roles.cache
        .filter((r) => r.name !== "@everyone")
        .map((r) => ({ id: r.id, name: r.name })),
      joinedAt: member.joinedAt
    }));
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ guildId, memberCount: formatted.length, members: formatted }, null, 2)
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function getMemberHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, userId } = GetMemberSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    if (!member) {
      return {
        content: [{ type: "text", text: `Cannot find member with ID: ${userId}` }],
        isError: true
      };
    }
    const formatted = {
      id: member.id,
      username: member.user.username,
      displayName: member.displayName,
      bot: member.user.bot,
      roles: member.roles.cache
        .filter(r => r.name !== "@everyone")
        .map(r => ({ id: r.id, name: r.name })),
      joinedAt: member.joinedAt,
      nickname: member.nickname,
      avatar: member.displayAvatarURL()
    };
    return {
      content: [{
        type: "text",
        text: JSON.stringify(formatted, null, 2)
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}
