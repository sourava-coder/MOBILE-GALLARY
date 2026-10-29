"use client";

import Link from "next/link";
import { ArrowUpRight, BatteryCharging, ShieldCheck, Smartphone } from "lucide-react";
import type { HomepageSettings } from "@/lib/types";

export default function HeroSlider({
  settings,
}: {
  settings: HomepageSettings;
}) {
  return (
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
  );
}
