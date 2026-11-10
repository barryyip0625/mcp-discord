import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventCreateOptions
} from "discord.js";
import { ToolContext, ToolResponse } from "./types.js";
import {
  CreateScheduledEventSchema,
  ListScheduledEventsSchema,
  DeleteScheduledEventSchema
} from "../schemas.js";
import { handleDiscordError } from "../errorHandler.js";

const notReady: ToolResponse = {
  content: [{ type: "text", text: "Discord client not logged in." }],
  isError: true
};

export async function createScheduledEventHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, name, startTime, endTime, description, entityType, channelId, location, reason } =
    CreateScheduledEventSchema.parse(args);
  try {
    if (!context.client.isReady()) return notReady;
    const guild = await context.client.guilds.fetch(guildId);

    const options: GuildScheduledEventCreateOptions = {
      name,
      scheduledStartTime: new Date(startTime),
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: entityType === "voice"
        ? GuildScheduledEventEntityType.Voice
        : GuildScheduledEventEntityType.External,
      ...(endTime ? { scheduledEndTime: new Date(endTime) } : {}),
      ...(description ? { description } : {}),
      ...(entityType === "voice" ? { channel: channelId } : { entityMetadata: { location } }),
      ...(reason ? { reason } : {})
    };

    const event = await guild.scheduledEvents.create(options);
    return {
      content: [{
        type: "text",
        text: `Successfully created scheduled event "${event.name}" with ID: ${event.id}. Link: ${event.url}`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function listScheduledEventsHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId } = ListScheduledEventsSchema.parse(args);
  try {
    if (!context.client.isReady()) return notReady;
    const guild = await context.client.guilds.fetch(guildId);
    const events = await guild.scheduledEvents.fetch();
    const formatted = events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      start: e.scheduledStartAt?.toISOString() ?? null,
      end: e.scheduledEndAt?.toISOString() ?? null,
      status: e.status,
      channelId: e.channelId,
      location: e.entityMetadata?.location ?? null,
      interestedCount: e.userCount ?? null,
      url: e.url
    }));
    return {
      content: [{
        type: "text",
        text: JSON.stringify({ guildId, eventCount: formatted.length, events: formatted }, null, 2)
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}

export async function deleteScheduledEventHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, eventId } = DeleteScheduledEventSchema.parse(args);
  try {
    if (!context.client.isReady()) return notReady;
    const guild = await context.client.guilds.fetch(guildId);
    await guild.scheduledEvents.delete(eventId);
    return {
      content: [{ type: "text", text: `Successfully deleted scheduled event ${eventId}` }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}
