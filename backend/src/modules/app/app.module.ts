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
import { RolesGuard } from "src/guards/roles.guard";
import { OrganizationsModule } from "../organization/organizations.module";
import { OrganizationsController } from "../organization/organizations.controller";
import { UserBanningModule } from "../user-banning/user-banning.module";
import { OrganizationLocationsModule } from "../organization-locations/organization_locations.module";

// Load and expand environment variables before NestJS modules initialize
// Only load env files if SUPABASE_URL is not already set (meaning env-cmd hasn't run)
if (!process.env.SUPABASE_URL) {
  console.log("SUPABASE_URL not found in environment, loading env files...");

  // Load .env first (base configuration)
  const baseEnvFile = path.resolve(process.cwd(), "../.env");
  const baseEnv = dotenv.config({ path: baseEnvFile });
  dotenvExpand.expand(baseEnv);

  // Load .env.local second (overrides base configuration)
  const localEnvFile = path.resolve(process.cwd(), "../.env.local");
  const localEnv = dotenv.config({ path: localEnvFile });
  dotenvExpand.expand(localEnv);
  console.log(
    "Loaded env files manually:",
    localEnv.parsed ? "SUCCESS" : "FAILED",
  );
} else {
  console.log("Using environment variables from env-cmd or external source");
  console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
}

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
    OrganizationsModule,
    UserBanningModule,
    OrganizationLocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: "APP_GUARD", useClass: RolesGuard }],
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
        { path: "storage-items/*path", method: RequestMethod.GET }, // For specific item endpoints
        { path: "api/storage-locations", method: RequestMethod.GET },
        { path: "storage-locations", method: RequestMethod.GET },
        { path: "storage-locations/*path", method: RequestMethod.GET },

        // Public tag endpoints
        { path: "tags", method: RequestMethod.GET },
        { path: "tags/*path", method: RequestMethod.GET },

        // Public item images endpoints
        { path: "item-images/*path", method: RequestMethod.GET },

        // Public storage-item availability endpoints (for checking item availability)
        { path: "storage-items/availability/*path", method: RequestMethod.GET },

        // Organization_items public endpoints
        { path: "org-items", method: RequestMethod.GET },
        { path: "org-items/*path", method: RequestMethod.GET },

        // Organizations public endpoints
        { path: "organizations", method: RequestMethod.GET },
        { path: "organizations/*path", method: RequestMethod.GET },

        // Organization-locations public endpoints
        { path: "organization-locations", method: RequestMethod.GET },
        { path: "organization-locations/*path", method: RequestMethod.GET },
      )
      .forRoutes(
        // Protected controllers
        BookingController,
        UserController,
        BookingItemsController,
        LogsController,
        RoleController,
        OrganizationsController,

        // Protected HTTP methods (all routes except excluded ones)
        { path: "*", method: RequestMethod.POST },
        { path: "*", method: RequestMethod.PUT },
        { path: "*", method: RequestMethod.PATCH },
        { path: "*", method: RequestMethod.DELETE },
        { path: "*", method: RequestMethod.GET }, // Protect GET routes too, except excluded ones
      );
  }
}
