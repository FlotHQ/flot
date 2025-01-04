import pino from "pino";

export const logger = pino({
  browser: {
    asObject: true,
    write: (logEvent) => {
      console[logEvent.level as unknown as keyof typeof console](logEvent);
    },
    formatters: { level: (label) => ({ level: label }) },
    serialize: true,
    transmit: {
      level: "warn",
      async send(level, logEvent) {
        await fetch("/api/logs/browser/ingest", {
          method: "POST",
          body: JSON.stringify(logEvent),
        });
      },
    },
  },
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});
