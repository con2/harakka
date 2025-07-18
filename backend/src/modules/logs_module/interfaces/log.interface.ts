export interface AuditLog {
  id?: string;
  table_name: string;
  record_id: string;
  action: string;
  user_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at: string;
}

export interface LogMessage {
  id?: string;
  timestamp: string;
  level: "error" | "warning" | "info" | "debug";
  message: string;
  source?: string;
  metadata?: Record<string, unknown>;
}
