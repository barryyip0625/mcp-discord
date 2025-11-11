import { ActivityType, PresenceStatusData } from "discord.js";
import { handleDiscordError } from "../errorHandler.js";
import {
  SetAboutMeSchema,
  SetBioSchema,
  SetNicknameSchema,
  SetPresenceSchema
} from "../schemas.js";
import { ToolContext, ToolResponse } from "./types.js";

// Set bot presence handler
export async function setPresenceHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { status, afk, activities } = SetPresenceSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    // Map activity type string to ActivityType enum
    const activityTypeMap: Record<string, ActivityType> = {
      "PLAYING": ActivityType.Playing,
      "STREAMING": ActivityType.Streaming,
      "LISTENING": ActivityType.Listening,
      "WATCHING": ActivityType.Watching,
      "COMPETING": ActivityType.Competing,
      "CUSTOM": ActivityType.Custom
    };
    // Set the bot's presence
    context.client.user?.setPresence({
      status: status as PresenceStatusData,
      afk: afk ?? false,
      activities: activities
        ? [{
          name: activities.name,
          type: activityTypeMap[activities.type],
          url: activities.url
        }]
        : []
    });

    return {
      content: [{ type: "text", text: `Successfully set bot presence to: ${status}` }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

// Set nickname handler
export async function setNicknameHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, nick } = SetNicknameSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    if (!guild) {
      return {
        content: [{ type: "text", text: `Guild with ID ${guildId} not found.` }],
        isError: true
      };
    }

    await guild.members.editMe({ nick: nick ?? null, reason: "Updating bot nickname via tool" });

    return {
      content: [{ type: "text", text: `Successfully set nickname to: ${nick}` }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

// Set bot about me handler
export async function setAboutMeHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { aboutMe } = SetAboutMeSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    await context.client.application.edit({ description: aboutMe });

    return {
      content: [{ type: "text", text: `Successfully updated about me section.` }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function setBioHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, bio } = SetBioSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }
    const guild = await context.client.guilds.fetch(guildId);
    if (!guild) {
      return {
        content: [{ type: "text", text: `Guild with ID ${guildId} not found.` }],
        isError: true
      };
    }
    await guild.members.editMe({ bio: bio ?? null, reason: "Updating bot bio via tool" });

    return {
      content: [{ type: "text", text: `Successfully updated bio in guild ${guildId}.` }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}