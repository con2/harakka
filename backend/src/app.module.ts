import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { SupabaseService } from './services/supabase.service';
// import { UserController } from './controllers/user.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController/* , UserController */],
  providers: [AppService, SupabaseService],
})
export class AppModule {}
