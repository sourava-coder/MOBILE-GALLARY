import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-config";

const publicRoutes = [
  "",
  "/devices",
  "/repairs",
  "/team",
  "/contact",
  "/privacy-policy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route, index) => ({
    url: new URL(route, siteUrl).toString(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
