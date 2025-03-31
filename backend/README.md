# Setup for the backend:

I used the folder that was already there.

```shell
project-root/
├── backend/   # NestJS application
└── frontend/  # React application
```

I installed nest,js and created a new backend.

```shell
npm install -g @nestjs/cli
```

```shell
nest new backend
```

I needed to remove additional files and folders

and then add supabase:

```shell
npm install @supabase/supabase-js
```

Add environment support

```shell
npm install @nestjs/config
```

create an .env file and configure the env file: add port, the supabase url and key

```env
PORT=3000
SUPABASE_URL=https://your-supabase-instance.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

after installing all dependencies you can run the server with:

```sh
npm run start
```

and go to the url in your browser:

**localhost:3000**

to see all the data from storage_items go to:

http://localhost:3000/storage-items/
