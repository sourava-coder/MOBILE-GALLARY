import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminRequestContext } from "@/lib/admin-server";

export const runtime = "nodejs";

const videoExtensions: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Request could not be verified." }, { status: 403 });
  }

  const { client, error } = await getAdminRequestContext();
  if (!client) return NextResponse.json({ error }, { status: 401 });

  const body = await request.json() as { contentType?: string; size?: number };
  const extension = body.contentType ? videoExtensions[body.contentType] : undefined;
  const size = Number(body.size);
  if (!extension || !Number.isFinite(size) || size <= 0 || size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "Video must be MP4 or WebM and no larger than 50 MB." }, { status: 400 });
  }

  const objectName = `homepage_settings/${randomUUID()}.${extension}`;
  const { data, error: signError } = await client.storage
    .from("shop-assets")
    .createSignedUploadUrl(objectName);
  if (signError || !data) {
    console.error("Could not create signed admin media upload URL.", signError);
    return NextResponse.json({ error: "Could not prepare media upload." }, { status: 500 });
  }

  const { data: publicUrl } = client.storage.from("shop-assets").getPublicUrl(objectName);
  return NextResponse.json({
    path: data.path,
    token: data.token,
    mediaUrl: publicUrl.publicUrl,
  });
}
