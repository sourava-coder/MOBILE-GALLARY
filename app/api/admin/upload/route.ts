import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminRequestContext } from "@/lib/admin-server";

export const runtime = "nodejs";

const mimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const allowedTables = new Set([
  "homepage_settings",
  "products",
  "repair_services",
  "members",
  "contact_details",
  "shop_gallery",
]);

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > 5 * 1024 * 1024 + 128 * 1024) {
    return NextResponse.json({ error: "Image must be no larger than 5 MB." }, { status: 413 });
  }

  const { client, error } = await getAdminRequestContext();
  if (!client) return NextResponse.json({ error }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  const table = formData.get("table");
  if (!(file instanceof File) || typeof table !== "string" || !allowedTables.has(table)) {
    return NextResponse.json({ error: "Choose a valid image and content type." }, { status: 400 });
  }
  if (!(file.type in mimeExtensions) || file.size === 0 || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be JPEG, PNG, WebP, or GIF and no larger than 5 MB." }, { status: 400 });
  }

  const objectName = `${table}/${randomUUID()}.${mimeExtensions[file.type]}`;
  const { error: uploadError } = await client.storage
    .from("shop-assets")
    .upload(objectName, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (uploadError) {
    console.error("Could not upload admin image.", uploadError);
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }

  const { data } = client.storage.from("shop-assets").getPublicUrl(objectName);
  return NextResponse.json({ imageUrl: data.publicUrl }, { status: 201 });
}
