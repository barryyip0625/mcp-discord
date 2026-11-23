import { Collection, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from 'discord.js';
import {
  createScheduledEventHandler,
  listScheduledEventsHandler,
  deleteScheduledEventHandler
} from './events.js';
import { searchMembersHandler } from './roles.js';
import { CreateScheduledEventSchema } from '../schemas.js';
import { ToolContext } from './types.js';

jest.mock('../errorHandler', () => ({
  handleDiscordError: jest.fn((error) => ({
    content: [{ type: 'text', text: `Error: ${error.message || 'Unknown error'}` }],
    isError: true
  }))
}));

describe('scheduled events', () => {
  let mockGuild: any;
  let context: ToolContext;

  beforeEach(() => {
    mockGuild = {
      scheduledEvents: {
        create: jest.fn().mockResolvedValue({ id: 'ev1', name: 'Sprechstunde', url: 'https://discord.com/events/g1/ev1' }),
        fetch: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined)
      },
      members: { search: jest.fn() }
    };
    context = {
      client: {
        isReady: jest.fn(() => true),
        guilds: { fetch: jest.fn().mockResolvedValue(mockGuild) }
      } as any
    };
  });

  afterEach(() => jest.clearAllMocks());

  test('creates a voice event in a channel, guild-only', async () => {
    const result = await createScheduledEventHandler({
      guildId: 'g1',
      name: 'Sprechstunde',
      startTime: '2026-11-20T18:00:00+01:00',
      entityType: 'voice',
      channelId: 'vc1'
    }, context);

    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('ev1');
    const opts = mockGuild.scheduledEvents.create.mock.calls[0][0];
    expect(opts.entityType).toBe(GuildScheduledEventEntityType.Voice);
    expect(opts.privacyLevel).toBe(GuildScheduledEventPrivacyLevel.GuildOnly);
    expect(opts.channel).toBe('vc1');
    expect(opts.scheduledStartTime.toISOString()).toBe('2026-11-20T17:00:00.000Z');
    expect(opts.entityMetadata).toBeUndefined();
  });

  test('creates an external event with location and end', async () => {
    await createScheduledEventHandler({
      guildId: 'g1',
      name: 'Workshop',
      startTime: '2026-11-20T18:00:00+01:00',
      endTime: '2026-11-20T20:00:00+01:00',
      entityType: 'external',
      location: 'https://example.org/raum'
    }, context);

    const opts = mockGuild.scheduledEvents.create.mock.calls[0][0];
    expect(opts.entityType).toBe(GuildScheduledEventEntityType.External);
    expect(opts.entityMetadata).toEqual({ location: 'https://example.org/raum' });
    expect(opts.channel).toBeUndefined();
  });

  test('schema rejects voice without channel, external without location/end, end before start', () => {
    const base = { guildId: 'g1', name: 'X', startTime: '2026-11-20T18:00:00+01:00' };
    expect(CreateScheduledEventSchema.safeParse({ ...base, entityType: 'voice' }).success).toBe(false);
    expect(CreateScheduledEventSchema.safeParse({ ...base, entityType: 'external', endTime: '2026-11-20T19:00:00+01:00' }).success).toBe(false);
    expect(CreateScheduledEventSchema.safeParse({ ...base, entityType: 'external', location: 'Hamburg' }).success).toBe(false);
    expect(CreateScheduledEventSchema.safeParse({
      ...base, entityType: 'external', location: 'Hamburg', endTime: '2026-11-20T17:00:00+01:00'
    }).success).toBe(false);
    expect(CreateScheduledEventSchema.safeParse({ ...base, startTime: '20.11.2026 18:00', entityType: 'voice', channelId: 'vc1' }).success).toBe(false);
  });

  test('lists events as JSON', async () => {
    const events = new Collection([['ev1', {
      id: 'ev1', name: 'Sprechstunde', description: null,
      scheduledStartAt: new Date('2026-11-20T17:00:00Z'), scheduledEndAt: null,
      status: 1, channelId: 'vc1', entityMetadata: null, userCount: 3, url: 'u'
    }]]);
    mockGuild.scheduledEvents.fetch.mockResolvedValue(events);

    const result = await listScheduledEventsHandler({ guildId: 'g1' }, context);
    const data = JSON.parse(result.content[0].text);
    expect(data.eventCount).toBe(1);
    expect(data.events[0]).toMatchObject({ id: 'ev1', start: '2026-11-20T17:00:00.000Z', interestedCount: 3 });
  });

  test('deletes an event', async () => {
    const result = await deleteScheduledEventHandler({ guildId: 'g1', eventId: 'ev1' }, context);
    expect(mockGuild.scheduledEvents.delete).toHaveBeenCalledWith('ev1');
    expect(result.isError).toBeUndefined();
  });

  test('reports not logged in', async () => {
    (context.client.isReady as unknown as jest.Mock).mockReturnValue(false);
    const result = await listScheduledEventsHandler({ guildId: 'g1' }, context);
    expect(result.isError).toBe(true);
  });

  test('searchMembers passes query and default limit 10', async () => {
    const member = {
      id: 'u1', displayName: 'Dada', user: { username: 'dada.lama', bot: false },
      roles: { cache: new Map([['r0', { id: 'r0', name: '@everyone' }], ['r1', { id: 'r1', name: 'Kundschaft' }]]) }
    };
    // discord.js Collection has filter/map; emulate with an array-backed object
    member.roles.cache = Object.assign([...member.roles.cache.values()], {}) as any;
    mockGuild.members.search.mockResolvedValue([member]);

    const result = await searchMembersHandler({ guildId: 'g1', query: 'dada' }, context);
    expect(mockGuild.members.search).toHaveBeenCalledWith({ query: 'dada', limit: 10 });
    const data = JSON.parse(result.content[0].text);
    expect(data.members[0]).toMatchObject({ id: 'u1', username: 'dada.lama', roles: [{ id: 'r1', name: 'Kundschaft' }] });
  });
});
