import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { ADMIN_PIN_COOKIE, verifyAdminPinSession } from "@/lib/admin-pin";

export async function getAdminRequestContext(): Promise<{
  client: SupabaseClient | null;
  error: string | null;
}> {
  const cookieStore = await cookies();
  if (!verifyAdminPinSession(cookieStore.get(ADMIN_PIN_COOKIE)?.value)) {
    return { client: null, error: "Admin PIN session expired. Enter your PIN again." };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    return { client: null, error: "Supabase server credentials are not configured." };
  }

  return {
    client: createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
    error: null,
  };
}
