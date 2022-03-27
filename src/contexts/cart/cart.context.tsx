import React from "react";
import { cartReducer, State, initialState } from "./cart.reducer";
import { CartItem, getItem } from "./cart.utils";
import { useLocalStorage } from "@utils/use-local-storage";
interface CartProviderState extends State {
  addItemToCart: (item: CartItem, quantity: number) => void;
  removeItemFromCart: (id: CartItem["id"]) => void;
  // updateItem: (id: Item["id"], payload: object) => void;
  // updateItemQuantity: (id: Item["id"], quantity: number) => void;
  clearItemFromCart: (id: CartItem["id"]) => void;
  getItemFromCart: (id: CartItem["id"]) => any | undefined;
  isInCart: (id: CartItem["id"]) => boolean;
  // updateCartMetadata: (metadata: Metadata) => void;
}
export const cartContext = React.createContext<CartProviderState | undefined>(
  undefined
);

cartContext.displayName = "CartContext";

export const useCart = () => {
  const context = React.useContext(cartContext);
  if (context === undefined) {
    throw new Error(`useCart must be used within a CartProvider`);
  }
  return context;
};

export const CartProvider: React.FC = (props) => {
  const [savedCart, saveCart] = useLocalStorage(
    `chawkbazar-cart`,
    JSON.stringify(initialState)
  );
  const [state, dispatch] = React.useReducer(
    cartReducer,
    JSON.parse(savedCart!)
  );

  React.useEffect(() => {
    saveCart(JSON.stringify(state));
  }, [state, saveCart]);

  const addItemToCart = (item: CartItem, quantity: number) =>
    dispatch({ type: "ADD_ITEM_WITH_QUANTITY", item, quantity });
  const removeItemFromCart = (id: CartItem["id"]) =>
    dispatch({ type: "REMOVE_ITEM_OR_QUANTITY", id });
  const clearItemFromCart = (id: CartItem["id"]) =>
    dispatch({ type: "REMOVE_ITEM", id });
  const isInCart = (id: CartItem["id"]) => !!getItem(state.items, id);
  const getItemFromCart = (id: CartItem["id"]) => getItem(state.items, id);
  // const inStock=()=>{}
  const value = React.useMemo(
    () => ({
      ...state,
      addItemToCart,
      removeItemFromCart,
      clearItemFromCart,
      getItemFromCart,
      isInCart,
    }),
    [state]
  );
  return <cartContext.Provider value={value} {...props} />;
};
