/**
 * Prevents Open Redirect Attacks
 * Validates that redirect destination URLs are internal and safe.
 */
export function validateRedirectUrl(urlStr?: string | null, fallback = "/"): string {
  if (!urlStr || typeof urlStr !== "string") {
    return fallback;
  }

  const trimmed = urlStr.trim();

  // 1. Safe relative paths (e.g. "/account", "/checkout")
  // Must start with '/' but NOT '//' or '/\' (protocol-relative phishing attack)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }

  // 2. If absolute URL, ensure it strictly matches our app's configured domain
  try {
    const parsed = new URL(trimmed);
    const allowedHostnames = [
      "localhost",
      "127.0.0.1",
      "avanya.in",
      "www.avanya.in",
    ];

    if (process.env.NEXT_PUBLIC_APP_URL) {
      try {
        const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
        allowedHostnames.push(appUrl.hostname);
      } catch {}
    }

    if (allowedHostnames.includes(parsed.hostname)) {
      return parsed.pathname + parsed.search + parsed.hash;
    }
  } catch {}

  // If untrusted or invalid, safely return fallback
  return fallback;
}

/**
 * SSRF (Server-Side Request Forgery) Protection
 * Validates that outbound webhooks or image fetch URLs do not target internal networks or cloud metadata APIs.
 */
export function isSafeOutboundUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);

    // Only allow HTTP/HTTPS
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }

    const host = parsed.hostname.toLowerCase();

    // 1. Loopback and internal names
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".local") ||
      host.endsWith(".internal")
    ) {
      return false;
    }

    // 2. AWS / GCP / Azure Instance Metadata Service (IMDS)
    if (host === "169.254.169.254" || host.startsWith("169.254.")) {
      return false;
    }

    // 3. RFC1918 Private IPv4 address blocks
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = host.match(ipv4Regex);
    if (match) {
      const octet1 = parseInt(match[1], 10);
      const octet2 = parseInt(match[2], 10);

      // 10.0.0.0/8
      if (octet1 === 10) return false;
      // 172.16.0.0/12
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
      // 192.168.0.0/16
      if (octet1 === 192 && octet2 === 168) return false;
      // 127.0.0.0/8
      if (octet1 === 127) return false;
      // 0.0.0.0/8
      if (octet1 === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}
