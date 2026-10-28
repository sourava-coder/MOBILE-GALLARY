import { SiteLayout } from "@/components/site-layout";
import { PageIntro, TeamRoster, VisitCta } from "@/components/public-sections";
import { getPublicData } from "@/lib/public-data";

export const metadata = { title: "Our team | Mobile Gallary" };

export default async function TeamPage() {
  const { settings, contact, members } = await getPublicData();

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main className="subpage page-width">
        <PageIntro
          label="Good people. Good advice."
          title="Meet your tech people"
          description="Our Mobile Gallary team is here to make mobile tech feel less complicated—with friendly support, useful advice, and careful repair work."
        />
        <section className="section subpage-section">
          <div className="section-heading">
            <div><p className="section-label">Here to help</p><h2>The people behind the care</h2></div>
            <p>Our team details are managed by the store and updated here as they change.</p>
          </div>
          <TeamRoster members={members} />
        </section>
        <VisitCta />
      </main>
    </SiteLayout>
  );
}
