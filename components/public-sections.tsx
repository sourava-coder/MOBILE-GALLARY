import Link from "next/link";
import { ArrowUpRight, BatteryCharging, Clock3, MapPin, Smartphone, Wrench } from "lucide-react";
import type { ContactDetails, HomepageSettings, Member, Product, RepairService, ShopPhoto } from "@/lib/types";
import ShopGallerySlider from "@/components/shop-gallery-slider";

export function PageIntro({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro page-width">
      <p className="section-label">{label}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function price(value: number, currency: string) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function availabilityLabel(status?: Product["availability"]) {
  if (status === "unavailable") return "Not available";
  if (status === "coming_soon") return "Coming soon";
  return "Available";
}

function serviceIcon(icon?: string) {
  switch (icon?.trim().toLowerCase()) {
    case "phone":
    case "smartphone":
      return <Smartphone size={21} />;
    case "battery":
    case "batterycharging":
      return <BatteryCharging size={21} />;
    case "wrench":
    case "repair":
      return <Wrench size={21} />;
    default:
      return icon ? <span>{icon.slice(0, 2).toUpperCase()}</span> : <Wrench size={21} />;
  }
}

export function RepairServices({
  services,
  settings,
}: {
  services: RepairService[];
  settings: HomepageSettings;
}) {
  return services.length ? (
    <div className="service-grid">
      {services.map((service) => (
        <article className="service-card clay-card" key={service.id ?? service.name}>
          <div className="service-symbol">{serviceIcon(service.icon)}</div>
          <div className="service-info">
            <div className="service-topline">
              <h3>{service.name}</h3>
              {service.featured && <span className="featured-tag">Featured</span>}
              {service.price > 0 && <span>{price(service.price, settings.currency_code)}</span>}
            </div>
            <p>{service.description}</p>
            {service.duration && <small>{service.duration}</small>}
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="empty-public">Our repair menu is being refreshed. Contact the team for current service options.</div>
  );
}

export function ProductCatalog({
  products,
  settings,
}: {
  products: Product[];
  settings: HomepageSettings;
}) {
  return products.length ? (
    <div className="product-grid">
      {products.map((product) => (
        <article className="product-card clay-card" key={product.id ?? product.name}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="product-image" src={product.image_url} alt={product.name} />
          ) : <div className="product-placeholder"><Smartphone size={38} /></div>}
          <div className="product-content">
            <div className="product-topline">
              <span>{product.brand || product.category || "Mobile"}{product.featured && <span className="featured-tag">Featured</span>}</span>
              {product.price > 0 && <strong>{price(product.price, settings.currency_code)}</strong>}
            </div>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span className={`availability-badge availability-${product.availability ?? "available"}`}>
              {availabilityLabel(product.availability)}
            </span>
            {product.condition && <span className="condition-tag">{product.condition}</span>}
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="empty-public">Our current selection is available in store. Stop by or get in touch to find the right device for you.</div>
  );
}

export function TeamRoster({ members }: { members: Member[] }) {
  return members.length ? (
    <div className="member-grid">
      {members.map((member) => (
        <article className="member-card clay-card" key={member.id ?? member.name}>
          {member.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.image_url} alt={member.name} />
          ) : <div className="member-avatar">{member.name.slice(0, 1)}</div>}
          <h3>{member.name}</h3>
          <span>{member.role}{member.featured && " · Featured"}</span>
          <p>{member.bio}</p>
        </article>
      ))}
    </div>
  ) : (
    <div className="empty-public">Our team details are being updated. Please check back soon.</div>
  );
}

export function ContactDetailsPanel({ contact, gallery = [] }: { contact: ContactDetails; gallery?: ShopPhoto[] }) {
  const hasDetails = Boolean(
    contact.address || contact.phone || contact.email || contact.opening_hours ||
    contact.whatsapp || contact.map_url,
  );
  const mapEmbedUrl = contact.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`
    : contact.map_url?.includes("google.") ? contact.map_url : null;

  return (
    <section className="contact-section contact-page-panel">
      <div className="contact-copy">
        <p className="section-label">Drop us a line or drop by</p>
        <h2>Let’s get your tech sorted.</h2>
        <p>Have a question about a repair or looking for something specific? We’d love to help.</p>
        {(contact.phone || contact.email) && (
          <a className="button button-light" href={contact.phone ? `tel:${contact.phone.replace(/[^\d+]/g, "")}` : `mailto:${contact.email}`}>
            Contact Mobile Gallary <ArrowUpRight size={17} />
          </a>
        )}
      </div>
      <div className="contact-side">
        {gallery.length > 0 && <div className="contact-shop-gallery"><ShopGallerySlider photos={gallery} caption="Visit us at Mobile Gallary" /></div>}
        <div className="contact-details">
          {contact.address && <div><MapPin size={18} /><span><small>Find us</small><strong>{contact.address}</strong></span></div>}
          {contact.phone && <div><Smartphone size={18} /><span><small>Call us</small><a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}>{contact.phone}</a></span></div>}
          {contact.email && <div><ArrowUpRight size={18} /><span><small>Email</small><a href={`mailto:${contact.email}`}>{contact.email}</a></span></div>}
          {contact.opening_hours && <div><Clock3 size={18} /><span><small>Opening hours</small><strong>{contact.opening_hours}</strong></span></div>}
          {contact.whatsapp && <div><Smartphone size={18} /><span><small>WhatsApp</small><a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}>{contact.whatsapp}</a></span></div>}
          {contact.map_url && <div><MapPin size={18} /><span><small>Directions</small><a href={contact.map_url} target="_blank" rel="noreferrer">Open map</a></span></div>}
          {!hasDetails && <p className="contact-empty">Contact information is being updated. Please check back soon.</p>}
        </div>
        {mapEmbedUrl && (
          <div className="map-frame">
            <iframe
              title="Mobile Gallary location on Google Maps"
              src={mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </section>
  );
}

export function VisitCta() {
  return (
    <section className="visit-cta clay-card">
      <div><p className="section-label">Need a hand?</p><h2>We’re happy to help.</h2></div>
      <Link className="button button-dark" href="/contact">Get in touch <ArrowUpRight size={16} /></Link>
    </section>
  );
}
