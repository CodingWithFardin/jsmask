const DEFAULT_KEYS = [
  "password", "passwd", "secret", "token", "api_key", "apikey", "authorization",
  "cookie", "set-cookie", "private_key", "access_token", "refresh_token", "session",
];

const PATTERNS = [
  /\b(sk-[A-Za-z0-9_-]{16,})\b/g,
  /\b(gh[pousr]_[A-Za-z0-9]{20,})\b/g,
  /\b(AKIA[0-9A-Z]{16})\b/g,
  /\b(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b/g,
  /("(?:password|token|secret)"\s*:\s*")([^"]+)(")/g,
];

export function maskText(text, replacement = "[REDACTED]") {
  let out = String(text);
  for (const pattern of PATTERNS.slice(0, -1)) {
    out = out.replace(pattern, () => replacement);
  }
  const jsonPair = PATTERNS[PATTERNS.length - 1];
  return out.replace(jsonPair, (_m, head, _value, tail) => head + replacement + tail);
}

export function maskObject(value, { keys = DEFAULT_KEYS, keep = 4, replacement = "[REDACTED]" } = {}) {
  const lowered = new Set(keys.map((k) => k.toLowerCase()));
  const walk = (node, depth) => {
    if (depth > 12) return node;
    if (Array.isArray(node)) return node.map((item) => walk(item, depth + 1));
    if (node && typeof node === "object") {
      const out = {};
      for (const [key, val] of Object.entries(node)) {
        if (lowered.has(key.toLowerCase()) && typeof val === "string") {
          out[key] = keep > 0 && val.length > keep * 2
            ? val.slice(0, keep) + "..." + replacement
            : replacement;
        } else {
          out[key] = walk(val, depth + 1);
        }
      }
      return out;
    }
    if (typeof node === "string") return maskText(node, replacement);
    return node;
  };
  return walk(value, 0);
}
