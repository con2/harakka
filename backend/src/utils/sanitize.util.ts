// Security-hardened sanitizer for incoming user HTML used in e-mails.
// Replaces previous custom RegExp-based approach to avoid ReDoS and
// incomplete sanitization issues flagged by CodeQL.
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [];

export function sanitizeSubject(input: string): string {
  // Strip CRLF and control chars to avoid header injection; trim length
  return (input ?? "").replace(/[\r\n\t\0]/g, " ").slice(0, 255);
}

export function sanitizeEmailHtml(input: string): string {
  return sanitizeHtml(input ?? "", {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform(
        "a",
        { rel: "noopener noreferrer nofollow" },
        true,
      ),
    },
  });
}
