import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export function createLogger(service: string) {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    base:  { service },          // every log line carries the service name
    transport: isDev
      ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
      : undefined,               // production: structured JSON to stdout for log aggregators
  });
}

export type Logger = ReturnType<typeof createLogger>;
