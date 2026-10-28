import { SiteLayout } from "@/components/site-layout";
import { PageIntro, ProductCatalog, VisitCta } from "@/components/public-sections";
import { getPublicData } from "@/lib/public-data";

export const metadata = { title: "Devices & accessories | Mobile Gallary" };

export default async function DevicesPage() {
  const { settings, contact, products } = await getPublicData();

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main className="subpage page-width">
        <PageIntro
          label="Thoughtful tech, carefully selected"
          title="Devices & accessories"
          description="Explore the products currently listed by Mobile Gallary. No online checkout—visit us or get in touch to ask about a device."
        />
        <section className="section subpage-section">
          <div className="section-heading">
            <div><p className="section-label">Selected for you</p><h2>Our current selection</h2></div>
            <p>Availability can change. Please contact the store to confirm product details.</p>
          </div>
          <ProductCatalog products={products} settings={settings} />
        </section>
        <VisitCta />
      </main>
    </SiteLayout>
  );
}
