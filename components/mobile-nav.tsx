"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/repairs", label: "Repairs" },
  { href: "/devices", label: "Devices" },
  { href: "/team", label: "Our team" },
  { href: "/contact", label: "Visit us" },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobile-nav">
      <button
        className="mobile-menu-button"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      {open && (
        <nav className="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="mobile-menu-cta" onClick={() => setOpen(false)}>
            Get in touch
          </Link>
        </nav>
      )}
    </div>
  );
}
