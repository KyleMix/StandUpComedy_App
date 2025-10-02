const dangerousTags = /(script|style|iframe|object|embed|link|meta)/gi;
const eventAttributes = /on\w+=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const javascriptHref = /href=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi;

export function sanitizeHtml(input: string): string {
  if (!input) {
    return "";
  }
  let sanitized = input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  sanitized = sanitized.replace(dangerousTags, "");
  sanitized = sanitized.replace(eventAttributes, "");
  sanitized = sanitized.replace(javascriptHref, "");
  return sanitized;
}
