import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { LogsService } from "../services/logs.service";

@Controller("logs")
export class LogsController {
  private readonly logger = new Logger(LogsController.name);

  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getAllLogs(@Headers("x-user-id") userId: string) {
    if (!userId) {
      throw new UnauthorizedException("User ID is required for authorization");
    }

    try {
      const logs = await this.logsService.getAllLogs(userId);

      // Log the access for audit purposes
      this.logsService.createLog({
        level: "info",
        message: `Admin user accessed system logs`,
        source: "LogsController",
        metadata: { userId },
      });

      return logs;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error.message.includes("permission")
      ) {
        throw error;
      }

      this.logger.error(`Error fetching logs: ${error.message}`, error.stack);
      throw new InternalServerErrorException("Failed to retrieve logs");
    }
  }
}
