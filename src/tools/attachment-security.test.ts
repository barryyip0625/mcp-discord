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

  it('replaces the base list and supports *', () => {
    expect(resolveAllowedAttachmentHosts({ DISCORD_ATTACHMENT_ALLOWED_HOSTS: '*' })).toBe('*');
    expect(resolveAllowedAttachmentHosts({ DISCORD_ATTACHMENT_ALLOWED_HOSTS: 'example.com, CDN.Example.ORG' }))
      .toEqual(['example.com', 'cdn.example.org']);
  });

  it('adds hosts via DISCORD_ATTACHMENT_ALLOWED_HOSTS_ADD', () => {
    expect(resolveAllowedAttachmentHosts({
      DISCORD_ATTACHMENT_ALLOWED_HOSTS_ADD: 'images.example.com, CDN.Example.ORG',
    })).toEqual([
      'cdn.discordapp.com',
      'media.discordapp.net',
      'images.example.com',
      'cdn.example.org',
    ]);
  });

  it('removes hosts via DISCORD_ATTACHMENT_ALLOWED_HOSTS_REMOVE', () => {
    expect(resolveAllowedAttachmentHosts({
      DISCORD_ATTACHMENT_ALLOWED_HOSTS_REMOVE: 'media.discordapp.net',
    })).toEqual(['cdn.discordapp.com']);
  });

  it('applies base, add, then remove', () => {
    expect(resolveAllowedAttachmentHosts({
      DISCORD_ATTACHMENT_ALLOWED_HOSTS: 'cdn.discordapp.com,old.example',
      DISCORD_ATTACHMENT_ALLOWED_HOSTS_ADD: 'img.example.com',
      DISCORD_ATTACHMENT_ALLOWED_HOSTS_REMOVE: 'old.example',
    })).toEqual(['cdn.discordapp.com', 'img.example.com']);
  });

  it('ignores add/remove when base is *', () => {
    expect(resolveAllowedAttachmentHosts({
      DISCORD_ATTACHMENT_ALLOWED_HOSTS: '*',
      DISCORD_ATTACHMENT_ALLOWED_HOSTS_ADD: 'x.example',
      DISCORD_ATTACHMENT_ALLOWED_HOSTS_REMOVE: 'cdn.discordapp.com',
    })).toBe('*');
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

  it('allows hosts added via env', () => {
    expect(() => assertAttachmentUrlAllowed(
      'https://images.example.com/a.png',
      { DISCORD_ATTACHMENT_ALLOWED_HOSTS_ADD: 'images.example.com' }
    )).not.toThrow();
  });

  it('rejects oversized base64 payloads', () => {
    const huge = 'A'.repeat(Math.ceil(MAX_ATTACHMENT_BYTES / 3) * 4 + 9);
    expect(() => decodeAttachmentData(huge)).toThrow(/maximum size/);
    expect(decodeAttachmentData(Buffer.from('ok').toString('base64')).toString()).toBe('ok');
  });
});
