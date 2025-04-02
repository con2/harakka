import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { SupabaseService } from './services/supabase.service';
import { StorageItemsService } from './services/storage-items.service';
import { StorageItemsController } from './controllers/storage-items.controller';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, StorageItemsController  , UserController],
  providers: [AppService, SupabaseService, StorageItemsService, UserService],
})
export class AppModule {}
