/** Discord CDN hosts used by attachment URLs from discord_read_messages. */
export const DEFAULT_ATTACHMENT_URL_HOSTS = [
  "cdn.discordapp.com",
  "media.discordapp.net",
] as const;

/** Default soft cap for base64 attachments (MiB). Override with DISCORD_ATTACHMENT_MAX_MB. */
export const DEFAULT_ATTACHMENT_MAX_MB = 25;

/** Default soft cap in bytes (Discord upload limit is typically ≤ 25 MiB). */
export const MAX_ATTACHMENT_BYTES = DEFAULT_ATTACHMENT_MAX_MB * 1024 * 1024;

function parseHostList(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
}

/**
 * Resolve the attachment URL host allowlist.
 *
 * - Base: `DISCORD_ATTACHMENT_ALLOWED_HOSTS` if set, else Discord CDN defaults.
 *   Use `*` to allow any https host (add/remove are ignored).
 * - `DISCORD_ATTACHMENT_ALLOWED_HOSTS_ADD`: comma-separated hosts to add.
 * - `DISCORD_ATTACHMENT_ALLOWED_HOSTS_REMOVE`: comma-separated hosts to remove.
 */
export function resolveAllowedAttachmentHosts(
  env: NodeJS.ProcessEnv = process.env
): string[] | "*" {
  const baseRaw = env.DISCORD_ATTACHMENT_ALLOWED_HOSTS?.trim();
  if (baseRaw === "*") {
    return "*";
  }

  const base = baseRaw
    ? parseHostList(baseRaw)
    : [...DEFAULT_ATTACHMENT_URL_HOSTS];
  const add = parseHostList(env.DISCORD_ATTACHMENT_ALLOWED_HOSTS_ADD);
  const remove = new Set(parseHostList(env.DISCORD_ATTACHMENT_ALLOWED_HOSTS_REMOVE));

  const merged = new Set<string>([...base, ...add]);
  for (const host of remove) {
    merged.delete(host);
  }
  return [...merged];
}

/**
 * Resolve max decoded attachment size in bytes.
 * `DISCORD_ATTACHMENT_MAX_MB`: positive integer MiB (default 25). `0` disables the cap.
 */
export function resolveMaxAttachmentBytes(
  env: NodeJS.ProcessEnv = process.env
): number | null {
  const raw = env.DISCORD_ATTACHMENT_MAX_MB?.trim();
  if (raw === undefined || raw === "") {
    return MAX_ATTACHMENT_BYTES;
  }
  if (!/^\d+$/.test(raw)) {
    throw new Error(
      `Invalid DISCORD_ATTACHMENT_MAX_MB: ${raw}. Use a non-negative integer (MiB), or 0 to disable`
    );
  }
  const mb = Number(raw);
  if (mb === 0) {
    return null;
  }
  return mb * 1024 * 1024;
}

export function assertAttachmentUrlAllowed(
  url: string,
  env: NodeJS.ProcessEnv = process.env
): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid attachment URL: ${url}`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Attachment URL must use https");
  }
  const allowed = resolveAllowedAttachmentHosts(env);
  if (allowed === "*") {
    return;
  }
  const host = parsed.hostname.toLowerCase();
  if (!allowed.includes(host)) {
    throw new Error(
      `Attachment URL host not allowed: ${host}. Allowed: ${allowed.join(", ") || "(none)"}. ` +
        `Adjust DISCORD_ATTACHMENT_ALLOWED_HOSTS / _ADD / _REMOVE, or set DISCORD_ATTACHMENT_ALLOWED_HOSTS=* for any https host`
    );
  }
}

/** Decode base64 attachment data with a size guard (see DISCORD_ATTACHMENT_MAX_MB). */
export function decodeAttachmentData(
  data: string,
  env: NodeJS.ProcessEnv = process.env
): Buffer {
  const maxBytes = resolveMaxAttachmentBytes(env);
  if (maxBytes !== null) {
    // Reject obviously oversized base64 before allocating the full buffer.
    // Base64 expands ~4/3; require encoded length to fit under the cap with padding slack.
    const maxEncoded = Math.ceil(maxBytes / 3) * 4 + 8;
    if (data.length > maxEncoded) {
      throw new Error(
        `Attachment data exceeds maximum size of ${maxBytes} bytes (DISCORD_ATTACHMENT_MAX_MB)`
      );
    }
  }
  const buf = Buffer.from(data, "base64");
  if (maxBytes !== null && buf.length > maxBytes) {
    throw new Error(
      `Attachment data exceeds maximum size of ${maxBytes} bytes (DISCORD_ATTACHMENT_MAX_MB)`
    );
  }
  return buf;
}
