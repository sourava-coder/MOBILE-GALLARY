import Link from "next/link";
import { ArrowUpRight, Clock3, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { VisitCta } from "@/components/public-sections";
import ShopGallerySlider from "@/components/shop-gallery-slider";
import HeroSlider from "@/components/hero-slider";
import ScrollReveal from "@/components/scroll-reveal";
import WelcomeBanner from "@/components/welcome-banner";
import { getPublicData } from "@/lib/public-data";

export default async function HomePage() {
  const { settings, contact, gallery } = await getPublicData();
  const homePhotos = [
    ...(settings.shop_image_url ? [{
      id: "legacy-home-shop-photo",
      page: "home" as const,
      image_url: settings.shop_image_url,
      alt_text: settings.shop_image_alt || "Inside Mobile Gallary",
      sort_order: -1,
    }] : []),
    ...gallery.filter((photo) => photo.page === "home"),
  ].filter((photo, index, photos) => photos.findIndex((item) => item.image_url === photo.image_url) === index);

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main>
        {(homePhotos.length > 0 || settings.hero_video_url) && (
          <WelcomeBanner photos={homePhotos} videoUrl={settings.hero_video_url} />
        )}
        <HeroSlider settings={settings} />
        {settings.enable_promotions && settings.tagline && (
          <div className="promo-note page-width"><span>✦</span>{settings.tagline}</div>
        )}

        <ScrollReveal className="page-width"><section className="trust-row" aria-label="Why choose Mobile Gallary">
          <div><span className="trust-icon"><Wrench size={19} /></span><span><strong>Expert repairs</strong><small>Careful work, done right</small></span></div>
          <div><span className="trust-icon"><ShieldCheck size={19} /></span><span><strong>Honest guidance</strong><small>Real answers, no pressure</small></span></div>
          <div><span className="trust-icon"><Clock3 size={19} /></span><span><strong>Here when you need us</strong><small>Friendly local support</small></span></div>
        </section></ScrollReveal>
        {homePhotos.length > 0 && (
          <ScrollReveal className="page-width"><section className="shop-showcase" aria-label="Mobile Gallary shop">
            <div className="shop-showcase-copy">
              <p className="section-label">A place for better device care</p>
              <h2>Step into Mobile Gallary.</h2>
              <p>Visit us for friendly advice, careful repairs, and a closer look at the devices we recommend.</p>
            </div>
            <ShopGallerySlider photos={homePhotos} caption="Inside Mobile Gallary" />
          </section></ScrollReveal>
        )}

        <ScrollReveal className="page-width"><section className="home-links">
          <Link className="home-link-card clay-card" href="/repairs"><span className="trust-icon"><Wrench size={19} /></span><span><strong>Repair services</strong><small>See how we can help</small></span><ArrowUpRight size={18} /></Link>
          <Link className="home-link-card clay-card" href="/devices"><span className="trust-icon"><Smartphone size={19} /></span><span><strong>Devices & accessories</strong><small>Explore our current selection</small></span><ArrowUpRight size={18} /></Link>
          <Link className="home-link-card clay-card" href="/team"><span className="trust-icon"><ShieldCheck size={19} /></span><span><strong>Meet the team</strong><small>Get to know your tech people</small></span><ArrowUpRight size={18} /></Link>
        </section></ScrollReveal>
        <ScrollReveal className="page-width"><VisitCta /></ScrollReveal>
      </main>
    </SiteLayout>
  );
}
