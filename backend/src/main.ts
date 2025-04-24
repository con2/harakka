import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);

    // Get allowed origins from config
    const allowedOrigins = configService.get<string>(
      'ALLOWED_ORIGINS',
      'http://localhost:5180',
    );
    const origins = allowedOrigins.split(',');

    app.enableCors({
      origin: origins,
      credentials: true,
    });

    await app.listen(port);
    logger.log(`Backend is running on port ${port}`);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to start application: ${errorMessage}`);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  console.error('Unhandled bootstrap error:', err);
  process.exit(1);
});
