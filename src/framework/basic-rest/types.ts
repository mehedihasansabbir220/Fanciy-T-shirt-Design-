import { CartItem } from "@contexts/cart/cart.utils";
import { QueryKey } from "react-query";

export type CollectionsQueryOptionsType = {
  text?: string;
  collection?: string;
  status?: string;
  limit?: number;
};

export type CategoriesQueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};
export type ProductsQueryOptionsType = {
  type: string;
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};
export type QueryOptionsType = {
  text?: string;
  category?: string;
  status?: string;
  limit?: number;
};

export type ShopsQueryOptionsType = {
  text?: string;
  shop?: Shop;
  status?: string;
  limit?: number;
};

export type QueryParamsType = {
  queryKey: QueryKey;
  pageParam?: string;
};
export type Attachment = {
  id: string | number;
  thumbnail: string;
  original: string;
};
export type Category = {
  id: number | string;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  products?: Product[];
  productCount?: number;
};
export type Collection = {
  id: number | string;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  products?: Product[];
  productCount?: number;
};
export type Brand = {
  id: number | string;
  name: string;
  slug: string;
  image?: Attachment;
  background_image?: any;
  [key: string]: unknown;
};
export type Tag = {
  id: string | number;
  name: string;
  slug: string;
};
export type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  sale_price?: number;
  image: Attachment;
  sku?: string;
  gallery?: Attachment[];
  category?: Category;
  tag?: Tag[];
  meta?: any[];
  description?: string;
  variations?: object;
  [key: string]: unknown;
  variants: Variant[];
};
export type Variant = {
  id: number;
  color: Color;
  size: Size;
  price: number;
  images: string[];
  printAreas: PrintArea[];
  shipping: Shipping;
  inStock: boolean;
};
export type Size = {
  id: number;
  title: string;
};
export type Color = {
  id: number;
  title: string;
  code: string[];
};
export type Shipping = {
  handling_time: {
    value: number;
    unit: string;
  };
  first_item: {
    cost: number;
    currency: string;
  };
  additional_items: {
    cost: number;
    currency: string;
  };
};
export type PrintArea = {
  position: string;
  height: number;
  width: number;
  additionalCost: number;
};
export type OrderItem = {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  images: string[];
  shippingCost: string;
  blueprintId: string;
  variantId: string;
};
export type Order = {
  id: string;
  checkoutSessionId: string;
  products: OrderItem[];
  total: number;
  customer: {
    id: string;
    email: string;
  };
  shipping_fee: number;
  paymentType: string;
  paymentStatus: string;
  paymentProcessor: string;
  timestamp: string;
  shipping?: {
    name?: string | null;
    address?: {
      city?: string | null;
      country?: string | null;
      line1?: string | null;
      line2?: string | null;
      postal_code?: string | null;
      state?: string | null;
    };
  };
};

export type Shop = {
  id: string | number;
  owner_id: string | number;
  owner_name: string;
  address: string;
  phone: string;
  website: string;
  ratings: string;
  name: string;
  slug: string;
  description: string;
  cover_image: Attachment;
  logo: Attachment;
  socialShare: any;
  created_at: string;
  updated_at: string;
};

export type Cart = {
  items: CartItem[];
};
