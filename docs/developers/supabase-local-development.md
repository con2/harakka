# Supabase Local Development Guide

## Table of contents

1. [Sources](#sources)
1. [Prerequisites](#prerequisites)
1. [Guide](#guide)
1. [Generate Local Types](#generate-local-types)
1. [Making Local Changes](#making-local-changes)

## Sources

[Official Documentation](https://supabase.com/docs/reference/cli/start)  
[Local Branching YT video](https://www.youtube.com/watch?v=N0Wb85m3YMI)

## Prerequisites

Make sure you have the following things:

1. **Installed supabase CLI** - `npm i supabase --save-dev`
2. **The supabase DB password.** Ask a fellow developer

## Guide

1. **Login with supabase**  
   Run the following command, and follow the terminal instructions
   `npx supabase login`

2. **Link the DB with supabase**  
   Then choose the correct project DB
   `npx supabase link`

3. **Start the containers**  
   `npx supabase start`
4. **Pull schema from DB**  
   Wait for schema to be pulled from DB. May take a couple of minutes.
   `npx supabase db pull`

5. **Pull seed data from DB**  
   This pulls all the current data from the DB
   `npx supabase db dump --data-only -f supabase/seed.sql`

6. **Reset DB**
   `npx supabase reset`

## Generate Local Types
`npx supabase gen types typescript --local > common/supabase.types.ts`

## Making Local Changes
Local changes are done using "migration" files.

[Documentation](https://supabase.com/docs/guides/deployment/database-migrations)

**1. Create a migration file**  
`supabase migration new <file-name>`

**2. Add SQL to migration file**

**3. Apply locally**  
`supabase migration up`

### Applying Local Changes