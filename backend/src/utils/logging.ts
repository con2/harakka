import { LogsService } from "../services/logs.service";

export function logInfo(
  logsService: LogsService,
  message: string,
  source: string,
  metadata?: Record<string, any>,
) {
  logsService.createLog({
    level: "info",
    message,
    source,
    metadata,
  });
}

export function logWarning(
  logsService: LogsService,
  message: string,
  source: string,
  metadata?: Record<string, any>,
) {
  logsService.createLog({
    level: "warning",
    message,
    source,
    metadata,
  });
}

export function logError(
  logsService: LogsService,
  message: string,
  source: string,
  error?: Error,
  metadata?: Record<string, any>,
) {
  logsService.createLog({
    level: "error",
    message,
    source,
    metadata: {
      ...metadata,
      errorMessage: error?.message,
      stack: error?.stack,
    },
  });
}
