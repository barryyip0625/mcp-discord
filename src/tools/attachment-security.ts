/** Discord CDN hosts used by attachment URLs from discord_read_messages. */
export const DEFAULT_ATTACHMENT_URL_HOSTS = [
  "cdn.discordapp.com",
  "media.discordapp.net",
] as const;

/** Soft cap before decoding base64 (Discord upload limit is typically ≤ 25 MiB). */
export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export function resolveAllowedAttachmentHosts(
  env: NodeJS.ProcessEnv = process.env
): string[] | "*" {
  const raw = env.DISCORD_ATTACHMENT_ALLOWED_HOSTS?.trim();
  if (!raw) {
    return [...DEFAULT_ATTACHMENT_URL_HOSTS];
  }
  if (raw === "*") {
    return "*";
  }
  return raw.split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
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
      `Attachment URL host not allowed: ${host}. Allowed: ${allowed.join(", ")} ` +
        `(set DISCORD_ATTACHMENT_ALLOWED_HOSTS to a comma-separated list, or * to allow any https host)`
    );
  }
}

/** Decode base64 attachment data with a size guard. */
export function decodeAttachmentData(data: string): Buffer {
  // Reject obviously oversized base64 before allocating the full buffer.
  // Base64 expands ~4/3; require encoded length to fit under the cap with padding slack.
  const maxEncoded = Math.ceil(MAX_ATTACHMENT_BYTES / 3) * 4 + 8;
  if (data.length > maxEncoded) {
    throw new Error(
      `Attachment data exceeds maximum size of ${MAX_ATTACHMENT_BYTES} bytes`
    );
  }
  const buf = Buffer.from(data, "base64");
  if (buf.length > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Attachment data exceeds maximum size of ${MAX_ATTACHMENT_BYTES} bytes`
    );
  }
  return buf;
}
