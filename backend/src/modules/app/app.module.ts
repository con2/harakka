import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import * as path from "path";
import * as dotenv from "dotenv";
import * as dotenvExpand from "dotenv-expand";
import { ThrottlerModule } from "@nestjs/throttler";
import { AdminModule } from "../admin/admin.module";
import { BookingModule } from "../booking/booking.module";
import { ItemImagesModule } from "../item-images/item-images.module";
import { LogsModule } from "../logs_module/logs.module";
import { MailModule } from "../mail/mail.module";
import { StorageItemsModule } from "../storage-items/storage-items.module";
import { StorageLocationsModule } from "../storage-locations/storage-locations.module";
import { TagModule } from "../tag/tag.module";
import { UserModule } from "../user/user.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { AuthMiddleware } from "../../middleware/Auth.middleware";
import { AuthTestController } from "../AuthTest/authTest.controller";
import { AuthTestService } from "../AuthTest/authTest.service";
import { BookingController } from "../booking/booking.controller";
import { UserController } from "../user/user.controller";
import { StorageLocationsController } from "../storage-locations/storage-locations.controller";
import { BookingItemsModule } from "../booking_items/booking-items.module";
import { BookingItemsController } from "../booking_items/booking-items.controller";
import { LogsController } from "../logs_module/logs.controller";
import { RoleModule } from "../role/role.module";
import { RoleController } from "../role/role.controller";
import { AuthModule } from "../auth/auth.module";

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
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // time to live in milliseconds (1 minute)
          limit: 5, // max 5 requests per minute
        },
      ],
    }),
    AdminModule,
    AuthModule,
    BookingModule,
    ItemImagesModule,
    LogsModule,
    MailModule,
    StorageItemsModule,
    StorageLocationsModule,
    TagModule,
    UserModule,
    SupabaseModule,
    BookingItemsModule,
    RoleModule,
  ],
  controllers: [AppController, AuthTestController],
  providers: [AppService, AuthTestService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        // Public authentication endpoints - these should NOT require authentication
        { path: "auth/test-login", method: RequestMethod.POST },
        { path: "auth/get-fresh-token", method: RequestMethod.POST },
        { path: "auth/endpoints", method: RequestMethod.GET },
        // Health checks and public endpoints
        { path: "health", method: RequestMethod.GET },
        { path: "", method: RequestMethod.GET }, // Root endpoint
        { path: "storage", method: RequestMethod.GET },
      )
      // ⬇️  List every non-GET verb you want protected
      .forRoutes(
        // Protected controllers
        BookingController,
        UserController,
        StorageLocationsController,
        BookingItemsController,
        LogsController,
        RoleController,

        // Protected HTTP methods (all routes except excluded ones)
        { path: "*", method: RequestMethod.POST },
        { path: "*", method: RequestMethod.PUT },
        { path: "*", method: RequestMethod.PATCH },
        { path: "*", method: RequestMethod.DELETE },
        { path: "*", method: RequestMethod.GET }, // Protect GET routes too, except excluded ones
      );
  }
}
