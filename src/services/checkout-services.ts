import { CartItem } from "@contexts/cart/cart.utils";
import { fetchPostJSON } from "@utils/api-helpers";
import getStripe from "@utils/get-stripejs";

export async function gotoCheckout(items: CartItem[]) {
  // Create a Checkout Session.
  const response = await fetchPostJSON("/api/checkout_sessions", {
    cart: {
      items,
    },
  });

  if (response.statusCode === 500) {
    console.error(response.message);
    return;
  }

  console.log("response of create checkout session:", response);

  // Redirect to Checkout.
  const stripe = await getStripe();
  const { error } = await stripe!.redirectToCheckout({
    // Make the id field from the Checkout Session creation API response
    // available to this file, so you can provide it as parameter here
    // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
    sessionId: response.id,
  });

  return error;
}
