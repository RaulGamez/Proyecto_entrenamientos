// index.ts (Deno / Supabase Functions)
// IMPORTANTE: en producción usa validaciones y protección (captcha, rate limiting, etc.)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js";

const SUPABASE_URL = Deno.env.get("SB_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SB_SERVICE_ROLE_KEY")!;
const REGISTER_SECRET = Deno.env.get("REGISTER_SECRET");

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Only POST" }), { status: 405 });
    }

    // 2) Validar secreto propio con trimming y logs seguros
    const headerSecretRaw = req.headers.get("x-register-secret") ?? "";
    const headerSecret = headerSecretRaw.trim();

    const serverSecretRaw = Deno.env.get("REGISTER_SECRET") ?? "";
    const serverSecret = serverSecretRaw.trim();

    if (!headerSecret || headerSecret !== serverSecret) {
      console.log("Auth fail: x-register-secret missing");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, email, username, phone } = body ?? {};

    // Validaciones básicas
    if (!id || !email || !username) {
      return new Response(JSON.stringify({ error: "email, password and username required" }), { status: 400 });
    }

    // Verificar que el nombre de usuario no esta en uso
    const { data: existing, error: selectErr } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

    if (selectErr) {
      console.error("Error verificando username:", selectErr);
      return new Response(JSON.stringify({ error: selectErr.message }), { status: 400 });
    }

    if (existing) {
      return new Response(JSON.stringify({
        error: "El nombre de usuario ya está en uso",
        suggestions: [
          `${username}_${Math.floor(Math.random() * 100)}`,
          `${username}${Math.floor(Math.random() * 1000)}`,
          `${username.slice(0, 8)}_${Math.floor(Math.random() * 9999)}`
        ]
      }), { status: 409 });
    }

    // 2) Insertar fila en public.users (perfil)
    const { error: insertErr } = await supabaseAdmin
      .from("users")
      .insert([{
        id,
        email,
        username,
        phone: phone || null,
      }]);

    if (insertErr) {
      // Si la inserción falla, podrías eliminar el auth user para mantener consistencia
      console.error("insertErr:", insertErr);
      // opcional: rollback remove user
      await supabaseAdmin.auth.admin.deleteUser(id).catch((e) => {
        console.error("Error rollback deleteUser:", e)
      });
      return new Response(JSON.stringify({ error: insertErr.message }), { status: 400 });
    }

    // 3) Respuesta (no enviamos service role ni tokens)
    return new Response(JSON.stringify({ ok: true, userId: id }), { status: 200 });
  } catch (err) {
    console.error("Unhandled error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
});
