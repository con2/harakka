export interface LogMessage {
  id?: string;
  timestamp: string;
  level: "error" | "warning" | "info" | "debug";
  message: string;
  source?: string;
  metadata?: Record<string, any>;
}
