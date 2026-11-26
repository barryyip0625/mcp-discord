import { forwardMessageHandler } from './send-message.js';

const sentForward = { id: 'forward123', url: 'https://discord.com/channels/g2/target123/forward123' };
const sourceMessage = { id: 'message123', forward: jest.fn().mockResolvedValue(sentForward) };

const sourceChannel: any = {
  id: 'source123',
  isTextBased: () => true,
  messages: { fetch: jest.fn().mockResolvedValue(sourceMessage) },
};
const targetChannel: any = { id: 'target123', isTextBased: () => true, send: jest.fn() };
const voiceChannel: any = { id: 'voice123', isTextBased: () => false };

const mockClient: any = { isReady: jest.fn(), channels: { fetch: jest.fn() } };
const args = { sourceChannelId: 'source123', messageId: 'message123', targetChannelId: 'target123' };

describe('forwardMessageHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isReady.mockReturnValue(true);
  });

  it('returns an error when the client is not ready', async () => {
    mockClient.isReady.mockReturnValue(false);
    const result = await forwardMessageHandler(args, { client: mockClient });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe('Discord client not logged in.');
  });

  it('returns an error when the source channel is not text-based', async () => {
    mockClient.channels.fetch.mockResolvedValueOnce(voiceChannel);
    const result = await forwardMessageHandler(args, { client: mockClient });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('source123');
  });

  it('returns an error when the target channel cannot receive messages', async () => {
    mockClient.channels.fetch.mockResolvedValueOnce(sourceChannel).mockResolvedValueOnce(voiceChannel);
    const result = await forwardMessageHandler(args, { client: mockClient });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain('target123');
  });

  it('forwards the message and returns the new message ID and URL', async () => {
    mockClient.channels.fetch.mockResolvedValueOnce(sourceChannel).mockResolvedValueOnce(targetChannel);
    const result = await forwardMessageHandler(args, { client: mockClient });
    expect(sourceChannel.messages.fetch).toHaveBeenCalledWith('message123');
    expect(sourceMessage.forward).toHaveBeenCalledWith(targetChannel);
    expect(result.isError).toBeUndefined();
    expect(result.content[0].text).toContain('forward123');
    expect(result.content[0].text).toContain(sentForward.url);
  });

  it('rejects missing arguments', async () => {
    await expect(forwardMessageHandler({ messageId: 'm' }, { client: mockClient })).rejects.toThrow();
  });
});
