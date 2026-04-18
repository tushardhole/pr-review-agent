const DEBUG_FLAG = "DEBUG_LLM_RESPONSE";
const MAX_CHARS_FLAG = "DEBUG_LLM_RESPONSE_MAX_CHARS";
const REDACT_FLAG = "DEBUG_LLM_RESPONSE_REDACT";
const DEFAULT_MAX_CHARS = 4000;

const secretPatterns: RegExp[] = [
  /sk-[A-Za-z0-9_-]{10,}/g,
  /ghp_[A-Za-z0-9]{20,}/g,
  /Bearer\s+[A-Za-z0-9._-]{10,}/gi
];

export interface DebugLogger {
  isEnabled: boolean;
  log(label: string, value: string): void;
}

const parseMaxChars = (raw: string | undefined): number => {
  if (!raw) {
    return DEFAULT_MAX_CHARS;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return DEFAULT_MAX_CHARS;
  }
  return parsed;
};

const shouldRedact = (): boolean => {
  const raw = process.env[REDACT_FLAG];
  if (!raw) {
    return true;
  }
  return raw === "true";
};

const redactSecrets = (value: string): string =>
  secretPatterns.reduce((current, pattern) => current.replace(pattern, "[REDACTED]"), value);

const truncate = (value: string, maxChars: number): string => {
  if (value.length <= maxChars) {
    return value;
  }
  return `${value.slice(0, maxChars)}\n...[truncated ${value.length - maxChars} chars]`;
};

export const createDebugLogger = (): DebugLogger => {
  const isEnabled = process.env[DEBUG_FLAG] === "true";
  const maxChars = parseMaxChars(process.env[MAX_CHARS_FLAG]);
  const redact = shouldRedact();

  return {
    isEnabled,
    log: (label: string, value: string): void => {
      if (!isEnabled) {
        return;
      }
      const sanitized = redact ? redactSecrets(value) : value;
      const output = truncate(sanitized, maxChars);
      console.log(`[llm-debug] ${label} start`);
      console.log(output);
      console.log(`[llm-debug] ${label} end`);
    }
  };
};
