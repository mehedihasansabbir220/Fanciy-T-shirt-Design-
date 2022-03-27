export interface BlueprintPrintify {
  id: number;
  title: string;
  brand: string;
  model: string;
  images: string[];
  description: string;
}

export interface PrintProviderPrintify {
  id: number;
  title: string;
  location: {
    address1: string;
    address2: string;
    city: string;
    country: string;
    region: string;
    zip: string;
  };
}

export interface VariantPrintify {
  id: number;
  title: string;
  options: {
    color: string;
    size: string;
  };
  placeholders: PlaceholderPrintify[];
}

export interface VariantOptions {
  color: string;
  size: string;
}

export interface PlaceholderPrintify {
  position: string;
  height: number;
  width: number;
}

export interface ProviderShippingPrintify {
  handling_time: {
    value: number;
    unit: string;
  };
  profiles: {
    variant_ids: number[];
    first_item: {
      cost: number;
      currency: string;
    };
    additional_items: {
      cost: number;
      currency: string;
    };
    countries: string[];
  }[];
}

export interface VariantProductInfo {
  id: number;
  sku: string;
  cost: number;
  price: number;
  title: string;
  grams: number;
  is_enabled: false;
  is_default: false;
  is_available: true;
  options: [number, number];
  quantity: number;
}

export interface ProductPrintify {
  id: number;
  title: string;
  description: string;
  tags: string[];
  options: {
    name: string;
    type: string;
    values: {
      id: number;
      title: string;
      colors?: string[];
    }[];
  }[];
  variants: VariantProductInfo[];
  images: {
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_locked: boolean;
  blueprint_id: number;
  user_id: number;
  shop_id: number;
  print_provider_id: number;
  print_areas: [
    {
      variant_ids: number[];
      placeholders: {
        position: string;
        images: {
          id: string;
          name: string;
          type: string;
          height: number;
          width: number;
          x: number;
          y: number;
          scale: number;
          angle: number;
        }[];
      }[];
      font_color: string;
      font_family: string;
    }
  ];
  print_details: [];
  sales_channel_properties: [];
}
