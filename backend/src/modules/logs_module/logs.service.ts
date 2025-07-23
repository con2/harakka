import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { LogMessage, AuditLog } from "./interfaces/log.interface";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";
import { getPaginationMeta, getPaginationRange } from "src/utils/pagination";
import { ApiResponse } from "../../../../common/response.types";
import { handleSupabaseError } from "@src/utils/handleError.utils";

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  // In-memory storage for system logs
  private systemLogs: LogMessage[] = [];

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get logs from both audit_logs table and in-memory system logs
   * Only accessible to admin users
   */
  async getAllLogs(
    req: AuthRequest,
    page: number,
    limit: number,
    level?: string,
    logType?: string,
    search?: string,
  ): Promise<ApiResponse<LogMessage>> {
    const supabase = req.supabase;
    const { from, to } = getPaginationRange(page, limit);

    const includeAudit = !logType || logType === "audit";
    const includeSystem = !logType || logType === "system";

    const combinedLogs: LogMessage[] = [];

    if (includeAudit) {
      // Fetch all audit logs without range
      const { data: auditLogs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      // New error handling for Supabase
      if (error) {
        handleSupabaseError(error);
      }

      const formattedAuditLogs = (auditLogs || []).map((log) => ({
        id: log.id,
        timestamp: log.created_at ?? new Date().toISOString(),
        level: this.determineLogLevel(log.action),
        message: this.formatLogMessage(log as AuditLog),
        source: `DB:${log.table_name}`,
        metadata: {
          action: log.action,
          recordId: log.record_id,
          userId: log.user_id ?? undefined,
          oldValues: log.old_values,
          newValues: log.new_values,
          logType: "audit",
        },
      }));

      combinedLogs.push(...formattedAuditLogs);
    }

    if (includeSystem) {
      combinedLogs.push(...this.systemLogs);
    }

    // filtering and search
    const filteredLogs = combinedLogs.filter((log) => {
      const matchesLevel = level
        ? log.level.toLowerCase() === level.toLowerCase()
        : true;
      const matchesSearch = search
        ? log.message.toLowerCase().includes(search.toLowerCase()) ||
          JSON.stringify(log.metadata || {})
            .toLowerCase()
            .includes(search.toLowerCase())
        : true;
      return matchesLevel && matchesSearch;
    });

    // sort by newest first
    filteredLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    // paginate filtered logs
    const paginatedLogs = filteredLogs.slice(from, to + 1);

    const meta = getPaginationMeta(filteredLogs.length, page, limit);

    return {
      data: paginatedLogs,
      error: null,
      count: filteredLogs.length,
      status: 200,
      statusText: "OK",
      metadata: meta,
    };
  }

  /**
   * Map database action to log level
   */
  private determineLogLevel(
    action: string,
  ): "error" | "warning" | "info" | "debug" {
    switch (action?.toLowerCase()) {
      case "delete":
        return "warning";
      case "insert":
      case "update":
        return "info";
      default:
        return "debug";
    }
  }

  /**
   * Create a readable message from the log data
   */
  private formatLogMessage(log: AuditLog): string {
    const action = log.action?.toUpperCase() || "UNKNOWN";
    const table = log.table_name || "unknown_table";

    let message = `${action} operation on ${table}`;

    if (log.record_id) {
      message += ` (ID: ${log.record_id})`;
    }

    return message;
  }

  /**
   * Create a system log entry in memory
   */
  createLog({
    level = "info",
    message,
    source,
    metadata = {},
  }: {
    level?: "error" | "warning" | "info" | "debug";
    message: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      // Log to NestJS logger
      switch (level) {
        case "error":
          this.logger.error(message, source);
          break;
        case "warning":
          this.logger.warn(message, source);
          break;
        case "info":
          this.logger.log(message, source);
          break;
        case "debug":
          this.logger.debug(message, source);
          break;
      }

      // Store in memory (with limit to prevent memory issues)
      const MAX_IN_MEMORY_LOGS = 1000;

      // Add to in-memory logs with timestamp and unique ID
      const logEntry: LogMessage = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        level,
        message,
        source: source || "System",
        metadata: {
          ...metadata,
          logType: "system",
        },
      };

      // Add to beginning for most recent first
      this.systemLogs.unshift(logEntry);

      // Trim if exceeding limit
      if (this.systemLogs.length > MAX_IN_MEMORY_LOGS) {
        this.systemLogs = this.systemLogs.slice(0, MAX_IN_MEMORY_LOGS);
      }

      return true;
    } catch (error) {
      console.error("Failed to create log entry:", error);
      return false;
    }
  }
}
