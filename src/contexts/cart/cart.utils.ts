import { Product } from "@framework/types";

export type CartItem = Product & {
  quantity?: number;
  discountCodes: string[];
  itemTotal?: number;
  selectedVariantId: number;
  blueprintId: number;
  printAreas: {
    position: string;
    image: string;
  }[];
};

export interface UpdateItemInput extends Partial<Omit<CartItem, "id">> {}

export function addItemWithQuantity(
  items: CartItem[],
  item: CartItem,
  quantity: number
) {
  if (quantity <= 0)
    throw new Error("cartQuantity can't be zero or less than zero");
  const existingItemIndex = items.findIndex(
    (existingItem) => existingItem.id === item.id
  );

  if (existingItemIndex > -1) {
    const newItems = [...items];
    newItems[existingItemIndex].quantity! += quantity;
    return newItems;
  }
  return [...items, { ...item, quantity }];
}

export function removeItemOrQuantity(
  items: CartItem[],
  id: CartItem["id"],
  quantity: number
) {
  return items.reduce((acc: CartItem[], item) => {
    if (item.id === id) {
      const newQuantity = item.quantity! - quantity;

      return newQuantity > 0
        ? [...acc, { ...item, quantity: newQuantity }]
        : [...acc];
    }
    return [...acc, item];
  }, []);
}
// Simple CRUD for Item
export function addItem(items: CartItem[], item: CartItem) {
  return [...items, item];
}

export function getItem(items: CartItem[], id: CartItem["id"]) {
  return items.find((item) => item.id === id);
}

export function updateItem(
  items: CartItem[],
  id: CartItem["id"],
  item: UpdateItemInput
) {
  return items.map((existingItem) =>
    existingItem.id === id ? { ...existingItem, ...item } : existingItem
  );
}

export function removeItem(items: CartItem[], id: CartItem["id"]) {
  return items.filter((existingItem) => existingItem.id !== id);
}

export const calculateItemTotals = (items: CartItem[]) =>
  items.map((item) => ({
    ...item,
    itemTotal: item.price * item.quantity!,
  }));

export const calculateTotal = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.quantity! * item.price, 0);

export const calculateTotalItems = (items: CartItem[]) =>
  items.reduce((sum, item) => sum + item.quantity!, 0);

export const calculateUniqueItems = (items: CartItem[]) => items.length;
