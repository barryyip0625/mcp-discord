import { DiscordAPIError } from 'discord.js';
import {
  sendDirectMessageHandler,
  checkDmAllowed,
  resetDmLog,
  DM_LIMIT_PER_RECIPIENT_PER_HOUR,
  DM_LIMIT_TOTAL_PER_HOUR
} from './dm.js';
import { ToolContext } from './types.js';

jest.mock('../errorHandler', () => ({
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
    isError: true
  }))
}));

function makeMember(id: string, bot = false): any {
  return {
    id,
    user: { username: `user-${id}`, bot },
    send: jest.fn().mockResolvedValue({ id: `msg-${id}`, channelId: `dm-${id}` })
  };
}

describe('checkDmAllowed', () => {
  const human = makeMember('u1');

  test('allows a human member below both limits', () => {
    expect(checkDmAllowed({ member: human, sentToRecipientLastHour: 0, sentTotalLastHour: 0 })).toBeNull();
  });

  test('refuses non-members and bots', () => {
    expect(checkDmAllowed({ member: null, sentToRecipientLastHour: 0, sentTotalLastHour: 0 })).toMatch(/not a member/);
    expect(checkDmAllowed({ member: makeMember('b1', true), sentToRecipientLastHour: 0, sentTotalLastHour: 0 })).toMatch(/bot/);
  });

  test('refuses at the per-recipient and total limits', () => {
    expect(checkDmAllowed({ member: human, sentToRecipientLastHour: DM_LIMIT_PER_RECIPIENT_PER_HOUR, sentTotalLastHour: 0 })).toMatch(/this user/);
    expect(checkDmAllowed({ member: human, sentToRecipientLastHour: 0, sentTotalLastHour: DM_LIMIT_TOTAL_PER_HOUR })).toMatch(/in the last hour/);
  });
});

describe('sendDirectMessageHandler', () => {
  let members: Record<string, any>;
  let context: ToolContext;

  beforeEach(() => {
    resetDmLog();
    members = { u1: makeMember('u1'), u2: makeMember('u2'), b1: makeMember('b1', true) };
    const guild = {
      members: {
        fetch: jest.fn((id: string) => members[id]
          ? Promise.resolve(members[id])
          : Promise.reject(new Error('Unknown Member')))
      }
    };
    context = {
      client: {
        isReady: jest.fn(() => true),
        guilds: { fetch: jest.fn().mockResolvedValue(guild) }
      } as any
    };
  });

  const send = (userId: string) =>
    sendDirectMessageHandler({ guildId: 'g1', userId, message: 'Hallo!' }, context);

  test('sends to a member and reports message + DM channel ID', async () => {
    const result = await send('u1');
    expect(result.isError).toBeUndefined();
    expect(members.u1.send).toHaveBeenCalledWith('Hallo!');
    expect(result.content[0].text).toContain('msg-u1');
    expect(result.content[0].text).toContain('dm-u1');
  });

  test('refuses a user who is not on the server, without sending', async () => {
    const result = await send('stranger');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/refused: the user is not a member/);
  });

  test('refuses bots', async () => {
    const result = await send('b1');
    expect(result.isError).toBe(true);
    expect(members.b1.send).not.toHaveBeenCalled();
  });

  test('per-recipient limit kicks in on the third DM, other members still reachable', async () => {
    for (let i = 0; i < DM_LIMIT_PER_RECIPIENT_PER_HOUR; i++) {
      expect((await send('u1')).isError).toBeUndefined();
    }
    const third = await send('u1');
    expect(third.isError).toBe(true);
    expect(members.u1.send).toHaveBeenCalledTimes(DM_LIMIT_PER_RECIPIENT_PER_HOUR);
    expect((await send('u2')).isError).toBeUndefined();
  });

  test('total limit across recipients', async () => {
    for (let i = 0; i < DM_LIMIT_TOTAL_PER_HOUR; i++) {
      const id = `m${i}`;
      members[id] = makeMember(id);
      expect((await send(id)).isError).toBeUndefined();
    }
    members.extra = makeMember('extra');
    const result = await send('extra');
    expect(result.isError).toBe(true);
    expect(members.extra.send).not.toHaveBeenCalled();
  });

  test('failed sends do not count against the limit', async () => {
    members.u1.send.mockRejectedValueOnce(new Error('network'));
    expect((await send('u1')).isError).toBe(true);
    expect((await send('u1')).isError).toBeUndefined();
    expect((await send('u1')).isError).toBeUndefined();
  });

  test('closed DMs (50007) give a clear message', async () => {
    const err = Object.create(DiscordAPIError.prototype);
    err.code = 50007;
    err.message = 'Cannot send messages to this user';
    members.u1.send.mockRejectedValueOnce(err);
    const result = await send('u1');
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/does not accept direct messages/);
  });

  test('limits reset after an hour', async () => {
    const now = jest.spyOn(Date, 'now');
    now.mockReturnValue(1_000_000);
    await send('u1');
    await send('u1');
    expect((await send('u1')).isError).toBe(true);
    now.mockReturnValue(1_000_000 + 60 * 60 * 1000);
    expect((await send('u1')).isError).toBeUndefined();
    now.mockRestore();
  });
});
