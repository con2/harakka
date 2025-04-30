import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Use Azure's expected PORT (typically 8080) with fallback
    const port = configService.get<number>("PORT", 8080);

    // Enhanced CORS configuration with explicit Azure domain handling
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);

        // Parse allowed origins from config
        const allowedOrigins = configService.get<string>(
          "ALLOWED_ORIGINS",
          "https://agreeable-grass-049dc8010.4.azurestaticapps.net,https://agreeable-grass-049dc8010.6.azurestaticapps.net,http://localhost:5180",
        );
        const origins = allowedOrigins.split(",").map((o) => o.trim());

        // Check if origin is allowed
        if (
          origins.indexOf(origin) !== -1 ||
          process.env.NODE_ENV !== "production"
        ) {
          callback(null, true);
        } else {
          logger.warn(
            `Blocked origin: ${origin} - not in allowed list: ${origins.join(", ")}`,
          );
          callback(null, false);
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
      maxAge: 86400, // Cache preflight response for 24 hours
    });

    // Add a health check endpoint for Azure monitoring
    app.getHttpAdapter().get("/health", (req, res) => {
      res.status(200).send("Healthy");
    });

    // Listen on all network interfaces as required by Azure
    await app.listen(port, "0.0.0.0");
    logger.log(`Backend is running on port ${port}`);
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

bootstrap().catch((err) => {
  console.error("Unhandled bootstrap error:", err);
  process.exit(1);
});
