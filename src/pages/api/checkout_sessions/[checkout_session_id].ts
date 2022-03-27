import { Order, OrderItem } from "@framework/types";
import { isObject } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import {
  getOrderById,
  getUniqueOrderId,
  putOrder,
} from "src/framework/dao/order-dao";
import { generateNanoId } from "src/framework/utils";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // https://github.com/stripe/stripe-node#configuration
  apiVersion: "2020-08-27",
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const checkoutSessionId: string = req.query.checkout_session_id as string;
  //   try {
  if (!checkoutSessionId.startsWith("cs_")) {
    throw Error("Incorrect CheckoutSession ID.");
  }
  const checkout_session: Stripe.Checkout.Session =
    await stripe.checkout.sessions.retrieve(checkoutSessionId, {
      expand: ["payment_intent"],
    });

  const lineItems = await stripe.checkout.sessions.listLineItems(
    checkoutSessionId,
    {
      expand: ["data.price.product"],
    }
  );

  let order: Order | undefined;
  let orderId = checkout_session.metadata?.orderId;

  if (!orderId) {
    console.log("Order ID should not be null!");
    orderId = await getUniqueOrderId();
  } else {
    // check and load existing order
    order = await getOrderById(orderId);
  }

  // no existing order, so create one
  if (!order) {
    console.log("[checkout_session_Id] no existing order, so creating one");
    order = {
      id: orderId,
      checkoutSessionId: checkoutSessionId,
      paymentProcessor: "stripe",
      paymentStatus: checkout_session.payment_status,
      total: (checkout_session.amount_total || 0) / 100,
      shipping_fee:
        (checkout_session.total_details?.amount_shipping || 0) / 100,
      paymentType: checkout_session.payment_method_types[0],
      customer: {
        email: checkout_session.customer_details?.email || "",
        id: isObject(checkout_session.customer)
          ? checkout_session.customer.id || ""
          : checkout_session.customer || "",
      },
      products: lineItems.data.map((lineItem) => {
        const product = lineItem.price?.product as Stripe.Product;
        const orderItem: OrderItem = {
          id: lineItem.id,
          name: product.name,
          price: lineItem.amount_total / 100,
          quantity: lineItem.quantity || 0,
          description: lineItem.description,
          images: product.images,
          shippingCost: product.metadata.shippingCost,
          blueprintId: product.metadata.blueprintId,
          variantId: product.metadata.variantId,
        };
        return orderItem;
      }),
      shipping: {
        name: checkout_session.shipping?.name,
        address: checkout_session.shipping?.address && {
          city: checkout_session.shipping?.address?.city,
          country: checkout_session.shipping?.address?.country,
          line1: checkout_session.shipping?.address?.line1,
          line2: checkout_session.shipping?.address?.line2,
          postal_code: checkout_session.shipping?.address?.postal_code,
          state: checkout_session.shipping?.address?.state,
        },
      },
      timestamp: new Date().toISOString(),
    };

    await putOrder(order);
  }

  res.status(200).json({ checkout_session, lineItems, order });
}
