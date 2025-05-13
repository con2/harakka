import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./controllers/app.controller";
import { AppService } from "./services/app.service";
import { SupabaseService } from "./services/supabase.service";
import { StorageItemsService } from "./services/storage-items.service";
import { StorageItemsController } from "./controllers/storage-items.controller";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import * as path from "path";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { BookingController } from "./controllers/booking.controller";
import { BookingService } from "./services/booking.service";
import { TagController } from "./controllers/tag.controller";
import { TagService } from "./services/tag.service";
import { MailService } from "./services/mail.service";
import { ItemImagesController } from "./controllers/item-images.controller";
import { ItemImagesService } from "./services/item-images.service";
import { S3Service } from "./services/s3-supabase.service";
import { InvoiceService } from "./services/invoice.service";
import { StorageLocationsController } from "./controllers/storage-locations.controller";
import { StorageLocationsService } from "./services/storage-locations.service";
import { MailModule } from './mail/mail.module';

// Load and expand environment variables before NestJS modules initialize
const envFile = path.resolve(process.cwd(), "../.env.local"); //TODO: check if this will work for deployment
const env = dotenv.config({ path: envFile });
dotenvExpand.expand(env);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    MailModule,
  ],
  controllers: [
    AppController,
    StorageItemsController,
    UserController,
    BookingController,
    TagController,
    ItemImagesController,
    StorageLocationsController,
  ],
  providers: [
    AppService,
    SupabaseService,
    StorageItemsService,
    UserService,
    BookingService,
    TagService,
    MailService,
    ItemImagesService,
    S3Service,
    InvoiceService,
    StorageLocationsService,
  ],
})
export class AppModule {}
