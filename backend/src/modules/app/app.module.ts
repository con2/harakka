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
import { BookingController } from "../booking/booking.controller";
import { UserController } from "../user/user.controller";
import { BookingItemsModule } from "../booking_items/booking-items.module";
import { BookingItemsController } from "../booking_items/booking-items.controller";
import { LogsController } from "../logs_module/logs.controller";
import { RoleModule } from "../role/role.module";
import { RoleController } from "../role/role.controller";
import { AuthModule } from "../auth/auth.module";
import { JwtModule } from "../jwt/jwt.module";

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
    JwtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
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

        // Public storage and item endpoints (for front page)
        { path: "storage", method: RequestMethod.GET },
        { path: "storage-items", method: RequestMethod.GET },
        { path: "storage-items/(.*)", method: RequestMethod.GET }, // For specific item endpoints
        { path: "api/storage-locations", method: RequestMethod.GET },
        { path: "storage-locations", method: RequestMethod.GET },
        { path: "storage-locations/(.*)", method: RequestMethod.GET },

        // Public tag endpoints
        { path: "tags", method: RequestMethod.GET },
        { path: "tags/(.*)", method: RequestMethod.GET },

        // Public item images endpoints
        { path: "item-images/(.*)", method: RequestMethod.GET },

        // Public booking availability endpoints (for checking item availability)
        { path: "bookings/availability/(.*)", method: RequestMethod.GET },
      )
      .forRoutes(
        // Protected controllers
        BookingController,
        UserController,
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
