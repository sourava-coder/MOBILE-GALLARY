import Link from "next/link";
import { ArrowUpRight, BatteryCharging, Clock3, ShieldCheck, Smartphone, Wrench } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { VisitCta } from "@/components/public-sections";
import { getPublicData } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, contact } = await getPublicData();

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main>
        <section className="hero page-width">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEIGHBORHOOD TECH PARTNER</div>
            <h1>{settings.hero_title}</h1>
            <p className="hero-description">{settings.hero_description}</p>
            <div className="hero-actions">
              <Link className="button button-dark" href="/contact">{settings.cta_primary} <ArrowUpRight size={17} /></Link>
              <Link className="button button-soft" href="/repairs">{settings.cta_secondary}</Link>
            </div>
            <div className="hero-proof">
              <span className="proof-icon"><ShieldCheck size={18} /></span>
              <span>Careful hands. Clear answers. Quality you can count on.</span>
            </div>
          </div>
          <div className="hero-art" aria-label="Mobile phone and repair accessories">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-phone">
              <div className="phone-camera" />
              <div className="phone-screen">
                <span className="screen-kicker">MOBILE GALLARY</span>
                <span className="screen-title">Made to<br />move with you.</span>
                <span className="screen-mark"><Smartphone size={30} /></span>
              </div>
            </div>
            <div className="floating-note note-top"><ShieldCheck size={17} /><span>Trusted repairs</span></div>
            <div className="floating-note note-bottom"><BatteryCharging size={17} /><span>Ready for more</span></div>
            <span className="art-spark spark-one">✳</span>
            <span className="art-spark spark-two">✦</span>
          </div>
          <div className="hero-bottom">
            <span>Good tech should feel easy.</span>
            <span>Repairs · Devices · Accessories</span>
          </div>
        </section>
        {settings.enable_promotions && settings.tagline && (
          <div className="promo-note page-width"><span>✦</span>{settings.tagline}</div>
        )}

        <section className="trust-row page-width" aria-label="Why choose Mobile Gallary">
          <div><span className="trust-icon"><Wrench size={19} /></span><span><strong>Expert repairs</strong><small>Careful work, done right</small></span></div>
          <div><span className="trust-icon"><ShieldCheck size={19} /></span><span><strong>Honest guidance</strong><small>Real answers, no pressure</small></span></div>
          <div><span className="trust-icon"><Clock3 size={19} /></span><span><strong>Here when you need us</strong><small>Friendly local support</small></span></div>
        </section>

        <section className="home-links page-width">
          <Link className="home-link-card clay-card" href="/repairs"><span className="trust-icon"><Wrench size={19} /></span><span><strong>Repair services</strong><small>See how we can help</small></span><ArrowUpRight size={18} /></Link>
          <Link className="home-link-card clay-card" href="/devices"><span className="trust-icon"><Smartphone size={19} /></span><span><strong>Devices & accessories</strong><small>Explore our current selection</small></span><ArrowUpRight size={18} /></Link>
          <Link className="home-link-card clay-card" href="/team"><span className="trust-icon"><ShieldCheck size={19} /></span><span><strong>Meet the team</strong><small>Get to know your tech people</small></span><ArrowUpRight size={18} /></Link>
        </section>
        <div className="page-width"><VisitCta /></div>
      </main>
    </SiteLayout>
  );
}
