// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Edge Function  :  refresh-roles   (hook + DB write, still fast)
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";
const supabaseUrl = Deno.env.get("PROJECT_URL");
const serviceRole = Deno.env.get("SERVICE_ROLE_KEY");
const admin = createClient(supabaseUrl, serviceRole, {
  auth: {
    autoRefreshToken: false
  }
});
serve(async (req)=>{
  if (req.method !== "POST") return new Response("Method Not Allowed", {
    status: 405
  });
  const { user_id } = await req.json().catch(()=>({}));
  if (!user_id || !/^[0-9a-fA-F-]{36}$/.test(user_id)) return new Response("user_id missing or invalid", {
    status: 400
  });
  // ── 1. get active roles ───────────────────────────────────────────────
  const { data: roles, error } = await admin.from("user_organization_roles").select("role_id, roles ( role ), organization_id, organizations ( name )").eq("user_id", user_id).eq("is_active", true);
  if (error) return new Response(error.message, {
    status: 500
  });
  // ── 2. persist to auth.users (quick) ──────────────────────────────────
  const { error: updErr } = await admin.auth.admin.updateUserById(user_id, {
    app_metadata: {
      roles,
      role_count: roles.length
    }
  });
  if (updErr) return new Response(updErr.message, {
    status: 500
  });
  // ── 3. hand claims back to GoTrue (merged into JWT) ───────────────────
  return new Response(JSON.stringify({
    app_metadata: {
      roles,
      role_count: roles.length
    }
  }), {
    headers: {
      "Content-Type": "application/json"
    },
    status: 200
  });
}); /* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/ 
