import type { ContactDetails, HomepageSettings, LegalPage, Member, Product, RepairService } from "@/lib/types";

export const fallbackHomepageSettings: HomepageSettings = {
  store_name: "Mobile Gallary",
  tagline: "Mobile care, made simple.",
  hero_title: "Your phone deserves better care.",
  hero_description:
    "Discover trusted mobile devices, thoughtful accessories, and expert repairs from your neighborhood phone specialists.",
  cta_primary: "Talk to our team",
  cta_secondary: "Explore services",
  currency_code: "INR",
  enable_promotions: true,
};

export const fallbackProducts: Product[] = [];

export const fallbackServices: RepairService[] = [];

export const fallbackMembers: Member[] = [];

export const fallbackContactDetails: ContactDetails = {
  phone: "",
  email: "",
  address: "",
  whatsapp: "",
  opening_hours: "",
  map_url: "",
  instagram_url: "",
  facebook_url: "",
};

export const fallbackPrivacyPolicy: LegalPage = {
  title: "Privacy Policy",
  content: "Add your store's privacy policy from the admin dashboard.",
};

export const fallbackTerms: LegalPage = {
  title: "Terms and Conditions",
  content: "Add your store's terms and conditions from the admin dashboard.",
};
