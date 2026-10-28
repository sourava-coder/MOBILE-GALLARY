import { SiteLayout } from "@/components/site-layout";
import { PageIntro, RepairServices, VisitCta } from "@/components/public-sections";
import { getPublicData } from "@/lib/public-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Phone repairs | Mobile Gallary" };

export default async function RepairsPage() {
  const { settings, contact, services } = await getPublicData();

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main className="subpage page-width">
        <PageIntro
          label="A little TLC for your tech"
          title="Phone repair services"
          description="From a tired battery to a cracked screen, our repair team will help get your device back to feeling like yours. Ask us about your model and symptoms."
        />
        <section className="section subpage-section">
          <div className="section-heading">
            <div><p className="section-label">Care for the everyday</p><h2>How we can help</h2></div>
            <p>Prices and repair times are shown when your store administrator has added them. Contact us for a device-specific estimate.</p>
          </div>
          <RepairServices services={services} settings={settings} />
        </section>
        <VisitCta />
      </main>
    </SiteLayout>
  );
}
