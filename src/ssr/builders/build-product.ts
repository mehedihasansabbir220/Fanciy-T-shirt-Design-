import { Product, Variant } from "@framework/types";
import { PrintArea, Blueprint as Blueprint, Provider } from "@models/product";

export async function buildProductsFromBlueprints(blueprints: Blueprint[]) {
  const products: Product[] = blueprints.map((blueprint) => {
    // TODO add prinityfy in the proxy setting so that the images can be loaded
    const image = buildBlueprintImage(blueprint);
    const prices = buildBlueprintPrice(blueprint);

    return {
      id: blueprint.id,
      image: {
        id: 1,
        original: image,
        thumbnail: image,
      },
      name: buildBlueprintTitle(blueprint),
      price: prices?.minPrice,
      quantity: 1,
      slug: blueprint.id + "",
      description: blueprint.description,
      variants: blueprint.variants
        .map((variant) => {
          const selectedProvider = variant.selectedProvider;
          if (!selectedProvider) {
            return undefined;
          }
          if (!selectedProvider.isAvailableInUs) {
            return undefined;
          }
          if (!selectedProvider.shipping) {
            return undefined;
          }
          const v: Variant = {
            id: variant.id,
            color: variant.color,
            size: variant.size,
            price: selectedProvider.price,
            images: variant.images,
            printAreas: selectedProvider.printAreas,
            shipping: selectedProvider.shipping,
            inStock: selectedProvider.inStock,
          };
          return v;
        })
        .filter((variant) => variant != undefined) as Variant[],
    };
  });

  return products;
}

function buildBlueprintTitle(blueprint: Blueprint) {
  const title = `${blueprint.title} - ${blueprint.brand} ${blueprint.model}`;
  return title;
}

function buildBlueprintImage(blueprint: Blueprint) {
  let variant = blueprint.variants.find(
    (variant) => variant.color.title === "White"
  );
  if (!variant) {
    variant = blueprint.variants[0];
  }
  return variant.images[0];
}

export function buildBlueprintPrice(blueprint: Blueprint) {
  let minPrice = Infinity;
  let maxPrice = 0;

  // find the min and max price comparing all the variants
  for (const variant of blueprint.variants) {
    if (!variant.selectedProvider) {
      continue;
    }
    const price = buildVariantPriceByProvider(variant.selectedProvider);
    minPrice = Math.min(minPrice, price.minPrice);
    maxPrice = Math.max(maxPrice, price.maxPrice);
  }

  return { minPrice, maxPrice };
}

export function buildVariantPriceByProvider(provider: Provider) {
  return buildVariantPrice(provider.price, provider.printAreas);
}

export function buildVariantPrice(basePrice: number, printAreas: PrintArea[]) {
  let minPrice = Infinity;
  let maxPrice = 0;
  let price = buildBasePrice(basePrice);
  minPrice = Math.min(minPrice, price);
  maxPrice = Math.max(maxPrice, price);

  printAreas.forEach((printArea) => {
    price += buildAdditionalPrintAreaCost(printArea);
    minPrice = Math.min(minPrice, price);
    maxPrice = Math.max(maxPrice, price);
  });

  return { minPrice, maxPrice };
}

// export function buildVariantPrice(price?: number, printArea?: PrintArea) {
//   const profitAdjustPriceMultiplier = 2;
//   const cost = price;

//   if (!cost || cost <= 0) return 0;

//   const additionalCost = !printArea ? 0 : printArea.additionalCost;

//   const priceBase = cost * profitAdjustPriceMultiplier;
//   const resultPrice = priceBase + additionalCost;

//   const roundedPrice = Math.ceil(resultPrice / 100);

//   return roundedPrice;
// }

export function buildBasePrice(price?: number) {
  const profitAdjustPriceMultiplier = 2;
  const cost = price;

  if (!cost || cost <= 0) return 0;

  const priceBase = cost * profitAdjustPriceMultiplier;
  const resultPrice = priceBase;

  const roundedPrice = Math.ceil(resultPrice / 100);

  return roundedPrice;
}

export function buildAdditionalPrintAreaCost(printArea: PrintArea) {
  const profitAdjustPriceMultiplier = 1.3;
  const cost = printArea.additionalCost;

  if (!cost || cost <= 0) return 0;

  const priceBase = cost * profitAdjustPriceMultiplier;
  const resultPrice = priceBase;

  const roundedPrice = Math.ceil(resultPrice / 100);

  return roundedPrice;
}
