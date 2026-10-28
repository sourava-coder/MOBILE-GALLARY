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
    const failedQuery = results.find((result) => result.error);
    if (failedQuery?.error) {
      throw new Error(`Could not load storefront content from Supabase: ${failedQuery.error.message}`);
    }

    return {
      settings: (settings.data ?? fallbackHomepageSettings) as HomepageSettings,
      products: (products.data ?? fallbackProducts) as Product[],
      services: (services.data ?? fallbackServices) as RepairService[],
      members: (members.data ?? fallbackMembers) as Member[],
      contact: (contact.data ?? fallbackContactDetails) as ContactDetails,
      gallery: (gallery.data ?? []) as ShopPhoto[],
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
