import { NextApiRequest, NextApiResponse } from "next";

import Stripe from "stripe";
import { formatAmountForStripe } from "@utils/stripe-helpers";
import { Cart, Order } from "@framework/types";
import { buildBlueprints } from "@ssr/builders/build-blueprint";
import {
  buildAdditionalPrintAreaCost,
  buildBasePrice,
} from "@ssr/builders/build-product";
import { Blueprint } from "@models/product";
import { generateNanoId } from "src/framework/utils";
import { getUniqueOrderId } from "src/framework/dao/order-dao";

const CURRENCY = "usd";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2020-08-27",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const cart = req.body.cart as Cart;
    const cancelUrl = req.body.cancelUrl as string;

    try {
      const mapBlueprints = await buildBlueprints(
        cart.items.map((item) => item.blueprintId.toString())
      );

      // Validate cart
      try {
        await validateCart(cart, mapBlueprints);
      } catch (err: any) {
        res.status(400).json({ statusCode: 400, message: err.message });
      }

      const orderId = await getUniqueOrderId();

      const { totalCost: totalShippingCost, itemShippingCosts } =
        calculateShippingCost(cart, mapBlueprints);

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
        buildLineItems(cart, itemShippingCosts);

      // Create Checkout Sessions from body params.
      const params: Stripe.Checkout.SessionCreateParams = {
        submit_type: "pay",
        payment_method_types: ["card"],
        mode: "payment",
        metadata: {
          orderId,
        },
        line_items: lineItems,
        success_url: `${req.headers.origin}/order?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/${cancelUrl || ""}`,
        shipping_address_collection: {
          allowed_countries: ["US"],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: {
                amount: totalShippingCost,
                currency: "usd",
              },
              display_name: "Standard shipping",
              delivery_estimate: {
                minimum: {
                  unit: "business_day",
                  value: calculateShippingDaysMin(cart),
                },
                maximum: {
                  unit: "business_day",
                  value: calculateShippingDaysMax(cart),
                },
              },
            },
          },
        ],
      };

      const checkoutSession: Stripe.Checkout.Session =
        await stripe.checkout.sessions.create(params);

      res.status(200).json(checkoutSession);
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}

async function validateCart(
  cart: Cart,
  mapBlueprints: {
    [id: string]: Blueprint | undefined;
  }
) {
  console.log("validating cart:", cart);
  for (const item of cart.items) {
    const blueprint = mapBlueprints[item.blueprintId];
    const selectedVariant = blueprint?.variants.find(
      (variant) => variant.id === item.selectedVariantId
    );
    if (!selectedVariant) {
      throw new Error(
        `Selected variant: ${item.selectedVariantId} not found for the blueprint: ${item.blueprintId}`
      );
    }

    if (!selectedVariant.selectedProvider) {
      throw new Error(
        `Selected variant: ${item.selectedVariantId} for the blueprint: ${item.blueprintId} does not have any provider`
      );
    }

    let basePrice = buildBasePrice(selectedVariant.selectedProvider?.price);
    let price = basePrice;
    item.printAreas.forEach((printArea) => {
      const selectedPrintArea =
        selectedVariant.selectedProvider?.printAreas.find(
          (p) => p.position === printArea.position
        );
      if (!selectedPrintArea) {
        throw new Error(
          `Print area ${printArea} not found for the blueprint: ${item.blueprintId} variant: ${selectedVariant.id}`
        );
      }
      price += buildAdditionalPrintAreaCost(selectedPrintArea);
    });

    // TODO consider/apply discounts
    if (price !== item.price) {
      throw new Error(
        "Client provided price " +
          item.price +
          " does not match " +
          price +
          " for the selected variant " +
          item.selectedVariantId +
          " for the blueprint: " +
          item.blueprintId
      );
    }
    console.log(
      `validation successful for cart item - selected variant: ${item.selectedVariantId} for the blueprint: ${item.blueprintId}`
    );
  }
}

function buildLineItems(
  cart: Cart,
  itemShippingCosts: {
    [itemId: string]: number;
  }
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return cart.items.map((item) => {
    console.log("line item image:", item.image.thumbnail);
    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
      quantity: item.quantity,
      description:
        "Shipping cost: $" + (itemShippingCosts[item.id] / 100).toFixed(2),
      price_data: {
        currency: CURRENCY,
        product_data: {
          name: item.name,
          images: [item.image.thumbnail],
          metadata: {
            blueprintId: item.blueprintId,
            variantId: item.selectedVariantId,
            shippingCost: (itemShippingCosts[item.id] / 100).toFixed(2),
          },
        },
        unit_amount: formatAmountForStripe(
          item.sale_price ? item.sale_price : item.price || 0,
          CURRENCY
        ),
      },
    };
    return lineItem;
  });
}

/**
- Collect unique providers, under it collect unique product type
- Then for each provider-productType combination, 
    - use the quantity to calculate shipping cost
    - use the first item and additional item cost
*/
function calculateShippingCost(
  cart: Cart,
  mapBlueprints: {
    [id: string]: Blueprint | undefined;
  }
) {
  const itemShippingCosts: {
    [itemId: string]: number;
  } = {};

  let totalCost = 0;
  for (const item of cart.items) {
    const blueprint = mapBlueprints[item.blueprintId];

    const selectedVariant = blueprint?.variants.find(
      (variant) => variant.id === item.selectedVariantId
    );

    if (!selectedVariant) {
      throw new Error(
        `Selected variant: ${item.selectedVariantId} not found for the blueprint: ${item.blueprintId}`
      );
    }

    const shipping = selectedVariant.selectedProvider?.shipping;
    if (!shipping) {
      throw new Error(
        `Shipping information not found for the variant: ${selectedVariant.id} of the blueprint: ${item.blueprintId}`
      );
    }
    const cost =
      shipping.first_item.cost +
      (item.quantity - 1) * shipping.additional_items.cost;
    itemShippingCosts[item.id] = formatAmountForStripe(cost / 100, CURRENCY);
    totalCost += cost;
  }

  return {
    totalCost,
    itemShippingCosts,
  };
}

function calculateShippingDaysMin(cart: Cart): number {
  return 5;
}

function calculateShippingDaysMax(cart: Cart): number {
  return 10;
}
