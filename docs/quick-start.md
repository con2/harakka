# Quick Start

## Prerequisites

Before starting, ensure you have the following installed and set up:

- Node.js (v18 or higher) and npm
- Supabase account and project
- Git

## Database Setup

Ensure your database schema is set up before inserting data.
If you start without database seed data (all db tables are empty), you should insert several rows manually in Supabase UI or via Supabase CLI.

### Insert essential data into the database

#### Insert roles list into the `public.roles` table:

```sql
-- Insert roles into the public.roles table
INSERT INTO public.roles (id, role) VALUES
('1663d9f0-7b1e-417d-9349-4f2e19b6d1e8', 'user'),
('35feea56-b0a6-4011-b09f-85cb6f6727f3', 'storage_manager'),
('700b7f8d-be79-474e-b554-6886a3605277', 'tenant_admin'),
('86234569-43e9-4a18-83cf-f8584d84a752', 'super_admin'),
('98ac5906-8cf7-4c2d-b587-be350930f518', 'requester');
```

#### Insert 2 generic organizations into the `public.organizations` table:

```sql
-- Insert organizations into the public.organizations table
INSERT INTO public.organizations (id, name, slug, description, is_active, is_deleted) VALUES
('0360be4f-2ea1-4b89-960d-cff888fb7475', 'High council', 'high-council', 'Almighty admins rule from here (like super_admins)', TRUE, FALSE),
('2a42d333-a550-493f-876e-a2cea3c80d26', 'Global', 'global', 'This organization is a default organization for all users that sign up on the app. All users in this organization will have a role "user" at sign up', TRUE, FALSE);
```

## Run the application locally

### Clone the repository

```sh
git clone https://github.com/con2/harakka.git
cd <root folder>
```

### Set up environment variables

Run this script from root folder to create `.env.local` file from the template:

```sh
./scripts/setup.sh
```

After running the script, open the `.env.local` file and fill in the required values.
For more details refer [Setup Script Guide](./developers/workflows/scripts/setup.md)

### Install dependencies

```sh
npm run install-all
```

### Run the application

```sh
npm run dev
```

### Access the application

- Frontend: <http://localhost:5180>
- Backend: <http://localhost:3000>
- Backend health endpoint: <http://localhost:3000/health>

## Setup initial super_admin user

To manage your admins team, you need a super_admin user role. You can create the initial super_admin role manually in Supabase UI or via Supabase CLI.

### Assign a super_admin user

By default, any new user on the first "SIGNED_IN" event is assigned to the "user" role in the "Global" organization. To get super_admin rights, follow these steps:

1. Sign up a new user via the frontend.
2. Sign in to the Harakka application.
3. Open the Supabase dashboard and navigate to the "auth.users" table.
4. Find the newly created user and copy their "id".
5. Navigate to the "public.user_organization_roles" table.
6. Insert a new row with the following details:

   - user_id: `<the copied user id>`
   - organization_id: `2a42d333-a550-493f-876e-a2cea3c80d26` ("Global" org id)
   - role_id: `86234569-43e9-4a18-83cf-f8584d84a752` (super_admin role id)

   ```sql
   -- Insert a super_admin role for the new user in the High council organization
   INSERT INTO public.user_organization_roles (user_id, organization_id, role_id, is_active) VALUES
    ('<the copied user id>', '0360be4f-2ea1-4b89-960d-cff888fb7475', '86234569-43e9-4a18-83cf-f8584d84a752', TRUE);
   ```

7. Verify the user has super_admin rights by signing in to the Harakka application and accessing the user menu:
   user menu > Change organization > SuperAdmin
   ![user menu with Super Admin option](image-1.png)

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs) - Learn more about managing your database and authentication.
- [Harakka GitHub Repository](https://github.com/con2/harakka) - Explore the source code and contribute to the project.
