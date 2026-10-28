import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ContactDetails, HomepageSettings } from "@/lib/types";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/repairs", label: "Repairs" },
  { href: "/devices", label: "Devices" },
  { href: "/team", label: "Our team" },
  { href: "/contact", label: "Visit us" },
];

export function SiteLayout({
  settings,
  contact,
  children,
}: {
  settings: HomepageSettings;
  contact: ContactDetails;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="topbar page-width">
        <Link className="brand" href="/" aria-label={`${settings.store_name} home`}>
          <Image className="brand-logo" src="/logo.png" alt="" width={43} height={43} priority />
          <span><strong>{settings.store_name}</strong><small>Mobile · Repair · Care</small></span>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <Link className="button button-dark nav-cta" href="/contact">
          Get in touch <ArrowUpRight size={16} />
        </Link>
      </header>
      {children}
      <footer className="footer page-width">
        <Link className="brand footer-brand" href="/">
          <Image className="brand-logo" src="/logo.png" alt="" width={43} height={43} />
          <span><strong>{settings.store_name}</strong><small>Mobile · Repair · Care</small></span>
        </Link>
        <span className="footer-note">Local care for the devices that keep you moving.</span>
        <div className="footer-links">
          {contact.instagram_url && <a href={contact.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
          {contact.facebook_url && <a href={contact.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/admin/login">Admin</Link>
        </div>
      </footer>
    </>
  );
}
