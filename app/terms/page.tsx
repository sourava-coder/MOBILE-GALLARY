import { SiteLayout } from "@/components/site-layout";
import { getPublicData } from "@/lib/public-data";
import { createSupabaseServerClient } from "@/lib/supabase";
import { fallbackTerms } from "@/lib/fallback-data";

export const metadata = { title: "Terms and conditions | Mobile Gallary" };
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const [supabase, { settings, contact }] = await Promise.all([
    createSupabaseServerClient(),
    getPublicData(),
  ]);
  const { data, error } = supabase
    ? await supabase.from("terms").select("title, content").limit(1).maybeSingle()
    : { data: null, error: null };
  if (error) throw new Error(`Could not load the terms from Supabase: ${error.message}`);
  const terms = data ?? fallbackTerms;

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main className="legal-page page-width">
        <article className="legal-card clay-card">
          <p className="section-label">MOBILE GALLARY</p>
          <h1>{terms.title}</h1>
          <p className="legal-copy">{terms.content}</p>
        </article>
      </main>
    </SiteLayout>
  );
}
