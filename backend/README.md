# Setup for the backend:

```shell
project-root/
├── backend/   # NestJS application
└── frontend/  # React application
```

```shell
npm install -g @nestjs/cli
```

```shell
nest new backend
```

remove additional files and folders

and then add supabase:

```shell
npm install @supabase/supabase-js
```

Add environment support

```shell
npm install @nestjs/config
```

create an .env file and configure the env file: add the supabase url and key

```env
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```
