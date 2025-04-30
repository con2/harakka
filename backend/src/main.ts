import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const port = process.env.PORT || configService.get<number>("PORT", 3000);
    logger.log(
      `Using port: ${port} (Environment: ${process.env.NODE_ENV || "development"})`,
    );

    // Simplified CORS configuration
    const allowedOrigins = configService.get<string>("ALLOWED_ORIGINS", "*");
    const origins = allowedOrigins.split(",");
    logger.log(`CORS enabled for origins: ${origins.join(", ")}`);

    app.enableCors({
      origin: origins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
    });

    await app.listen(port, "0.0.0.0");
    logger.log(`Backend is running on port ${port}`);
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
