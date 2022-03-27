import { customAlphabet } from "nanoid/async";
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  16
);

export async function generateNanoId() {
  return await nanoid();
}
