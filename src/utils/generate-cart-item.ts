import { CartItem } from "@contexts/cart/cart.utils";
import { Product } from "@framework/types";

export interface GenerateCartItemParams {
  product: Product;
  discountCodes: string[];
}

export function generateCartItem({
  product,
  discountCodes,
}: GenerateCartItemParams): CartItem {
  return {
    ...product,
    discountCodes,
    blueprintId: product.id,
    printAreas: [
      {
        image: product.image.original,
        position: "front",
      },
    ],
    selectedVariantId: 1,
  };
}
