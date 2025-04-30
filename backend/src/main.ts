import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Use Azure's expected PORT (typically 8080) with fallback
    const port = configService.get<number>("PORT", 8080);

    // Enhanced CORS configuration with explicit Azure domain handling
    app.enableCors({
      origin: true, // Allow all origins temporarily to debug
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
      maxAge: 86400, // Cache preflight response for 24 hours
    });

    // Log CORS settings for debugging
    logger.log(
      `CORS enabled: ${configService.get<string>("ALLOWED_ORIGINS", "all origins allowed")}`,
    );

    // Add a comprehensive health check endpoint for Azure monitoring
    app.getHttpAdapter().get("/health", async (req, res) => {
      try {
        // Check database connection (Supabase)
        const configService = app.get(ConfigService);
        const supabaseUrl = configService.get("SUPABASE_URL");
        const supabaseServiceKey = configService.get(
          "SUPABASE_SERVICE_ROLE_KEY",
        );

        let dbStatus = "ok";
        if (supabaseUrl && supabaseServiceKey) {
          // Test connection by getting a simple query
          try {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);
            await supabase
              .from("user_profiles")
              .select("count", { count: "exact", head: true });
          } catch (error) {
            dbStatus = "error";
          }
        }

        // Return comprehensive health status
        res.status(200).send({
          status: "healthy",
          timestamp: new Date().toISOString(),
          env: process.env.NODE_ENV,
          dbStatus,
          uptime: process.uptime(),
        });
      } catch (error) {
        res.status(500).send({
          status: "unhealthy",
          error: error.message,
        });
      }
    });

    // Listen on all network interfaces as required by Azure
    await app.listen(port, "0.0.0.0");
    logger.log(`Backend is running on port ${port}`);
    // Also ensure your NestJS app has proper startup logging:
    logger.log(`Backend environment: ${process.env.NODE_ENV}`);
    logger.log(
      `Allowed origins: ${configService.get<string>("ALLOWED_ORIGINS", "none configured")}`,
    );
    logger.log(
      `Supabase URL configured: ${Boolean(configService.get("SUPABASE_URL"))}`,
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Failed to start application: ${errorMessage}`);
    process.exit(1);
  }
}

// Handle graceful shutdown for Azure
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

// Add these lines to your bootstrap function in main.ts
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Application should continue running despite unhandled promise rejections
});

bootstrap().catch((err) => {
  console.error("Unhandled bootstrap error:", err);
  process.exit(1);
});
