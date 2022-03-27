import { Blueprint } from "@models/product";
import { readJsonFromDataFolder } from "../utils/read-files";

/**
 * Builds the blueprint data for the given blueprint Id
 * @param blueprintId
 * @returns Blueprint
 */
export async function buildBlueprint(blueprintId: string) {
  console.log("getting blueprint product for:", blueprintId);
  const blueprintProduct = (await readJsonFromDataFolder(
    `blueprints/${blueprintId}/product.json`
  )) as any;

  return blueprintProduct as Blueprint | undefined;
}

/**
 * Builds a dictionary of blueprints
 * @param blueprintIds
 * @returns
 */
export async function buildBlueprints(blueprintIds: string[]) {
  const blueprintMap: { [id: string]: Blueprint | undefined } = {};
  for (const blueprintId of blueprintIds) {
    blueprintMap[blueprintId] = await buildBlueprint(blueprintId);
  }
  return blueprintMap;
}
