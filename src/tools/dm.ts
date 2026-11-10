import { DiscordAPIError, GuildMember } from "discord.js";
import { ToolContext, ToolResponse } from "./types.js";
import { SendDirectMessageSchema } from "../schemas.js";
import { handleDiscordError } from "../errorHandler.js";

const HOUR_MS = 60 * 60 * 1000;

/** What the guard gets to decide on. Everything is already looked up. */
export interface DmGuardInput {
  /** The recipient as a member of the given server, or null if not a member. */
  member: GuildMember | null;
  /** DMs this process sent to this recipient in the last hour. */
  sentToRecipientLastHour: number;
  /** DMs this process sent to anyone in the last hour. */
  sentTotalLastHour: number;
}

/**
 * Decide whether the bot may send this DM.
 * Returns null to allow, or a short reason (shown to the caller) to refuse.
 *
 * This is the line between "talk to people who came to the server" and
 * "spam tool". Discord itself only blocks DMs when the user closed them;
 * everything else is up to this function.
 */
export const DM_LIMIT_PER_RECIPIENT_PER_HOUR = 2; // one message plus one follow-up
export const DM_LIMIT_TOTAL_PER_HOUR = 10; // brake against a runaway agent loop

export function checkDmAllowed(input: DmGuardInput): string | null {
  const { member, sentToRecipientLastHour, sentTotalLastHour } = input;
  if (!member) return "the user is not a member of this server";
  if (member.user.bot) return "the recipient is a bot";
  if (sentToRecipientLastHour >= DM_LIMIT_PER_RECIPIENT_PER_HOUR) {
    return `already ${sentToRecipientLastHour} direct messages to this user in the last hour (limit ${DM_LIMIT_PER_RECIPIENT_PER_HOUR})`;
  }
  if (sentTotalLastHour >= DM_LIMIT_TOTAL_PER_HOUR) {
    return `already ${sentTotalLastHour} direct messages in the last hour (limit ${DM_LIMIT_TOTAL_PER_HOUR})`;
  }
  return null;
}

// In-memory send log. Survives across requests (one process), resets on restart.
const sendLog: { userId: string; at: number }[] = [];

function countRecent(now: number, userId?: string): number {
  return sendLog.filter((e) => now - e.at < HOUR_MS && (!userId || e.userId === userId)).length;
}

function pruneLog(now: number): void {
  while (sendLog.length > 0 && now - sendLog[0].at >= HOUR_MS) sendLog.shift();
}

/** Test hook: clear the send log between tests. */
export function resetDmLog(): void {
  sendLog.length = 0;
}

export async function sendDirectMessageHandler(
  args: unknown,
  context: ToolContext
): Promise<ToolResponse> {
  const { guildId, userId, message } = SendDirectMessageSchema.parse(args);
  try {
    if (!context.client.isReady()) {
      return {
        content: [{ type: "text", text: "Discord client not logged in." }],
        isError: true
      };
    }

    const guild = await context.client.guilds.fetch(guildId);
    let member: GuildMember | null = null;
    try {
      member = await guild.members.fetch(userId);
    } catch {
      member = null; // Unknown Member: not on this server
    }

    const now = Date.now();
    pruneLog(now);
    const refusal = checkDmAllowed({
      member,
      sentToRecipientLastHour: countRecent(now, userId),
      sentTotalLastHour: countRecent(now)
    });
    if (refusal) {
      return {
        content: [{ type: "text", text: `Direct message refused: ${refusal}` }],
        isError: true
      };
    }

    // checkDmAllowed may allow a null member in theory; sending needs one.
    if (!member) {
      return {
        content: [{ type: "text", text: `User ${userId} is not a member of server ${guildId}.` }],
        isError: true
      };
    }

    let sent;
    try {
      sent = await member.send(message);
    } catch (err) {
      if (err instanceof DiscordAPIError && err.code === 50007) {
        return {
          content: [{ type: "text", text: `${member.user.username} does not accept direct messages from this server (Discord error 50007).` }],
          isError: true
        };
      }
      throw err;
    }
    sendLog.push({ userId, at: now });

    return {
      content: [{
        type: "text",
        text: `Direct message sent to ${member.user.username} (${userId}). Message ID: ${sent.id}, DM channel ID: ${sent.channelId}`
      }]
    };
  } catch (error) {
    return handleDiscordError(error);
  }
}
