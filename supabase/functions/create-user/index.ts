import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateUserRequest {
  email: string;
  password: string;
  role: "admin" | "reviewer" | "client";
  full_name: string;
  phone?: string;
  location?: string;
  assigned_admin_id?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a Supabase client with the service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the calling user is an admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      throw new Error("Only admins can create users");
    }

    // Parse request body
    const userData: CreateUserRequest = await req.json();

    // Validate required fields
    if (!userData.email || !userData.password || !userData.role || !userData.full_name) {
      throw new Error("Missing required fields");
    }

    // Create user with Admin API
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        full_name: userData.full_name,
        role: userData.role,
      },
    });

    if (createError) {
      throw createError;
    }

    if (!newUser.user) {
      throw new Error("User creation failed");
    }

    // Create profile
    const { error: profileInsertError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUser.user.id,
        role: userData.role,
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        location: userData.location,
        assigned_admin_id: userData.assigned_admin_id,
        active: true,
        metadata: {},
      });

    if (profileInsertError) {
      // If profile creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      throw profileInsertError;
    }

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      user_id: user.id,
      action: "user_created",
      details: `Created ${userData.role} user: ${userData.full_name} (${userData.email})`,
    });

    // Send webhook notification
    try {
      await fetch('https://n8n.miempresa.online/webhook-test/def24783-7601-4abf-9ae7-9d4c02ee6c25', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'user_created',
          timestamp: new Date().toISOString(),
          user: {
            id: newUser.user.id,
            email: userData.email,
            password: userData.password,
            full_name: userData.full_name,
            role: userData.role,
            phone: userData.phone,
            location: userData.location,
            assigned_admin_id: userData.assigned_admin_id,
          },
        }),
      });
    } catch (webhookError) {
      console.error('Webhook notification failed:', webhookError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser.user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});