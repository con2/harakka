// Lightweight HTML sanitizer for incoming user content in e‑mails.
// NOTE: This is intentionally conservative. It removes script/style blocks,
// event handler attributes, inline styles, javascript:/data: URLs, and any
// tags outside a small allow‑list. It is not a full HTML parser, but is
// suitable to reduce XSS risk for simple contact messages.

const ALLOWED_TAGS = [
  "p",
  "br",
  "b",
  "strong",
  "i",
  "em",
  "u",
  "s",
  "a",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "pre",
  "hr",
];

const ALLOWED_URL_SCHEMES = ["http:", "https:", "mailto:"];

export function sanitizeSubject(input: string): string {
  // Strip CRLF and control chars to avoid header injection; trim length
  return input.replace(/[\r\n\t\0]/g, " ").slice(0, 255);
}

export function sanitizeEmailHtml(input: string): string {
  let s = String(input || "");

  // Remove comments, script/style blocks entirely
  s = s.replace(/<!--([\s\S]*?)-->/g, "");
  s = s.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, "");
  s = s.replace(/<\s*style[^>]*>[\s\S]*?<\s*\/\s*style\s*>/gi, "");

  // Remove on* event handlers and inline styles
  s = s.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/\sstyle\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Neutralize javascript: and data: URLs in href/src
  s = s.replace(/\s(href|src)\s*=\s*("|')\s*(javascript:|data:)[^"']*(\2)/gi, "");
  s = s.replace(/\s(href|src)\s*=\s*([^\s"'>]+)/gi, (m, attr, url) => {
    try {
      const u = new URL(url, "https://example.org");
      if (!ALLOWED_URL_SCHEMES.includes(u.protocol)) return "";
    } catch {
      return ""; // drop malformed URLs
    }
    return ` ${attr}=${url}`; // keep as-is (unquoted attribute)
  });
  s = s.replace(/\s(href|src)\s*=\s*("|')([^"']*)(\2)/gi, (m, attr, q, url) => {
    try {
      const u = new URL(url, "https://example.org");
      if (!ALLOWED_URL_SCHEMES.includes(u.protocol)) return "";
    } catch {
      return "";
    }
    return ` ${attr}=${q}${url}${q}`;
  });

  // Remove disallowed tags entirely (keep inner text)
  const allowed = ALLOWED_TAGS.join("|");
  // Replace opening tags not in allow‑list with empty string
  s = s.replace(
    new RegExp(`<\\s*(?!\/?(?:${allowed})\\b)[a-z0-9-]+[^>]*>`, "gi"),
    "",
  );
  // Replace closing tags not in allow‑list
  s = s.replace(
    new RegExp(`<\\/\\s*(?!${allowed}\\b)[a-z0-9-]+\\s*>`, "gi"),
    "",
  );

  // For anchor tags, keep only href attribute (strip others)
  s = s.replace(/<a\s+([^>]*?)>/gi, (m, attrs) => {
    const hrefMatch = attrs.match(/href\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
    let safeHref = "";
    if (hrefMatch) {
      let raw = hrefMatch[1];
      if (raw.startsWith("\"") || raw.startsWith("'")) {
        raw = raw.slice(1, -1);
      }
      try {
        const u = new URL(raw, "https://example.org");
        if (ALLOWED_URL_SCHEMES.includes(u.protocol)) {
          // Rebuild as quoted attribute
          safeHref = ` href="${raw}"`;
        }
      } catch {
        // ignore invalid href
      }
    }
    return `<a${safeHref}>`;
  });

  return s;
}

