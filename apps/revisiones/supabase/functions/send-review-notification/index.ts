import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function generateEmailHTML(clientName: string, vehicleInfo: string, reviewUrl: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tu revisión está lista</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #0029D4 0%, #001FA0 100%); padding: 40px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Fran Garcia Cars</h1>
                  <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Inspección Profesional de Vehículos</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hola ${clientName},</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Nos complace informarte que tu revisión del vehículo <strong>${vehicleInfo}</strong> ha sido completada y está lista para ser visualizada.
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Nuestro equipo de expertos ha realizado una inspección completa y detallada. Puedes acceder al informe completo haciendo clic en el botón de abajo.
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${reviewUrl}" style="display: inline-block; background: linear-gradient(135deg, #0029D4 0%, #001FA0 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                          Ver Mi Informe
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    El informe incluye:
                  </p>
                  <ul style="color: #666666; font-size: 14px; line-height: 1.8; margin: 10px 0 0 0; padding-left: 20px;">
                    <li>Inspección completa de todos los sistemas del vehículo</li>
                    <li>Fotografías detalladas</li>
                    <li>Videos de prueba de conducción</li>
                    <li>Documentos verificados (CarVertical, TÜV, etc.)</li>
                  </ul>
                  <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eeeeee;">
                    <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 0;">
                      Si tienes alguna pregunta sobre tu informe, no dudes en contactarnos.
                    </p>
                    <p style="color: #999999; font-size: 14px; margin: 10px 0 0 0;">
                      <strong>Fran Garcia Cars</strong><br>
                      Expertos en inspección de vehículos de alta gama
                    </p>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

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

    const { review_id } = await req.json();

    if (!review_id) {
      throw new Error("Missing review_id");
    }

    const { data: review, error: reviewError } = await supabaseAdmin
      .from("reviews")
      .select(`
        *,
        client:profiles!reviews_client_id_fkey(id, full_name, email)
      `)
      .eq("id", review_id)
      .single();

    if (reviewError || !review) {
      throw new Error("Review not found");
    }

    const clientName = review.client.full_name;
    const clientEmail = review.client.email;
    const vehicleInfo = `${review.vehicle_make} ${review.vehicle_model}`;
    const reviewUrl = `${Deno.env.get("SUPABASE_URL")}/client-review/${review_id}`;

    const emailHTML = generateEmailHTML(clientName, vehicleInfo, reviewUrl);

    console.log(`Would send email to: ${clientEmail}`);
    console.log(`Subject: Tu revisión de ${vehicleInfo} está lista`);
    console.log(`Review URL: ${reviewUrl}`);

    await supabaseAdmin.from("activity_logs").insert({
      user_id: user.id,
      review_id: review_id,
      action: "email_notification_sent",
      description: `Email notification sent to ${clientEmail}`,
      metadata: { client_email: clientEmail, vehicle_info: vehicleInfo },
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification logged (email sending not configured)",
        client_email: clientEmail,
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