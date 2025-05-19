import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Setup: environment variables
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // braucht Service Key für DB-Zugriff
);

serve(async (req) => {
  try {
    const { record } = await req.json(); // enthält NEW record von auth.users
    const email = record.email;
    const id = record.id;

    if (!email) {
      return new Response("No email found", { status: 400 });
    }

    // (Optional) Lade auch Name aus user_profiles, falls schon vorhanden
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name")
      .eq("id", id)
      .single();

    const name = profile?.full_name || email;

    // Sende Mail via z.B. Resend, Mailgun, Mailchimp, etc.
    // Hier als Beispiel: Resend REST API (du kannst deinen eigenen Service nutzen)
    const mailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Illusia Rental <info@illusia.fi>",
        to: email,
        subject: "Welcome to Illusia Rental!",
        html: `<h1>Hello ${name},</h1><p>Thank you for signing up!</p>`,
      }),
    });

    if (!mailResponse.ok) {
      const errorText = await mailResponse.text();
      console.error("Failed to send email:", errorText);
      return new Response("Failed to send email", { status: 500 });
    }

    return new Response("Email sent", { status: 200 });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response("Internal error", { status: 500 });
  }
});
