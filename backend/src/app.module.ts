import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { SupabaseService } from './services/supabase.service';
import { StorageItemsService } from './services/storage-items.service';
import { StorageItemsController } from './controllers/storage-items.controller';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { TagController } from './controllers/tag.controller';
import { TagService } from './services/tag.service';

// Load and expand environment variables before NestJS modules initialize
const envFile = path.resolve(process.cwd(), '../.env.local');
const env = dotenv.config({ path: envFile });
dotenvExpand.expand(env);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
  ],
  controllers: [AppController, StorageItemsController, UserController, TagController],
  providers: [AppService, SupabaseService, StorageItemsService, UserService, TagService],
})
export class AppModule {}
