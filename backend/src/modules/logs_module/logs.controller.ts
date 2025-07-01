import {
  Controller,
  Get,
  UnauthorizedException,
  Logger,
  InternalServerErrorException,
  Req,
  Query,
} from "@nestjs/common";
import { LogsService } from "./logs.service";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { logError } from "src/utils/logging";

@Controller("logs")
export class LogsController {
  private readonly logger = new Logger(LogsController.name);

  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getAllLogs(
    @Req() req: AuthRequest,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10",
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException("User ID is required for authorization");
    }

    try {
      const pageNumber = parseInt(page, 1);
      const limitNumber = parseInt(limit, 10);
      const logs = await this.logsService.getAllLogs(
        req,
        pageNumber,
        limitNumber,
      );

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
        (typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof (error as { message?: unknown }).message === "string" &&
          (error as { message: string }).message.includes("permission"))
      ) {
        throw error;
      }

      logError(
        this.logsService,
        "Error fetching logs",
        "LogsController",
        error,
        { route: "GET /logs" },
      );

      throw new InternalServerErrorException("Failed to retrieve logs");
    }
  }
}
