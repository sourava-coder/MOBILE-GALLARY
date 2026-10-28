import {
  fallbackContactDetails,
  fallbackHomepageSettings,
  fallbackMembers,
  fallbackProducts,
  fallbackServices,
} from "@/lib/fallback-data";
import { createSupabaseServerClient } from "@/lib/supabase";
import type {
  ContactDetails,
  HomepageSettings,
  Member,
  Product,
  RepairService,
} from "@/lib/types";

export async function getPublicData() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      settings: fallbackHomepageSettings,
      products: fallbackProducts,
      services: fallbackServices,
      members: fallbackMembers,
      contact: fallbackContactDetails,
    };
  }

  const results = await Promise.all([
    supabase.from("homepage_settings").select("*").limit(1).maybeSingle(),
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("repair_services").select("*").order("created_at", { ascending: false }),
    supabase.from("members").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_details").select("*").limit(1).maybeSingle(),
  ]);
  const [settings, products, services, members, contact] = results;
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
  };
}
