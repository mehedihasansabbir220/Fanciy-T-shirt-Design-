export interface Shipping {
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
}

export interface PrintArea {
  position: string;
  height: number;
  width: number;
  additionalCost: number;
}

export interface Provider {
  id: number;
  variantId: number;
  name: String;
  price: number;
  printAreas: PrintArea[];
  isAvailableInUs: boolean;
  shipping: Shipping | undefined; // undefined means not available in US
  inStock: boolean;
}

export interface ProductVariant {
  id: number;
  productId: number;
  title: string;
  color: {
    id: number;
    title: string;
    code: string[];
  };
  size: {
    id: number;
    title: string;
  };
  images: string[];
  providers: Provider[];
  selectedProvider: Provider | undefined; // undefined means no provider in US available for this variant
}

export interface Blueprint {
  id: number;
  model: string;
  brand: string;
  title: string;
  type: string;
  images: string[];
  description: string;
  variants: ProductVariant[];
}

export interface ProductCollection {
  type: string;
  products: Blueprint[];
}

export interface Catalog {
  type: string;
  collections: ProductCollection[];
}
