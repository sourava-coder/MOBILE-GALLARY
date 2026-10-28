import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import {
  fallbackContactDetails,
  fallbackHomepageSettings,
  fallbackMembers,
  fallbackProducts,
  fallbackServices,
  fallbackPrivacyPolicy,
  fallbackTerms,
} from "@/lib/fallback-data";
import type {
  ContactDetails,
  HomepageSettings,
  Member,
  Product,
  RepairService,
  ShopPhoto,
  LegalPage,
} from "@/lib/types";
import { getPublicImageUrl } from "@/lib/image-url";

function normalizePublicImages<T extends Record<string, unknown>>(value: T, fields: string[]) {
  const normalized: Record<string, unknown> = { ...value };
  for (const field of fields) {
    if (typeof normalized[field] === "string") {
      normalized[field] = getPublicImageUrl(normalized[field] as string);
    }
  }
  return normalized;
}

const getCachedPublicData = unstable_cache(
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      return null;
    }

    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const results = await Promise.all([
      supabase.from("homepage_settings").select("*").limit(1).maybeSingle(),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("repair_services").select("*").order("created_at", { ascending: false }),
      supabase.from("members").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_details").select("*").limit(1).maybeSingle(),
      supabase.from("shop_gallery").select("*").order("sort_order", { ascending: true }),
      supabase.from("privacy_policies").select("*").limit(1).maybeSingle(),
      supabase.from("terms").select("*").limit(1).maybeSingle(),
    ]);
    const [settings, products, services, members, contact, gallery, privacy, terms] = results;
    const failedQuery = results
      .filter((result) => result !== gallery)
      .find((result) => result.error);
    if (failedQuery?.error) {
      throw new Error(`Could not load storefront content from Supabase: ${failedQuery.error.message}`);
    }

    return {
      settings: normalizePublicImages(
        (settings.data ?? fallbackHomepageSettings) as HomepageSettings,
        ["shop_image_url"],
      ) as HomepageSettings,
      products: (products.data ?? fallbackProducts).map((item) =>
        normalizePublicImages(item as Product, ["image_url"]) as Product,
      ),
      services: (services.data ?? fallbackServices).map((item) =>
        normalizePublicImages(item as RepairService, ["image_url"]) as RepairService,
      ),
      members: (members.data ?? fallbackMembers).map((item) =>
        normalizePublicImages(item as Member, ["image_url"]) as Member,
      ),
      contact: normalizePublicImages(
        (contact.data ?? fallbackContactDetails) as ContactDetails,
        ["shop_image_url"],
      ) as ContactDetails,
      gallery: (gallery.data ?? []).map((item) =>
        normalizePublicImages(item as ShopPhoto, ["image_url"]) as ShopPhoto,
      ),
      privacy: (privacy.data ?? fallbackPrivacyPolicy) as LegalPage,
      terms: (terms.data ?? fallbackTerms) as LegalPage,
    };
  },
  ["mobile-gallary-public-data"],
  { revalidate: 10 },
);

export async function getPublicData() {
  const cachedData = await getCachedPublicData();
  if (!cachedData) {
    return {
      settings: fallbackHomepageSettings,
      products: fallbackProducts,
      services: fallbackServices,
      members: fallbackMembers,
      contact: fallbackContactDetails,
      gallery: [],
      privacy: fallbackPrivacyPolicy,
      terms: fallbackTerms,
    };
  }
  return cachedData;
}
