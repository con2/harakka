import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Injectable,
} from "@nestjs/common";
import { Request, Response } from "express";
import { LogsService } from "../services/logs.service";

@Injectable()
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private logsService: LogsService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
          ? exception.message
          : "Unknown error";

    // Detailed logging but only in server logs
    this.logger.error(`Exception: ${message}`);
    if (exception instanceof Error) {
      this.logger.error(exception.stack);
    }

    // Log to system logs so it appears in the Logs component
    this.logsService.createLog({
      level: "error",
      message: `[${status}] ${message}`,
      source: "AllExceptionsFilter",
      metadata: {
        status,
        path: request.url,
        method: request.method,
        timestamp: new Date().toISOString(),
        stack: exception instanceof Error ? exception.stack : undefined,
        logType: "system",
      },
    });

    // Safe response to client
    response.status(status).json({
      statusCode: status,
      message:
        exception instanceof HttpException
          ? exception.message
          : "An unexpected error occurred",
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
