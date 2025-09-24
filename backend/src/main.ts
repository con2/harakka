import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { ConfigService } from "@nestjs/config";
import { Logger, ValidationPipe } from "@nestjs/common";
import { Response } from "express";
import { SupabaseService } from "./modules/supabase/supabase.service";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { LogsService } from "./modules/logs_module/logs.service";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Get LogsService first so we can pass it to the filter
    const logsService = app.get(LogsService);

    // Add the global exception filter
    app.useGlobalFilters(new AllExceptionsFilter(logsService));

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false, value: false },
      }),
    );

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
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        // Custom headers (allow both casings just in case)
        "x-user-id",
        "x-org-id",
        "x-role-name",
        "x-role-version",
      ],
      exposedHeaders: [
        // Expose role version header so the frontend can read it
        "x-role-version",
      ],
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

    // Logging after server started
    logger.log(`Backend is running on port ${port}`);

    if ((process.env.NODE_ENV || "development") === "development") {
      logger.log("Current environment variables:", {
        ENVIRONMENT: process.env.ENV,
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      });
      logger.log(`Backend is running on port ${port}`);
    }
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
