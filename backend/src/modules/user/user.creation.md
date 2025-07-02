# how to trigger the backend from spabase

Supabase Edge Function / Webhook

    Richte in Supabase eine Edge Function ein, die on-auth-event (user.created) als Trigger nutzt.

    In dieser Function schreibst du dann echten JavaScript/TypeScript-Code, der via fetch() einen Aufruf an dein NestJS-Endpoint /users macht und dort die Profil-Anlage übernimmt.

    Vorteil: sauber entkoppelt, offiziell unterstützt, und du kannst HTTP nutzen.

## add bypass to middleware:

```ts
// Allow bypass if valid API key is present
const apiKey = req.headers["x-api-key"];
if (apiKey === this.config.get("BACKEND_SECRET")) {
  this.logger.log("Bypassing auth middleware via API key");
  return next();
}
```

## Trigger-Definition in supabase/functions/handleNewUser/index.ts

**new edge function: handleNewUser.ts**

```ts
import { serve } from "https://deno.land/std@0.181.0/http/server.ts";

serve(async (req) => {
  const payload = await req.json();
  const user = payload.record;

  const res = await fetch(`${Deno.env.get("API_URL")}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": Deno.env.get("BACKEND_SECRET")!,
    },
    body: JSON.stringify({
      id: user.id,
      email: user.email,
    }),
  });

  if (!res.ok) {
    console.error("Failed to call backend:", await res.text());
    return new Response("Error calling backend", { status: 500 });
  }

  return new Response("ok");
});
```

## In supabase/config.toml aktivieren

```toml
[functions]
edge_functions = ["handleNewUser"]

```

## RLS policy für auth.users

```sql
CREATE POLICY "New user events"
  ON auth.users
  FOR SELECT
  TO authenticated;

```

## Deployment

```bash
supabase functions deploy handleNewUser
```

## Event-Hook setzen

    In der Supabase-Konsole unter Authentication → Event Triggers:

        Event: user.created

        Function: handleNewUser

So erreichst du, dass bei jedem neuen Auth-User deine Edge Function feuert und über HTTP deine NestJS-API zur Anlage des Profils aufruft – genau so, wie du es mit deinem userService.createUser(...) implementiert hast.

# Summary

Briefly summarized

    Direct HTTP call in PL/pgSQL: does not work.

    Edge function (webhook): official Supabase method, JavaScript/TypeScript, fetch() → your controller.

    Realtime Subscription: listen for changes in the backend and react programmatically.

I recommend the Edge Function + Event Trigger - this is the cleanest way to automatically trigger your Nest service without having to rewrite the logic in the database itself.
