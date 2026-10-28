import { SiteLayout } from "@/components/site-layout";
import { getPublicData } from "@/lib/public-data";

export const metadata = { title: "Terms and conditions | Mobile Gallary" };

export default async function TermsPage() {
  const { settings, contact, terms } = await getPublicData();

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
