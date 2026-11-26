import {
  assertAttachmentUrlAllowed,
  decodeAttachmentData,
  MAX_ATTACHMENT_BYTES,
  resolveAllowedAttachmentHosts,
} from './attachment-security.js';

describe('attachment-security', () => {
  it('defaults to Discord CDN hosts', () => {
    expect(resolveAllowedAttachmentHosts({})).toEqual([
      'cdn.discordapp.com',
      'media.discordapp.net',
    ]);
  });

  it('allows * and custom hosts via env', () => {
    expect(resolveAllowedAttachmentHosts({ DISCORD_ATTACHMENT_ALLOWED_HOSTS: '*' })).toBe('*');
    expect(resolveAllowedAttachmentHosts({ DISCORD_ATTACHMENT_ALLOWED_HOSTS: 'example.com, CDN.Example.ORG' }))
      .toEqual(['example.com', 'cdn.example.org']);
  });

  it('allows Discord CDN URLs and rejects others by default', () => {
    expect(() => assertAttachmentUrlAllowed(
      'https://cdn.discordapp.com/attachments/1/2/a.png',
      {}
    )).not.toThrow();
    expect(() => assertAttachmentUrlAllowed(
      'https://evil.example/secret',
      {}
    )).toThrow(/not allowed/);
  });

  it('rejects oversized base64 payloads', () => {
    const huge = 'A'.repeat(Math.ceil(MAX_ATTACHMENT_BYTES / 3) * 4 + 9);
    expect(() => decodeAttachmentData(huge)).toThrow(/maximum size/);
    expect(decodeAttachmentData(Buffer.from('ok').toString('base64')).toString()).toBe('ok');
  });
});
