import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminRequestContext } from "@/lib/admin-server";

export const runtime = "nodejs";

const resourceFields = {
  homepage_settings: [
    "store_name", "tagline", "hero_title", "hero_description", "cta_primary",
    "cta_secondary", "currency_code", "enable_promotions",
    "shop_image_url", "shop_image_alt",
  ],
  products: [
    "name", "brand", "category", "price", "condition", "description",
    "image_url", "availability", "featured",
  ],
  repair_services: [
    "name", "price", "duration", "description", "featured", "image_url", "icon",
  ],
  members: ["name", "role", "bio", "image_url", "featured"],
  contact_details: [
    "phone", "email", "address", "whatsapp", "opening_hours", "map_url",
    "instagram_url", "facebook_url",
    "shop_image_url", "shop_image_alt",
  ],
  shop_gallery: ["page", "image_url", "alt_text", "sort_order"],
  privacy_policies: ["title", "content"],
  terms: ["title", "content"],
} as const;

type AdminTable = keyof typeof resourceFields;

function isAdminTable(value: string | null): value is AdminTable {
  return value !== null && Object.hasOwn(resourceFields, value);
}

function isSameOrigin(request: NextRequest) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

function refreshPublicPages() {
  revalidatePath("/", "layout");
}

function validateValues(table: AdminTable, input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { values: null, error: "Content must be an object." };
  }

  const allowedFields = resourceFields[table] as readonly string[];
  const values = input as Record<string, unknown>;
  const cleaned: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(values)) {
    if (!allowedFields.includes(key)) {
      return { values: null, error: `Field '${key}' cannot be changed.` };
    }

    if (value === null) {
      cleaned[key] = null;
      continue;
    }

    if (key === "price" || key === "sort_order") {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
        return { values: null, error: `${key} must be a non-negative number.` };
      }
      if (key === "sort_order" && !Number.isInteger(value)) {
        return { values: null, error: "sort_order must be a whole number." };
      }
      cleaned[key] = value;
      continue;
    }

    if (key === "featured" || key === "enable_promotions") {
      if (typeof value !== "boolean") {
        return { values: null, error: `${key} must be true or false.` };
      }
      cleaned[key] = value;
      continue;
    }

    if (typeof value !== "string" || value.length > (key === "content" || key === "description" || key === "hero_description" ? 20000 : 1000)) {
      return { values: null, error: `${key} must be text within the allowed length.` };
    }
    cleaned[key] = value.trim() || null;
  }

  if (table === "homepage_settings" && !cleaned.currency_code) {
    cleaned.currency_code = "INR";
  }
  if (table === "shop_gallery" && !["home", "visit"].includes(String(cleaned.page))) {
    return { values: null, error: "Choose Home or Visit us for this photo." };
  }
  if (table === "products" && !["available", "unavailable", "coming_soon"].includes(String(cleaned.availability))) {
    return { values: null, error: "Choose a valid product availability status." };
  }

  for (const requiredKey of table === "homepage_settings"
    ? ["store_name", "tagline", "hero_title", "hero_description", "cta_primary", "cta_secondary", "currency_code"]
    : table === "products" || table === "repair_services"
      ? ["name"]
      : table === "members"
        ? ["name", "role"]
        : table === "privacy_policies" || table === "terms"
          ? ["title", "content"]
          : []) {
    if (!cleaned[requiredKey]) {
      return { values: null, error: `${requiredKey} is required.` };
    }
  }

  if (table === "homepage_settings" && !["INR", "USD", "EUR", "GBP"].includes(String(cleaned.currency_code))) {
    return { values: null, error: "Choose a supported price currency." };
  }

  return { values: cleaned, error: null };
}

export async function GET(request: NextRequest) {
  const table = request.nextUrl.searchParams.get("table");
  if (!isAdminTable(table)) return NextResponse.json({ error: "Invalid content type." }, { status: 400 });

  const { client, error } = await getAdminRequestContext();
  if (!client) return NextResponse.json({ error }, { status: 401 });

  const { data, error: queryError } = await client
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });
  if (queryError) {
    console.error("Could not load admin content.", queryError);
    return NextResponse.json({ error: "Could not load content." }, { status: 500 });
  }
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const body = await request.json().catch(() => null) as { table?: string; values?: unknown } | null;
  const table = body?.table;
  if (!body || typeof table !== "string" || !isAdminTable(table)) {
    return NextResponse.json({ error: "Invalid content request." }, { status: 400 });
  }
  const { values, error: validationError } = validateValues(table, body.values);
  if (!values) return NextResponse.json({ error: validationError }, { status: 400 });

  const { client, error } = await getAdminRequestContext();
  if (!client) return NextResponse.json({ error }, { status: 401 });

  const isSingleton = ["homepage_settings", "contact_details", "privacy_policies", "terms"].includes(table);
  if (isSingleton) {
    const { data: current, error: currentError } = await client
      .from(table)
      .select("id")
      .limit(1)
      .maybeSingle();
    if (currentError) return NextResponse.json({ error: "Could not read current settings." }, { status: 500 });
    if (current) {
      const { error: updateError } = await client.from(table).update(values).eq("id", current.id);
      if (updateError) return NextResponse.json({ error: "Could not save settings." }, { status: 500 });
      refreshPublicPages();
      return NextResponse.json({ success: true });
    }
  }

  const { error: insertError } = await client.from(table).insert(values);
  if (insertError) {
    console.error("Could not create admin content.", insertError);
    return NextResponse.json({ error: "Could not save content." }, { status: 500 });
  }
  refreshPublicPages();
  return NextResponse.json({ success: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const body = await request.json().catch(() => null) as { table?: string; id?: string; values?: unknown } | null;
  const table = body?.table;
  const id = body?.id;
  if (!body || typeof table !== "string" || !isAdminTable(table) || !id) {
    return NextResponse.json({ error: "Invalid content request." }, { status: 400 });
  }
  const { values, error: validationError } = validateValues(table, body.values);
  if (!values) return NextResponse.json({ error: validationError }, { status: 400 });

  const { client, error } = await getAdminRequestContext();
  if (!client) return NextResponse.json({ error }, { status: 401 });

  const { error: updateError } = await client.from(table).update(values).eq("id", id);
  if (updateError) {
    console.error("Could not update admin content.", updateError);
    return NextResponse.json({ error: "Could not update content." }, { status: 500 });
  }
  refreshPublicPages();
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  const table = request.nextUrl.searchParams.get("table");
  const id = request.nextUrl.searchParams.get("id");
  if (!isAdminTable(table) || !id) return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });

  const { client, error } = await getAdminRequestContext();
  if (!client) return NextResponse.json({ error }, { status: 401 });

  const { error: deleteError } = await client.from(table).delete().eq("id", id);
  if (deleteError) {
    console.error("Could not delete admin content.", deleteError);
    return NextResponse.json({ error: "Could not delete content." }, { status: 500 });
  }
  refreshPublicPages();
  return NextResponse.json({ success: true });
}
