const STORAGE_BUCKET = "shop-assets";

export function getPublicImageUrl(value?: string | null) {
  const image = value?.trim();
  if (!image) return "";
  if (/^(https?:|data:|blob:)/i.test(image) || image.startsWith("/")) return image;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (!supabaseUrl) return image;

  const objectPath = image.replace(/^\/+/, "").replace(/^shop-assets\//, "");
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${objectPath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}
