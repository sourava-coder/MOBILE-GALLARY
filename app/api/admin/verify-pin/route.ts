import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_PIN_COOKIE,
  adminPinSessionDuration,
  assertAdminPinConfigured,
  createAdminPinSession,
  getAdminRequestKey,
  verifyAdminPin,
} from "@/lib/admin-pin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  }

  let pin: unknown;
  try {
    ({ pin } = await request.json() as { pin?: unknown });
  } catch {
    return NextResponse.json({ error: "Enter your admin PIN." }, { status: 400 });
  }

  try {
    assertAdminPinConfigured();
    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ error: "Enter your 4-digit admin PIN." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Supabase server credentials are not configured.");
    }

    const adminClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const requestKey = getAdminRequestKey(
      request.headers.get("x-real-ip") ??
        request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ??
        (process.env.NODE_ENV === "development" ? "127.0.0.1" : undefined),
    );
    const { data: attemptAllowed, error: rateLimitError } = await adminClient.rpc(
      "consume_admin_pin_ip_attempt",
      { p_request_key: requestKey },
    );
    if (rateLimitError) {
      console.error("Could not check the admin PIN attempt limit.", rateLimitError);
      return NextResponse.json({ error: "PIN verification is temporarily unavailable." }, { status: 503 });
    }
    if (!attemptAllowed) {
      return NextResponse.json({ error: "Too many PIN attempts. Try again in 15 minutes." }, { status: 429 });
    }

    if (!verifyAdminPin(pin)) {
      return NextResponse.json({ error: "The admin PIN was not accepted." }, { status: 401 });
    }

    const { error: clearError } = await adminClient.rpc(
      "clear_admin_pin_ip_attempts",
      { p_request_key: requestKey },
    );
    if (clearError) {
      console.error("Could not clear the admin PIN attempt counter.", clearError);
      return NextResponse.json({ error: "PIN verification is temporarily unavailable." }, { status: 503 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_PIN_COOKIE, createAdminPinSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: adminPinSessionDuration,
    });
    return response;
  } catch (error) {
    console.error("Admin PIN verification is not configured.", error);
    return NextResponse.json({ error: "Admin PIN authentication is not configured." }, { status: 503 });
  }
}
