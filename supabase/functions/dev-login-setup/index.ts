import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      headers: { "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    const devEmail = "devlogin@structra.dev";
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

    if (createError && createError.message?.toLowerCase().includes("already")) {
      console.log("Dev user already exists, looking up...");

      const { data: listedUsers, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        throw new Error(`Failed to list users: ${listError.message}`);
      }

      const existingUser = listedUsers?.users?.find(
        (user) => user.email?.toLowerCase() === devEmail.toLowerCase()
      );

      if (!existingUser?.id) {
        throw new Error("Dev user exists but could not be resolved");
      }

      userId = existingUser.id;
    } else if (createError) {
      throw new Error(`Failed to create dev user: ${createError.message}`);
    } else if (authData?.user?.id) {
      userId = authData.user.id;
    } else {
      throw new Error("No user ID returned from auth creation");
    }

    if (userId) {
      const { data: profile, error: selectError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

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
        user_id: userId,
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
});
