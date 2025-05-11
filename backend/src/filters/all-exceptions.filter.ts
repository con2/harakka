import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Detailed logging but only in server logs
    this.logger.error(
      `Exception: ${exception instanceof Error ? exception.message : "Unknown error"}`,
    );
    if (exception instanceof Error) {
      this.logger.error(exception.stack);
    }

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
