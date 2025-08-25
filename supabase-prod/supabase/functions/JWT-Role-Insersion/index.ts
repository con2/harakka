// Follow the Deno LS setup guide ↑ for autocomplete.
// Edge Function: refresh-roles  (runs as custom_access_token hook or stand-alone)
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.3";
// Standard CORS headers used in Supabase Edge Function examples
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
/**
 * Supabase injects these automatically in both local and hosted edge runtimes.
 * Fallback to PROJECT_URL / SERVICE_ROLE_KEY only if the standard names are absent,
 * so the function works in older local setups.
 */ const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("PROJECT_URL") ?? "";
const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SERVICE_ROLE_KEY") ?? "";
if (!supabaseUrl || !serviceRole) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}
// Re-usable helper
function badRequest(msg, status = 400) {
  return new Response(msg, {
    status,
    headers: corsHeaders
  });
}
Deno.serve(async (req)=>{
  // CORS pre-flight for browser calls
  if (req.method === "OPTIONS") return new Response("ok", {
    headers: corsHeaders
  });
  if (req.method !== "POST") return badRequest("Method Not Allowed", 405);
  const { user_id } = await req.json().catch(()=>({}));
  if (!user_id) return badRequest("Missing user_id");
  const admin = createClient(supabaseUrl, serviceRole, {
    auth: {
      autoRefreshToken: false
    }
  });
  /* 1 — Fetch active roles with full details */ const { data: roleRows, error } = await admin.from("view_user_roles_with_details").select("*").eq("user_id", user_id).eq("is_active", true);
  if (error) return badRequest(error.message, 500);
  // roleRows already has every field we need, keep it verbatim
  const claims = roleRows;
  /* 1.1 — Timestamps for sync bookkeeping */ const now = new Date();
  const lastRoleSync = now.toISOString();
  const refreshRequired = (now.getTime() / 1000).toFixed(6); // Unix‑epoch seconds as string
  /* 2 — Persist into app_metadata */ const newMetadata = {
    roles: claims,
    role_count: claims.length,
    last_role_sync: lastRoleSync,
    refresh_required: refreshRequired,
    edge_test: true
  };
  const { error: updErr } = await admin.auth.admin.updateUserById(user_id, {
    app_metadata: newMetadata
  });
  if (updErr) return badRequest(updErr.message, 500);
  /* 3 — Respond with claims (required for custom_access_token hook) */ return new Response(JSON.stringify({
    app_metadata: newMetadata
  }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    },
    status: 200
  });
}); /* curl -i --request POST http://localhost:54321/functions/v1/JWT-Role-Insersion\
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $(cat ~/.supabase/JWT-Role-Insersion)" \
  --data '{"user_id":"150e5593-9ecd-43de-a973-48d282b200ac"}'
 */ 
