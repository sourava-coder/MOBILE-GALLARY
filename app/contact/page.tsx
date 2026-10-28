import { SiteLayout } from "@/components/site-layout";
import { ContactDetailsPanel, PageIntro } from "@/components/public-sections";
import { getPublicData } from "@/lib/public-data";

export const metadata = { title: "Visit Mobile Gallary | Contact" };

export default async function ContactPage() {
  const { settings, contact, gallery } = await getPublicData();

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main className="subpage page-width">
        <PageIntro
          label="Drop us a line or drop by"
          title="Let’s get your tech sorted."
          description="Have a question about a repair, looking for something specific, or just need a little advice? We’d love to hear from you."
        />
        <ContactDetailsPanel contact={contact} gallery={gallery.filter((photo) => photo.page === "visit")} />
      </main>
    </SiteLayout>
  );
}
