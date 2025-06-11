
### Suggestions for Splitting Down the File


   
1. **Modularize Role and Permission Checks:**
   - Encapsulate permission and role validation in a middleware or a separate authorization service. This can make each function cleaner and free from repetitive role-check code.
   
2. **Use DTOs and Validation Classes:**
   - Utilize Data Transfer Objects (DTOs) and validation pipes to handle incoming data validations, which could further reduce the amount of inline error checking in each method.

3. **Use Enums for Statuses:**
   - Define enums for status values to make the code more readable and maintainable. For example, use `enum PaymentStatus { INVOICE_SENT, PAID, PAYMENT_REJECTED, OVERDUE }`.

4. **Enrich Items**
   
   **Issue**
    - Same 4-line block to “enrich” items appears in 7 different methods.
   
   **Solution**
   - Make it into its own service or private helper function. This will reduce the amount of duplicate code and make the code easier to maintain.

5. **Sending Emails**

    **Issue**
    - We are composing and sending emails a lot in the service.

    **Solution**
    - Move it all to the `MailService` and call it from the `BookingService`.

6. **Start Using RPCs**

    **Issue**
    - Giant transaction-like sequences (`insert order`, then `insert order_items`, then `update stock` …) without rollback

    **Solution**
    - Use **Supabase** rpc (Postgres function) or supabase.transaction() (v2) so the whole thing is atomic and you don’t have to hand-roll compensation logic

7. **Security and Auth**

    **Issue**
    - Our auth check is a simple header which checks whos user id is given, and it can be spoofed easily.

    **Solution**
    - Add a global `JwtAuthGuard` (or Supabase JWT middleware) and inject `@CurrentUser()` user so services never worry about headers.

# Backend Suggestions

1. **Request**
    - Instead of creating a new Supabase Client every time you call a function, use middleware to create a single client instance and reuse it across all functions.
    - Also type the request to get rid of the use of the **any** type.


    
# Suggestions for BookingService

1. **getAllOrders**
    - instead of creating the Supabase Client every time you call a function, use middleware to create a single client instance and reuse it across all functions.
    - userId is a parameter but is never used in the function.
    

## Bugs

- User can approve bookings.
- `x-user-id` can easily be spoofed to grant anyone super admin privileges.
- User can confirm orders.
- Why is there a confirm order and also a confirm for pickup, but the confirm for pickup didnt seem to change the row in the orders table?


# Code Examples for BookingService

## Middleware

```ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { NextFunction, Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
  supabase: SupabaseClient;
  user: User; // Add the user property here
}
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) { }

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    console.log(
      `[${new Date().toISOString()}] Authenticating request to: ${req.method} ${req.path}`,
    );

    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log(
          `[${new Date().toISOString()}] Authentication failed: Missing or invalid token`,
        );
        throw new UnauthorizedException(
          'Missing or invalid authorization token',
        );
      }

      const token = authHeader.split(' ')[1];

      // Initialize Supabase client with service role key for server-side operations
      const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
      const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase URL or Anon key not found in environment variables');
      }
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // Verify the user's JWT token
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.log(
          `[${new Date().toISOString()}] Authentication failed: Invalid or expired token`,
        );
        throw new UnauthorizedException('Invalid or expired token');
      }
      // Keep this for logging purposes
      console.log(
        `[${new Date().toISOString()}] Authentication successful for user ID: ${user.id} Email: ${user.email}`,
      );

      // Attach the user to the request
      req['user'] = user;
      req['supabase'] = supabase;

      next();
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] Authentication error:`,
        error.message,
      );
      throw new UnauthorizedException('Unauthorized: ' + error.message);
    }
  }
}
```

### @CurrentUser and AuthGaurd

```ts

```