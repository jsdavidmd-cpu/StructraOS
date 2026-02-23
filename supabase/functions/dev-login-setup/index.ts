import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const devEmail = "dev@structra.local";
    const devPassword = "password123";
    const devName = "Dev User";

    // Try to create or get the dev user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: devEmail,
      password: devPassword,
      user_metadata: {
        full_name: devName,
      },
      email_confirm: true, // Auto-confirm email for dev
    });

    if (authError && authError.message !== "User already registered") {
      throw authError;
    }

    const userId = authData?.user?.id;

    if (!userId) {
      // User already exists, get them
      const { data: existingUser, error: lookupError } = await supabase.auth.admin.getUserById(userId || "");
      if (lookupError && !userId) {
        throw new Error("Could not create or retrieve dev user");
      }
    }

    // Ensure profile exists with admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: devEmail,
          full_name: devName,
          role: "admin",
          organization_id: "795acdd9-9a69-4699-aaee-2787f7babce0", // Default org
        });

      if (insertError) throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dev account ready",
        email: devEmail,
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Dev login error:", errorMsg);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
}
