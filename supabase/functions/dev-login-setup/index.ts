import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const devEmail = "dev@structra.local";
    const devPassword = "password123";
    const devName = "Dev User";
    const defaultOrgId = "795acdd9-9a69-4699-aaee-2787f7babce0";

    let userId: string | null = null;

    // Try to create the dev user
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email: devEmail,
      password: devPassword,
      user_metadata: {
        full_name: devName,
      },
      email_confirm: true,
    });

    if (createError && createError.message?.includes("already registered")) {
      // User already exists, try to find by email
      console.log("Dev user already exists, looking up...");
      // We'll need to sign in or find the user another way
      // For now, assume if user already exists, profile exists too
      userId = "existing"; // Placeholder for existing user
    } else if (createError) {
      throw new Error(`Failed to create dev user: ${createError.message}`);
    } else if (authData?.user?.id) {
      userId = authData.user.id;
    } else {
      throw new Error("No user ID returned from auth creation");
    }

    // If it's a new user (has actual userId), create profile
    if (userId && userId !== "existing") {
      // Check if profile exists
      const { data: profile, error: selectError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      // If profile doesn't exist, create it
      if (selectError?.code === "PGRST116" || !profile) {
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: devEmail,
            full_name: devName,
            role: "admin",
            organization_id: defaultOrgId,
          });

        if (insertError && !insertError.message?.includes("duplicate key")) {
          throw insertError;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Dev account ready",
        email: devEmail,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Dev login setup error:", errorMsg);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMsg,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
}
