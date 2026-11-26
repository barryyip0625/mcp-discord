import {
  assertAttachmentUrlAllowed,
  decodeAttachmentData,
  DISCORD_OFFICIAL_ATTACHMENT_HOSTS,
  MAX_ATTACHMENT_BYTES,
  resolveAllowedAttachmentHosts,
  resolveMaxAttachmentBytes,
} from './attachment-security.js';

describe('attachment-security', () => {
  it('includes official Discord CDN hosts by default', () => {
    expect(resolveAllowedAttachmentHosts({})).toEqual([...DISCORD_OFFICIAL_ATTACHMENT_HOSTS]);
  });

  it('merges custom hosts with official Discord CDNs', () => {
    expect(resolveAllowedAttachmentHosts({
      DISCORD_ATTACHMENT_ALLOWED_HOSTS: 'images.example.com, CDN.Example.ORG',
    })).toEqual([
      'cdn.discordapp.com',
      'media.discordapp.net',
      'images.example.com',
      'cdn.example.org',
    ]);
  });

  it('supports * to allow any https host', () => {
    expect(resolveAllowedAttachmentHosts({ DISCORD_ATTACHMENT_ALLOWED_HOSTS: '*' })).toBe('*');
  });

  it('can disable official Discord CDNs', () => {
    expect(resolveAllowedAttachmentHosts({
      DISCORD_ATTACHMENT_INCLUDE_DISCORD_CDN: 'false',
      DISCORD_ATTACHMENT_ALLOWED_HOSTS: 'images.example.com',
    })).toEqual(['images.example.com']);

    expect(resolveAllowedAttachmentHosts({
      DISCORD_ATTACHMENT_INCLUDE_DISCORD_CDN: '0',
    })).toEqual([]);
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

  it('allows custom hosts from DISCORD_ATTACHMENT_ALLOWED_HOSTS', () => {
    expect(() => assertAttachmentUrlAllowed(
      'https://images.example.com/a.png',
      { DISCORD_ATTACHMENT_ALLOWED_HOSTS: 'images.example.com' }
    )).not.toThrow();
  });

  it('defaults max attachment size to 25 MiB', () => {
    expect(resolveMaxAttachmentBytes({})).toBe(MAX_ATTACHMENT_BYTES);
    expect(resolveMaxAttachmentBytes({ DISCORD_ATTACHMENT_MAX_MB: '10' })).toBe(10 * 1024 * 1024);
    expect(resolveMaxAttachmentBytes({ DISCORD_ATTACHMENT_MAX_MB: '0' })).toBeNull();
    expect(() => resolveMaxAttachmentBytes({ DISCORD_ATTACHMENT_MAX_MB: 'nope' })).toThrow(/Invalid/);
  });

  it('rejects oversized base64 payloads using the configured cap', () => {
    const huge = 'A'.repeat(Math.ceil(MAX_ATTACHMENT_BYTES / 3) * 4 + 9);
    expect(() => decodeAttachmentData(huge, {})).toThrow(/maximum size/);
    expect(decodeAttachmentData(Buffer.from('ok').toString('base64'), {}).toString()).toBe('ok');

    const over1MiB = Buffer.alloc(1024 * 1024 + 1).toString('base64');
    expect(() => decodeAttachmentData(over1MiB, { DISCORD_ATTACHMENT_MAX_MB: '1' })).toThrow(/maximum size/);
    expect(() => decodeAttachmentData(over1MiB, { DISCORD_ATTACHMENT_MAX_MB: '0' })).not.toThrow();
  });
});
