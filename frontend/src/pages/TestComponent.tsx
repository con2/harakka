import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/config/supabase";

const TestComponent = () => {
  const { session } = useAuth();
  console.log("Current session:", session);

  // ── Helpers to test token rotation ──────────────────────────
  const handleRefreshSession = async () => {
    console.log("🔄 Calling refreshSession(): current session →", session);
    const { data, error } = await supabase.auth.refreshSession();
    if (data.session != session) {
      console.warn("Session has changed after refreshSession call!");
    }
    if (error) {
      console.error("❌ refreshSession error:", error);
    } else {
      console.log("✅ New session returned:", data.session);
    }
  };

  const handleSetSession = async () => {
    if (!session) {
      console.warn("No session available to set.");
      return;
    }
    console.log("🔄 Calling setSession() with current tokens →", {
      access: session.access_token,
      refresh: session.refresh_token,
    });
    const { data, error } = await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
    if (error) {
      console.error("❌ setSession error:", error);
    } else {
      console.log("✅ setSession returned:", data.session);
    }
  };

  const handleTestEdgeFunction = async () => {
    if (!session?.user?.id) {
      console.warn("No user session available for edge function test.");
      return;
    }

    console.log(
      "🧪 Testing JWT-Role-Insersion edge function with user:",
      session.user.id,
    );

    // Log current JWT roles for comparison
    console.log(
      "Current JWT app_metadata roles:",
      session.user.app_metadata?.roles,
    );

    try {
      const { data, error } = await supabase.functions.invoke(
        "JWT-Role-Insersion",
        {
          body: { user_id: session.user.id },
        },
      );

      if (error) {
        console.error("❌ Edge function error:", error);
      } else {
        console.log("✅ Edge function success:", data);

        // Refresh the session to see if roles were updated
        console.log("🔄 Refreshing session to check for updated roles...");
        const { data: refreshData, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError) {
          console.error("❌ Session refresh error:", refreshError);
        } else {
          console.log(
            "✅ Session refreshed. New app_metadata roles:",
            refreshData.session?.user?.app_metadata?.roles,
          );
        }
      }
    } catch (err) {
      console.error("❌ Edge function exception:", err);
    }
  };

  return (
    <div>
      <h1>Test Component</h1>
      <p>This is a test component to verify routing and functionality.</p>
      <div style={{ marginTop: 24 }}>
        <button onClick={handleRefreshSession}>
          Refresh Session (refreshSession)
        </button>
        <button onClick={handleSetSession} style={{ marginLeft: 16 }}>
          Force Set Session (setSession)
        </button>
        <button onClick={handleTestEdgeFunction} style={{ marginLeft: 16 }}>
          Test JWT Edge Function
        </button>
      </div>
    </div>
  );
};

export default TestComponent;
