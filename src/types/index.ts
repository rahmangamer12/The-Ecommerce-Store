/** Shared domain types for the whole store. */

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string; // lucide icon name (resolved in UI)
  productCount?: number;
};

export type ProductVariantOption = {
  name: string; // e.g. "Color", "Size"
  values: string[];
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number; // 1..5
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string;
  categorySlug: string;
  price: number;
  compareAtPrice?: number; // original price for showing discounts
  currency: string;
  shortDescription: string;
  description: string;
  features: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: "New" | "Bestseller" | "Limited" | "Sale" | "Editor's Pick";
  variants?: ProductVariantOption[];
  tags: string[];
  featured?: boolean;
  trending?: boolean;
  // Per-product SEO overrides (optional)
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: Record<string, string>;
  maxStock: number;
};

export type WishlistItem = {
  productId: string;
  slug: string;
};

export type Coupon = {
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minSubtotal?: number;
  description: string;
  active: boolean;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "purchased"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type Address = {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault?: boolean;
};

export type Order = {
  id: string;
  number: string;
  date: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  address: Omit<Address, "id" | "label" | "isDefault">;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  category: string;
  tags: string[];
  author: { name: string; role: string; avatar: string };
  date: string;
  content: string; // markdown-ish (rendered simply)
  featured?: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
};
