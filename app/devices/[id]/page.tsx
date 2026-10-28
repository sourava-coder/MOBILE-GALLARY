import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ShieldCheck, Smartphone } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteLayout } from "@/components/site-layout";
import { VisitCta } from "@/components/public-sections";
import { getPublicData } from "@/lib/public-data";
import { price } from "@/lib/formatters";

export const dynamic = "force-static";

export default async function DeviceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { settings, contact, products } = await getPublicData();
  const product = products.find((item) => item.id === id);
  if (!product) notFound();

  const hasDiscount = Number(product.original_price) > Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)
    : 0;
  const details = [
    ["Brand", product.brand],
    ["Model number", product.model_number],
    ["Storage", product.storage],
    ["RAM", product.ram],
    ["Color", product.color],
    ["Condition", product.condition],
    ["Warranty", product.warranty],
    ["Display", product.display],
    ["Processor", product.processor],
    ["Rear camera", product.rear_camera],
    ["Front camera", product.front_camera],
    ["Battery", product.battery],
    ["Operating system", product.operating_system],
    ["Connectivity", product.connectivity],
    ["Dimensions & weight", product.dimensions_weight],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const textSections = [
    ["Highlights", product.highlights],
    ["Box contents", product.box_contents],
    ["Return policy", product.return_policy],
    ["Full specifications", product.specifications],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const inquiryHref = contact.phone
    ? `tel:${contact.phone.replace(/[^\d+]/g, "")}`
    : contact.email
      ? `mailto:${contact.email}?subject=${encodeURIComponent(`Question about ${product.name}`)}`
      : contact.whatsapp
        ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, I want to know more about ${product.name}.`)}`
        : `/contact?device=${encodeURIComponent(product.name)}`;

  return (
    <SiteLayout settings={settings} contact={contact}>
      <main className="subpage page-width device-detail-page">
        <Link className="back-link" href="/devices"><ArrowLeft size={16} /> Back to devices</Link>
        <section className="device-detail clay-card">
          <div className="device-detail-image">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_url} alt={product.name} />
            ) : <Smartphone size={80} />}
          </div>
          <div className="device-detail-copy">
            <p className="section-label">{product.category || "Mobile device"}</p>
            <h1>{product.name}</h1>
            <div className="device-price-row">
              <strong>{price(product.price, settings.currency_code)}</strong>
              {hasDiscount && <del>{price(product.original_price ?? 0, settings.currency_code)}</del>}
            </div>
            {hasDiscount && <span className="discount-badge">{discountPercent}% off</span>}
            {product.discount_offer && <span className="offer-label">{product.discount_offer}</span>}
            <span className={`availability-badge availability-${product.availability ?? "available"}`}>
              {product.availability === "unavailable" ? "Not available" : product.availability === "coming_soon" ? "Coming soon" : "Available"}
            </span>
            {product.description && <p className="device-description">{product.description}</p>}
            <div className="device-detail-actions">
              <a
                className="button button-dark"
                href={inquiryHref}
                target={inquiryHref.startsWith("http") ? "_blank" : undefined}
                rel={inquiryHref.startsWith("http") ? "noreferrer" : undefined}
              >
                Ask about this device <ArrowUpRight size={17} />
              </a>
              <span className="detail-note"><ShieldCheck size={16} /> Confirm availability before visiting</span>
            </div>
          </div>
        </section>
        {(details.length > 0 || textSections.length > 0) && (
          <section className="device-info-grid">
            {details.length > 0 && (
              <div className="device-info-card clay-card">
                <p className="section-label">Device details</p>
                <h2>What you need to know</h2>
                <dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
              </div>
            )}
            {textSections.map(([title, content]) => (
              <div className="device-info-card clay-card" key={title}>
                <p className="section-label">{title === "Highlights" ? "Why this device" : "More information"}</p>
                <h2>{title}</h2>
                <div className="specifications"><CheckCircle2 size={17} /><p>{content}</p></div>
              </div>
            ))}
          </section>
        )}
        <VisitCta />
      </main>
    </SiteLayout>
  );
}
