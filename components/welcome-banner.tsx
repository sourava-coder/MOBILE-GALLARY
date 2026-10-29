"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { ShopPhoto } from "@/lib/types";

export default function WelcomeBanner({ photos, videoUrl }: { photos: ShopPhoto[]; videoUrl?: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = photos.map((photo, index) => ({
    ...photo,
    title: [
      "SMARTER TECH. BETTER CARE.",
      "PREMIUM DEVICES. HONEST GUIDANCE.",
      "REPAIR WITH CONFIDENCE.",
    ][index % 3],
    description: [
      "Discover trusted devices, thoughtful accessories, and expert repairs made for your everyday life.",
      "Find the right device for your world, with friendly advice and support that stays close.",
      "Careful hands, clear answers, and dependable repairs for the devices you rely on every day.",
    ][index % 3],
  }));

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [activeIndex, slides.length]);

  const activeSlide = slides[activeIndex] ?? {
    title: "SMARTER TECH. BETTER CARE.",
    description: "Discover trusted devices, thoughtful accessories, and expert repairs made for your everyday life.",
  };

  return (
    <section className="welcome-banner" aria-label="Welcome to Mobile Gallary">
      {videoUrl && (
        <video
          className="welcome-banner-video"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
      )}
      {slides.map((slide, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={`welcome-banner-image ${!videoUrl && index === activeIndex ? "active" : ""}`}
          src={slide.image_url}
          alt=""
          aria-hidden="true"
          key={slide.id ?? `${slide.image_url}-${index}`}
        />
      ))}
      <div className="welcome-banner-overlay" />
      <div className="welcome-banner-content" key={activeIndex}>
        <div className="welcome-banner-badge"><Sparkles size={15} /> WELCOME TO MOBILE GALLARY</div>
        <h1>{activeSlide.title.split(". ").map((part, index, parts) => (
          <span key={part}>{part}{index < parts.length - 1 ? ". " : ""}{index === 0 && <br />}</span>
        ))}</h1>
        <p>{activeSlide.description}</p>
        <div className="welcome-banner-actions">
          <Link className="welcome-banner-primary" href="/contact">TALK TO OUR TEAM <ArrowUpRight size={17} /></Link>
          <Link className="welcome-banner-secondary" href="/devices">EXPLORE DEVICES <ArrowUpRight size={17} /></Link>
        </div>
      </div>
      <div className="welcome-banner-stats" aria-label="Mobile Gallary highlights">
        <div><strong>01</strong><span>EXPERT CARE</span></div>
        <div><strong>02</strong><span>QUALITY DEVICES</span></div>
        <div><strong>03</strong><span>LOCAL SUPPORT</span></div>
      </div>
      {!videoUrl && slides.length > 1 && (
        <div className="welcome-banner-dots" aria-label="Choose welcome image">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === activeIndex ? "active" : ""}
              aria-label={`Show welcome image ${index + 1}`}
              aria-pressed={index === activeIndex}
              key={slide.id ?? `${slide.image_url}-dot-${index}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
