# Security Guide

This document outlines the current security architecture and implementation in the Storage and Booking Application.

## Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [Middleware & Guards](#middleware--guards)
- [Role-Based Access Control](#role-based-access-control)
- [API Security](#api-security)
- [File Storage Security](#file-storage-security)
- [Input Validation](#input-validation)
- [CORS Configuration](#cors-configuration)
- [Session Management](#session-management)
- [Database Security](#database-security)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Security Headers](#security-headers)
- [Audit Logging](#audit-logging)

## Authentication

The application uses **Supabase Auth** with **custom JWT middleware** for authentication, replacing the previous guard-based approach.

### Current Authentication Flow

1. **Registration/Login**: Through Supabase Auth
2. **JWT Token**: Custom JWT service generates tokens
3. **Middleware**: Auth.middleware.ts validates requests
4. **Multi-tenant**: Organization-based user roles

### Authentication Middleware

**Location:** [`src/middleware/Auth.middleware.ts`](backend/src/middleware/Auth.middleware.ts)

```typescript
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedException("No valid authorization header");
      }

      const token = authHeader.split(" ")[1];

      // Validate JWT token
      const decoded = await this.jwtService.verifyToken(token);

      // Get user data from Supabase
      const supabase = this.supabaseService.createClient(token);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new UnauthorizedException("Invalid token");
      }

      // Attach user and supabase client to request
      req.user = user;
      req.supabase = supabase;

      next();
    } catch (error) {
      throw new UnauthorizedException("Authentication failed");
    }
  }
}
```

### Frontend Authentication

For detailed frontend authentication implementation, see [Frontend API Integration](../frontend/api-integration.md). The frontend uses Supabase Auth hooks to manage authentication state and automatically includes JWT tokens in API requests.

```typescript
// Basic frontend auth flow (simplified)
const { user, authLoading } = useAuth();

// API requests automatically include auth headers
const response = await apiClient.get("/items", {
  headers: { Authorization: `Bearer ${token}` },
});
```

## Authorization

### Role Definitions

The application now uses a **5-tier role hierarchy** with **multi-tenant organization support**:

#### Role Hierarchy (Lowest to Highest Priority)

| Role                | Priority | Description         |
| ------------------- | -------- | ------------------- |
| **user**            | 1        | Basic user access   |
| **requester**       | 2        | Can create bookings |
| **storage_manager** | 3        | Manage inventory    |
| **tenant_admin**    | 4        | Organization admin  |
| **super_admin**     | 5        | System-wide access  |

#### Database Schema

```sql
-- Multi-tenant role system
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Only one active role per user per organization
  CONSTRAINT unique_active_role_per_user_org
  UNIQUE (user_id, organization_id) WHERE is_active = true
);
```

## Middleware & Guards

### **Authentication Middleware** (Replaces AuthGuard)

**Applied globally** to all routes except public endpoints:

```typescript
// In AppModule
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        // Public endpoints
        { path: "auth/login", method: RequestMethod.POST },
        { path: "auth/register", method: RequestMethod.POST },
        { path: "/", method: RequestMethod.GET }, // Health check
      )
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
```

### **Roles Guard**

**Location:** [`src/guards/roles.guard.ts`](backend/src/guards/roles.guard.ts)

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No role requirement
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Get user's roles for current organization
    const userRoles = await this.getUserRoles(user.id, request.organizationId);

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
```

### **ReCaptcha Guard**

**Location:** [`src/guards/recaptcha.guard.ts`](backend/src/guards/recaptcha.guard.ts)

```typescript
@Injectable()
export class RecaptchaGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const recaptchaToken = request.body?.recaptchaToken;

    if (!recaptchaToken) {
      throw new BadRequestException("ReCaptcha token required");
    }

    // Verify with Google ReCaptcha API
    const isValid = await this.verifyRecaptcha(recaptchaToken);

    if (!isValid) {
      throw new UnauthorizedException("Invalid ReCaptcha");
    }

    return true;
  }
}
```

## Role-Based Access Control

### **Roles Decorator**

**Location:** [`src/decorators/roles.decorator.ts`](backend/src/decorators/roles.decorator.ts)

```typescript
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

### **Usage in Controllers**

```typescript
// Example from storage-items.controller.ts
@Controller("items")
export class StorageItemsController {
  // Public access - no authentication required
  @Get()
  async getAllItems() {
    // Anyone can view items
  }

  // Authenticated users only - no specific role required
  @Post()
  @UseGuards(RolesGuard)
  async createBookingRequest() {
    // Any authenticated user can create booking requests
  }

  // Storage managers and above
  @Post("create")
  @UseGuards(RolesGuard)
  @Roles("storage_manager", "tenant_admin", "super_admin")
  async createItem() {
    // Only storage managers and above can create items
  }

  // Tenant admins and above
  @Delete(":id")
  @UseGuards(RolesGuard)
  @Roles("tenant_admin", "super_admin")
  async deleteItem() {
    // Only tenant admins and above can delete items
  }

  // Super admin only
  @Get("admin/all-organizations")
  @UseGuards(RolesGuard)
  @Roles("super_admin")
  async getAllOrganizationItems() {
    // Only super admin can see items across all organizations
  }
}
```

### **Common Role Patterns**

```typescript
// User management - tenant admin within organization
@Roles('tenant_admin')
async manageOrganizationUsers() {}

// Inventory management - storage manager and above
@Roles('storage_manager', 'tenant_admin', 'super_admin')
async manageInventory() {}

// System administration - super admin only
@Roles('super_admin')
async systemAdministration() {}

// Booking management - requester and above
@Roles('requester', 'storage_manager', 'tenant_admin', 'super_admin')
async manageBookings() {}
```

## API Security

### **Input Validation with DTOs**

All endpoints use validation DTOs to ensure data integrity:

```typescript
// Example from booking/dto/create-booking.dto.ts
export class CreateBookingDto {
  @IsDateString()
  @IsNotEmpty()
  start_date: string;

  @IsDateString()
  @IsNotEmpty()
  end_date: string;

  @IsEnum(["pickup", "delivery"])
  pickup_method: "pickup" | "delivery";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingItemDto)
  booking_items: CreateBookingItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
```

### Rate Limiting

API endpoints implement rate limiting to prevent abuse:

```typescript
// NestJS throttler configuration
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 10, // Max number of requests in time window
    }),
  ],
})
export class AppModule {}

// Apply throttling to controllers
@Controller("auth")
@UseGuards(ThrottlerGuard)
export class AuthController {
  // Even more restrictive for login attempts
  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60 } })
  async login(@Body() loginDto: LoginDto) {
    // Login logic
  }
}
```

## File Storage Security

### **Image Upload Security**

**Location:** [`src/modules/item-images/`](backend/src/modules/item-images/)

```typescript
@Controller("item-images")
export class ItemImagesController {
  @Post("upload")
  @UseGuards(RolesGuard)
  @Roles("storage_manager", "tenant_admin", "super_admin")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, callback) => {
        // Only allow specific image types
        if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
          return callback(
            new BadRequestException("Only JPG, PNG, WebP images allowed"),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
  ) {
    // Additional server-side validation
    const validation = await this.validateImage(file);
    if (!validation.isValid) {
      throw new BadRequestException(validation.error);
    }

    return this.itemImagesService.uploadImage(file, uploadDto);
  }
}
```

## Input Validation

### **Sanitization Utility**

**Location:** [`src/utils/sanitize.util.ts`](backend/src/utils/sanitize.util.ts)

```typescript
export function sanitizeString(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/[<>]/g, "") // Remove HTML brackets
    .trim();
}

export function sanitizeObject(obj: any): any {
  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}
```

### **Image Validation Utility**

**Location:** [`src/utils/validateImage.util.ts`](backend/src/utils/validateImage.util.ts)

```typescript
export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  fileSize?: number;
  dimensions?: { width: number; height: number };
}

export async function validateImage(
  file: Express.Multer.File,
): Promise<ImageValidationResult> {
  try {
    // File size check
    if (file.size > 5 * 1024 * 1024) {
      return { isValid: false, error: "File size exceeds 5MB limit" };
    }

    // MIME type check
    if (!file.mimetype.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      return { isValid: false, error: "Invalid file format" };
    }

    // Additional checks (dimensions, etc.)
    // ... validation logic

    return { isValid: true, fileSize: file.size };
  } catch (error) {
    return { isValid: false, error: "File validation failed" };
  }
}
```

## CORS Configuration

The application implements secure CORS settings to restrict API access to authorized origins:

```typescript
// NestJS main.ts setup
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get CORS settings from environment
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  // Set up CORS with secure defaults
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Block unauthorized origins
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
    credentials: true, // Allow cookies/auth headers
    maxAge: 86400, // Cache preflight for 24 hours
  });

  await app.listen(process.env.PORT || 3000);
}
```

## Session Management

### Token Handling

The application implements secure JWT token management with automatic refresh:

```typescript
// JWT Service - Location: src/modules/jwt/jwt.service.ts
@Injectable()
export class JwtService {
  async generateToken(payload: JwtPayload): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || "15m",
      secret: process.env.JWT_SECRET,
    });

    const refreshToken = this.jwtService.sign(
      { sub: payload.sub, type: "refresh" },
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
        secret: process.env.JWT_REFRESH_SECRET,
      },
    );

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      // Generate new token pair
      return this.generateToken({
        sub: payload.sub,
        email: payload.email,
        // ... other claims
      });
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}
```

### Secure Token Storage (Frontend Integration)

For detailed frontend token management, see [Frontend API Integration](../frontend/api-integration.md). The frontend securely stores tokens and handles automatic refresh:

```typescript
// Basic secure token handling (simplified)
export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Store tokens securely (httpOnly cookies preferred)
  storeTokens(tokens: TokenPair) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;

    // Store refresh token in httpOnly cookie
    document.cookie = `refreshToken=${tokens.refreshToken}; HttpOnly; Secure; SameSite=Strict`;
  }

  // Automatic token refresh
  async getValidToken(): Promise<string> {
    if (this.isTokenExpired(this.accessToken)) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }
}
```

## Database Security

The application implements comprehensive database security using Supabase's PostgreSQL features with Row-Level Security (RLS) policies enabled on all tables.

For detailed information about database security policies and RLS implementation, see [Database RLS Policies](../database/RLS-policies.md).

Key security features:

- **Row-Level Security (RLS)** enabled on all tables
- **Multi-tenant data isolation** through organization-based policies
- **Role-based data access** with hierarchical permissions
- **Audit logging** for all data modifications
- **Parameterized queries** to prevent SQL injection

## Error Handling

### **Security-Focused Error Responses**

```typescript
// Global exception filter - Location: src/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Sanitize error message for production
    const message = this.getErrorMessage(exception, status);

    // Log error for debugging (server-side only)
    this.logError(exception, request);

    // Send sanitized response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private getErrorMessage(exception: unknown, status: number): string {
    if (process.env.NODE_ENV === "production" && status === 500) {
      return "Internal server error"; // Don't leak error details
    }

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === "string"
        ? response
        : (response as any).message;
    }

    return "Unknown error occurred";
  }

  private logError(exception: unknown, request: Request): void {
    // Log full error details server-side for debugging
    console.error("Exception occurred:", {
      url: request.url,
      method: request.method,
      error: exception,
      user: (request as any).user?.id,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Environment Variables

### **Required Security Environment Variables**

```bash
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-256-bits-minimum
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=different-secure-refresh-secret-256-bits
JWT_REFRESH_EXPIRATION=7d

# Supabase Configuration
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_URL=https://your-project.supabase.co

# API Security
ALLOWED_ORIGINS=http://localhost:5180,https://yourdomain.com
CORS_CREDENTIALS=true

# ReCaptcha (Bot Protection)
RECAPTCHA_SECRET_KEY=your-recaptcha-secret
RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# File Upload Security
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp

# Production Security
NODE_ENV=production
HTTPS_ONLY=true
SECURE_COOKIES=true
```

## Security Headers

### **Helmet Configuration**

```typescript
// In main.ts
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "*.supabase.co"],
          connectSrc: ["'self'", process.env.SUPABASE_URL],
          fontSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disable for Supabase compatibility
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
```

## Audit Logging

### **Logging Service**

**Location:** [`src/modules/logs_module/logs.service.ts`](backend/src/modules/logs_module/logs.service.ts)

```typescript
@Injectable()
export class LogsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async logSecurityEvent(
    event:
      | "login"
      | "logout"
      | "failed_auth"
      | "role_change"
      | "permission_denied",
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    await supabase.from("audit_logs").insert({
      event_type: "security",
      event_action: event,
      user_id: userId,
      metadata: {
        timestamp: new Date().toISOString(),
        ip_address: metadata?.ip,
        user_agent: metadata?.userAgent,
        ...metadata,
      },
    });
  }

  async logDataAccess(
    resource: string,
    action: "create" | "read" | "update" | "delete",
    userId: string,
    resourceId?: string,
  ): Promise<void> {
    // Log data access for compliance
    const supabase = this.supabaseService.getServiceClient();

    await supabase.from("audit_logs").insert({
      event_type: "data_access",
      event_action: `${action}_${resource}`,
      user_id: userId,
      resource_id: resourceId,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

### Database-Level Audit

Database-level audit triggers automatically log all changes to critical tables. For implementation details, see the existing audit trigger functions in the database schema.

## Security Best Practices Summary

### **Current Security Measures**

1. **Authentication**: Custom JWT middleware with Supabase Auth
2. **Authorization**: Multi-tier role-based access control
3. **Input Validation**: DTOs with class-validator
4. **File Security**: Type validation, size limits, sanitization
5. **Error Handling**: Sanitized error responses in production
6. **Audit Logging**: Comprehensive security event logging
7. **Headers**: Helmet.js security headers
8. **CORS**: Configurable origin restrictions

### **Security Notes**

- **RLS Policies**: Handled in Supabase - see [Database RLS Policies](../database/RLS-policies.md)
- **Rate Limiting**: Configured per endpoint as needed
- **Session Management**: JWT-based with configurable expiration
- **Bot Protection**: ReCaptcha guard for sensitive endpoints
- **Environment Separation**: Different security levels for dev/prod

### **Critical Security Points**

1. **Never expose service role keys** in frontend code
2. **Always validate file uploads** server-side
3. **Use parameterized queries** to prevent SQL injection
4. **Log security events** for compliance and monitoring
5. **Keep JWT secrets secure** and rotate regularly
6. **Validate role hierarchy** in multi-tenant contexts

### Additional Note

While certain validations and checks are also implemented on the frontend for improved user experience (e.g. preventing invalid actions before they reach the server), **the core security backbone is the backend and Supabase RLS policies**. This ensures that even if frontend checks are bypassed, data integrity and access control remain enforced at the server and database level.

---

This security guide reflects the current implementation as of October 2025. For RLS policies and database-level security, refer to the [Database RLS Policies](../database/RLS-policies.md) documentation maintained separately.
