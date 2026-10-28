import { SiteLayout } from "@/components/site-layout";
import { getPublicData } from "@/lib/public-data";

export const metadata = { title: "Privacy policy | Mobile Gallary" };

export default async function PrivacyPolicyPage() {
  const { settings, contact, privacy: policy } = await getPublicData();

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
