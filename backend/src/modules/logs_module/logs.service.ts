import { Injectable, Logger, ForbiddenException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { LogMessage, AuditLog } from "./interfaces/log.interface";
import { AuthRequest } from "src/middleware/interfaces/auth-request.interface";

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
  async getAllLogs(req: AuthRequest): Promise<LogMessage[]> {
    const supabase = req.supabase;

    // First check if user is an admin
    const userId = req.user?.id;
    const { data: userProfile, error: userError } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (userError) {
      this.logger.error(`Failed to fetch user profile: ${userError.message}`);
      throw new ForbiddenException("Error verifying user role");
    }

    if (!userProfile || !["admin", "superVera"].includes(userProfile.role)) {
      this.logger.warn(
        `User ${userId} attempted to access logs without admin rights`,
      );
      throw new ForbiddenException("Only administrators can access logs");
    }

    // Fetch audit logs from database
    const { data: auditLogs, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      this.logger.error(`Failed to fetch logs: ${error.message}`);
      throw new Error(`Could not retrieve logs: ${error.message}`);
    }

    // Format audit logs to match frontend expected format
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
    // Combine both log types and sort by timestamp (newest first)
    const combinedLogs = [...formattedAuditLogs, ...this.systemLogs].sort(
      (a, b) =>
        new Date(b.timestamp ?? "").getTime() -
        new Date(a.timestamp ?? "").getTime(),
    );
    return combinedLogs;
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
    metadata?: Record<string, any>;
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
