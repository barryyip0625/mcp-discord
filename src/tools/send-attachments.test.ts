import { sendMessageHandler } from './send-message.js';
import { SendMessageSchema } from '../schemas.js';

const sent = { id: 'sent123', url: 'https://discord.com/channels/g/channel123/sent123' };
const channel: any = {
  id: 'channel123',
  isTextBased: () => true,
  send: jest.fn().mockResolvedValue(sent),
  messages: { fetch: jest.fn() },
};
const mockClient: any = { isReady: () => true, channels: { fetch: jest.fn().mockResolvedValue(channel) } };

describe('discord_send attachments', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uploads base64 data as a Buffer and passes https URLs through', async () => {
    const data = Buffer.from('png-bytes').toString('base64');
    const result = await sendMessageHandler({
      channelId: 'channel123',
      message: 'Chart',
      attachments: [
        { name: 'chart.png', data, description: 'alt text' },
        { name: 'other.png', url: 'https://cdn.discordapp.com/attachments/1/2/other.png' }
      ]
    }, { client: mockClient });

    expect(result.isError).toBeUndefined();
    const options = channel.send.mock.calls[0][0];
    expect(options.content).toBe('Chart');
    expect(options.files).toHaveLength(2);
    expect(Buffer.isBuffer(options.files[0].attachment)).toBe(true);
    expect(options.files[0].attachment.toString()).toBe('png-bytes');
    expect(options.files[0]).toMatchObject({ name: 'chart.png', description: 'alt text' });
    expect(options.files[1]).toEqual({ attachment: 'https://cdn.discordapp.com/attachments/1/2/other.png', name: 'other.png' });
  });

  it('allows an empty message when attachments are supplied', async () => {
    await sendMessageHandler({
      channelId: 'channel123', message: '',
      attachments: [{ name: 'a.png', data: 'AAAA' }]
    }, { client: mockClient });
    expect(channel.send).toHaveBeenCalledTimes(1);
  });

  it('sends no files option without attachments', async () => {
    await sendMessageHandler({ channelId: 'channel123', message: 'Hi' }, { client: mockClient });
    expect(channel.send.mock.calls[0][0].files).toBeUndefined();
  });

  it('rejects attachments with both or neither of url and data', () => {
    expect(() => SendMessageSchema.parse({ channelId: 'c', message: '', attachments: [{ name: 'a.png' }] })).toThrow();
    expect(() => SendMessageSchema.parse({ channelId: 'c', message: '', attachments: [{ name: 'a.png', data: 'AAAA', url: 'https://x.test/a.png' }] })).toThrow();
  });

  it('rejects non-https URLs and more than 10 attachments', () => {
    expect(() => SendMessageSchema.parse({ channelId: 'c', message: '', attachments: [{ name: 'a.png', url: 'http://x.test/a.png' }] })).toThrow();
    const many = Array.from({ length: 11 }, (_, i) => ({ name: `${i}.png`, data: 'AAAA' }));
    expect(() => SendMessageSchema.parse({ channelId: 'c', message: '', attachments: many })).toThrow();
  });
});
