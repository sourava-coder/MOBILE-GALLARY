export type HomepageSettings = {
  id?: string;
  store_name: string;
  tagline: string;
  hero_title: string;
  hero_description: string;
  cta_primary: string;
  cta_secondary: string;
  currency_code: string;
  enable_promotions: boolean;
  shop_image_url?: string;
  shop_image_alt?: string;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id?: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  condition?: string;
  description?: string;
  image_url?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type RepairService = {
  id?: string;
  name: string;
  price: number;
  duration?: string;
  description?: string;
  featured?: boolean;
  image_url?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
};

export type Member = {
  id?: string;
  name: string;
  role: string;
  bio?: string;
  image_url?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ContactDetails = {
  id?: string;
  phone?: string;
  email?: string;
  address?: string;
  whatsapp?: string;
  opening_hours?: string;
  map_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  shop_image_url?: string;
  shop_image_alt?: string;
  created_at?: string;
  updated_at?: string;
};

export type ShopPhoto = {
  id?: string;
  page: "home" | "visit";
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at?: string;
};

export type LegalPage = {
  id?: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

export type AdminResource =
  | "homepage_settings"
  | "products"
  | "repair_services"
  | "members"
  | "contact_details"
  | "shop_gallery"
  | "privacy_policies"
  | "terms";

export type AdminRecord =
  | HomepageSettings
  | Product
  | RepairService
  | Member
  | ContactDetails
  | ShopPhoto
  | LegalPage;
