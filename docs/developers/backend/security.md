# Security Guide

This document outlines the security architecture and implementation in the Storage and Booking Application.

## Table of Contents

- [Authentication](#authentication)
- [Authorization](#authorization)
- [Database Security](#database-security)
- [API Security](#api-security)
- [File Storage Security](#file-storage-security)
- [Session Management](#session-management)
- [Environment Variables](#environment-variables)
- [Secure Code Practices](#secure-code-practices)
- [Security Headers](#security-headers)
- [Audit Logging](#audit-logging)

## Authentication

The application uses Supabase Auth for authentication, providing robust user identity verification.

### Authentication Flow

1. **Registration**: Users register through Supabase Auth
2. **Login**: JWT token-based authentication
3. **Token Management**: Secure handling of access and refresh tokens

### Implementation

```typescript
// Backend authentication guard
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Invalid authentication credentials");
    }

    const token = authHeader.split(" ")[1];

    // Validate JWT token with Supabase
    const { data, error } = await this.supabaseService
      .getServiceClient()
      .auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    // Attach user to request for further use
    request.user = data.user;
    return true;
  }
}
```

### Frontend Authentication

```typescript
// Hook for authentication state
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, authLoading };
}
```

## Authorization

The application implements a comprehensive role-based access control system with three primary user roles:

- **User**: Standard access for booking and managing personal orders
- **Admin**: Extended privileges for managing inventory and user accounts
- **SuperVera**: System-wide administrative access with complete control

### Role Definitions

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role VARCHAR NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superVera')),
  -- other fields
);
```

### Role Check Functions

Our database implements three specific role check functions, exactly matching the ones in our project:

```sql
-- Check if the current user is superVera
CREATE OR REPLACE FUNCTION is_super_vera()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'superVera'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if the current user is admin (but not superVera)
CREATE OR REPLACE FUNCTION is_admin_only()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has elevated privileges (admin or superVera)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'superVera')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Backend Authorization

```typescript
// Role-based guard
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = request;

    // Get user profile with role
    const { data: profile, error } = await this.supabaseService
      .getServiceClient()
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      throw new ForbiddenException('User profile not found');
    }

    return requiredRoles.includes(profile.role);
  }
}

// Using the guard
@Get('admin/users')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'superVera')
getAllUsers() {
  // Only admins and superVera can access
}
```

### Frontend Authorization

```typescript
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, authLoading } = useAuth();
  const selectedUser = useAppSelector(selectSelectedUser);

  if (authLoading || !selectedUser) {
    return <LoadingSpinner />;
  }

  if (!allowedRoles.includes(selectedUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Usage
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={["tenant_admin", "superVera"]}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>;
```

## Database Security

The application implements comprehensive database security using Supabase's PostgreSQL features, with RLS policies enabled on all tables.

### Row-Level Security (RLS)

Our application enables RLS on all tables:

```sql
-- Enable RLS on all tables
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Policy Categories

Our RLS policies fall into four main categories:

1. **Public Data Policies**: Allow anonymous users to view non-sensitive data

```sql
-- Public can view active locations
CREATE POLICY "Public read access for storage locations"
ON storage_locations FOR SELECT
USING (is_active = TRUE);

-- Public can view tags
CREATE POLICY "Public read access for tags"
ON tags FOR SELECT
USING (TRUE);
```

2. **User-Specific Policies**: Restrict users to accessing only their own data

```sql
-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (
  user_id = auth.uid() OR
  user_id IN (
    SELECT user_profiles.id
    FROM user_profiles
    WHERE user_profiles.id = auth.uid()
  )
);

-- Users can view their own addresses
CREATE POLICY "Users can view their own addresses"
ON user_addresses FOR SELECT
USING (user_id = auth.uid());
```

3. **Admin-Only Policies**: Special permissions for the admin role

```sql
-- Admins can modify regular user profiles but not other admins
CREATE POLICY "Admins can modify regular user profiles"
ON user_profiles FOR UPDATE
USING (
  is_admin_only() AND
  role = 'user'
);
```

4. **SuperVera Policies**: Complete control for system administrators

```sql
-- SuperVera has full access to user_profiles including other admins
CREATE POLICY "SuperVera has full access to user_profiles"
ON user_profiles FOR ALL
USING (is_super_vera());
```

### Query Security

All database queries are parameterized to prevent SQL injection:

```typescript
// Safe query with parameterization
const { data, error } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", userId);
```

## API Security

### Input Validation

All API endpoints use validation pipes to ensure input data integrity:

```typescript
@Post('storage-items')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'superVera')
async createItem(@Body() createItemDto: CreateItemDto) {
  return this.itemsService.createItem(createItemDto);
}

// DTO with validation
export class CreateItemDto {
  @IsUUID()
  location_id: string;

  @IsNumber()
  @Min(0)
  items_number_total: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsObject()
  translations: {
    en: { item_name: string; item_description: string };
    fi: { item_name: string; item_description: string };
  };
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

### CORS Configuration

Proper CORS settings to restrict API access:

```typescript
// NestJS main.ts setup
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get CORS settings from environment
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  // Set up CORS
  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });

  await app.listen(3000);
}
```

## File Storage Security

The application secures file access through temporary signed URLs and strict access controls.

### Secure File Access

```typescript
// Generate time-limited signed URL for file access
async getSignedInvoiceUrl(orderId: string, user: { id: string; role: string }): Promise<string> {
  const supabase = this.supabaseService.getServiceClient();

  // Check if user is authorized to access this invoice
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, user_id")
    .eq("id", orderId)
    .single();

  if (!order || error) {
    throw new BadRequestException("Order not found");
  }

  // Only owner or admin can see the PDF
  const isOwner = order.user_id === user.id;
  const isAdmin = user.role === "tenant_admin" || user.role === "superVera";

  if (!isOwner && !isAdmin) {
    throw new BadRequestException("You are not authorized to access this invoice");
  }

  const filePath = `invoices/INV-${orderId}.pdf`;

  // Create a signed URL valid for only 5 minutes
  const { data, error: urlError } = await supabase.storage
    .from("invoices")
    .createSignedUrl(filePath, 60 * 5);

  if (!data?.signedUrl || urlError) {
    throw new BadRequestException("Failed to generate signed URL");
  }

  return data.signedUrl;
}
```

### Secure File Upload

```typescript
@Post('storage-items/:id/images')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'superVera')
@UseInterceptors(
  FileInterceptor('image', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
        return callback(new BadRequestException('Only image files are allowed'), false);
      }
      callback(null, true);
    },
  }),
)
async uploadItemImage(
  @Param('id') itemId: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() uploadDto: UploadItemImageDto,
) {
  return this.storageItemsService.uploadItemImage(itemId, file, uploadDto);
}
```

## Session Management

### Token Handling

Secure token storage on the frontend:

```typescript
// Using memory for temporary token cache
let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (cachedToken) return cachedToken;

  // Get from session storage
  const { data } = await supabase.auth.getSession();
  cachedToken = data.session?.access_token || null;
  return cachedToken;
}

// Token refresh logic
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED") {
    cachedToken = session?.access_token || null;
  } else if (event === "SIGNED_OUT") {
    cachedToken = null;
  }
});
```

## Environment Variables

The application uses secure environment variable management:

```bash
# Supabase Configuration
SUPABASE_PROJECT_ID= # Your Supabase project ID
SUPABASE_ANON_KEY= # Your Supabase anon key
SUPABASE_SERVICE_ROLE_KEY= # Your Supabase service role key
SUPABASE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co

# Backend Configuration
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5180

# Frontend Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_API_URL=http://localhost:3000

# S3 Configuration
SUPABASE_STORAGE_URL=https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/s3
S3_REGION= # Your S3 region
S3_BUCKET=item-images

# Email Configuration
EMAIL_FROM= # Your email address
GMAIL_CLIENT_ID= # Your Gmail client ID
GMAIL_CLIENT_SECRET= # Your Gmail client secret
GMAIL_REFRESH_TOKEN= # Your Gmail refresh token
```

## Secure Code Practices

### Error Handling Security

The application implements secure error handling to prevent information leakage:

```typescript
// Backend error filter
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Get appropriate status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Sanitize error messages for production
    const message =
      process.env.NODE_ENV === "production" &&
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? "Internal server error"
        : exception.message;

    // Log full error details server-side
    console.error(exception);

    // Return sanitized error to client
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Security Headers

The application implements security headers for enhanced protection:

```typescript
// NestJS main.ts
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
          styleSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
          imgSrc: ["'self'", "data:", "*.supabase.co", "trusted-cdn.com"],
          connectSrc: [
            "'self'",
            process.env.SUPABASE_URL,
            "api.yourdomain.com",
          ],
          fontSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Other app setup...
  await app.listen(3000);
}
```

## Audit Logging

The application implements comprehensive audit logging for security monitoring:

### Database-Level Audit

```sql
-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user
  current_user_id := public.get_request_user_id();

  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'update', current_user_id, to_jsonb(OLD.*), to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, new_values
    ) VALUES (
      TG_TABLE_NAME::text, NEW.id, 'insert', current_user_id, to_jsonb(NEW.*)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name, record_id, action, user_id, old_values
    ) VALUES (
      TG_TABLE_NAME::text, OLD.id, 'delete', current_user_id, to_jsonb(OLD.*)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Applied to critical tables
CREATE TRIGGER audit_orders_trigger
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_order_items_trigger
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_storage_items_trigger
AFTER INSERT OR UPDATE OR DELETE ON storage_items
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### API-Level Audit Logging

```typescript
// Logging service
@Injectable()
export class LogsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async logAction(
    level: "info" | "warning" | "error",
    message: string,
    source: string,
    metadata?: any,
    userId?: string,
  ): Promise<void> {
    const supabase = this.supabaseService.getServiceClient();

    await supabase.from("system_logs").insert({
      level,
      message,
      source,
      metadata,
      user_id: userId,
    });
  }
}

// Usage in services
@Injectable()
export class OrdersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly logsService: LogsService,
  ) {}

  async updateOrderStatus(
    orderId: string,
    status: string,
    userId: string,
  ): Promise<Order> {
    // Update logic...

    // Log the action
    await this.logsService.logAction(
      "info",
      `Order ${orderId} status changed to ${status}`,
      "OrdersService",
      { orderId, newStatus: status },
      userId,
    );

    return updatedOrder;
  }
}
```

By implementing these security measures, the application provides a robust security architecture that protects user data and system integrity at multiple levels.
