import { Catalog, CatalogCollection } from "src/models/catalog";
import { readJsonFromDataFolder } from "../utils/read-files";

/**
 * Builds the catalog data for the given catalog name
 * @param catalogCollectionId
 * @returns
 */
export async function buildCatalogCollection(catalogCollectionId: string) {
  console.log("getting catalogs for:", catalogCollectionId);
  const catalogsResponse = (await readJsonFromDataFolder(
    `catalog-collections/${catalogCollectionId}.json`
  )) as any;
  const catalogCollection: CatalogCollection =
    (catalogsResponse as CatalogCollection) || {
      id: catalogCollectionId,
      catalogs: [],
    };
  console.log(`#${catalogCollectionId}:`, catalogCollection.catalogs.length);

  return catalogCollection;
}
