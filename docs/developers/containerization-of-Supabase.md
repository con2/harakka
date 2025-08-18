# Containerization Of Supabase Instance

## Getting started

Run these commands

```sh
# Get the code
git clone --depth 1 https://github.com/supabase/supabase

# Make your new supabase project directory
mkdir supabase-project

# Tree should look like this
# .
# ├── supabase
# └── supabase-project

# Copy the compose files over to your project
cp -rf supabase/docker/* supabase-project

# Copy the fake env vars
cp supabase/docker/.env.example supabase-project/.env

# Switch to your project directory
cd supabase-project

# Pull the latest images
docker compose pull

# Start the services (in detached mode)
docker compose up -d
```

## Change the env varibables

Change any of the variables from their placeholders to real urls for the app and so on.

## Dump DB

If not linked to supabase yet run this

```shell
# Link with the current project you are using
npx supabase link
```

1. Run one of the following commands to dump the DB with or without data

```shell
cd supabase_CLI

# schema-only (safer)
npx supabase db dump -f scheme.sql

# or data
npx supabase db dump --data-only -f data.sql
```

NOTE:
if the previous commands do not work, try this instead

```shell
cd supabase-project
# schema
supabase db dump \
  --db-url "postgresql://postgres:<DB_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require" \
  -f scheme.sql

# or data only
supabase db dump \
  --db-url "postgresql://postgres:<DB_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require" \
  --data-only -f data.sql
```

2. Restore into self-hosted DB with docker

```shell
cd supabase-project
# restore schema first
docker compose exec -T db psql -U postgres -d postgres < schema.sql
# then restore data
docker compose exec -T db psql -U postgres -d postgres < data.sql
```

3. Run the images again

```shell
cd supabase-project
docker compose restart
```
