import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { Response } from "express";
import { SupabaseService } from "./modules/supabase/supabase.service";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { LogsService } from "./modules/logs_module/logs.service";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  try {
    logger.log("🚀 Starting NestJS Backend Application...");

    // Log environment variables for debugging
    logger.log("📋 Environment Configuration:");
    logger.log(`  - NODE_ENV: ${process.env.NODE_ENV}`);
    logger.log(`  - PORT: ${process.env.PORT}`);
    logger.log(
      `  - SUPABASE_URL: ${process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + "..." : "NOT SET"}`,
    );
    logger.log(
      `  - JWT_SECRET: ${process.env.JWT_SECRET ? "[SET]" : "[NOT SET]"}`,
    );
    logger.log(`  - ALLOWED_ORIGINS: ${process.env.ALLOWED_ORIGINS}`);

    const app = await NestFactory.create(AppModule);
    logger.log("✅ NestJS application created successfully");

    const configService = app.get(ConfigService);

    // Get LogsService first so we can pass it to the filter
    const logsService = app.get(LogsService);

    // Add the global exception filter
    app.useGlobalFilters(new AllExceptionsFilter(logsService));

    const port = process.env.PORT || configService.get<number>("PORT", 3000);
    logger.log(
      `Using port: ${port} (Environment: ${process.env.NODE_ENV || "development"})`,
    );

    // Enhanced CORS configuration for containerized environment
    const allowedOrigins = configService.get<string>("ALLOWED_ORIGINS", "*");
    const origins = allowedOrigins.split(",").map((origin) => origin.trim());
    logger.log(`CORS enabled for origins: ${origins.join(", ")}`);

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        // Allow any origin if * is in the list
        if (origins.includes("*")) return callback(null, true);
        
        // Check if origin is in allowed list
        if (origins.includes(origin)) return callback(null, true);
        
        // Allow localhost on any port for development
        if (origin.match(/^http:\/\/localhost(:\d+)?$/))
          return callback(null, true);
        
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    app.getHttpAdapter().get("/health", async (req, res: Response) => {
      try {
        // Test Supabase connection
        const supabase = app.get(SupabaseService).getServiceClient();
        const { error } = await supabase
          .from("storage_items")
          .select("count", { count: "exact", head: true });

        const dbStatus = error ? "error" : "connected";

        res.status(200).json({
          status: "ok",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "development",
          supabase: {
            status: dbStatus,
            url: process.env.SUPABASE_URL ? "configured" : "missing",
            error: error ? error.message : null,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({
          status: "error",
          message: errorMessage,
          timestamp: new Date().toISOString(),
        });
      }
    });

    await app.listen(port, "0.0.0.0");
    logger.log(`🎉 Backend server successfully started on port ${port}`);
    logger.log(`🔗 Health check: http://localhost:${port}/health`);
    logger.log(`📡 API ready to accept requests!`);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to start application: ${errorMessage}`);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  console.error("Unhandled bootstrap error:", err);
  process.exit(1);
});
