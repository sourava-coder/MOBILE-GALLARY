import { SiteLayout } from "@/components/site-layout";
import { getPublicData } from "@/lib/public-data";
import { createSupabaseServerClient } from "@/lib/supabase";
import { fallbackPrivacyPolicy } from "@/lib/fallback-data";

export const metadata = { title: "Privacy policy | Mobile Gallary" };
export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const [supabase, { settings, contact }] = await Promise.all([
    createSupabaseServerClient(),
    getPublicData(),
  ]);
  const { data, error } = supabase
    ? await supabase.from("privacy_policies").select("title, content").limit(1).maybeSingle()
    : { data: null, error: null };
  if (error) throw new Error(`Could not load the privacy policy from Supabase: ${error.message}`);
  const policy = data ?? fallbackPrivacyPolicy;

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main className="legal-page page-width">
        <article className="legal-card clay-card">
          <p className="section-label">MOBILE GALLARY</p>
          <h1>{policy.title}</h1>
          <p className="legal-copy">{policy.content}</p>
        </article>
      </main>
    </SiteLayout>
  );
}
