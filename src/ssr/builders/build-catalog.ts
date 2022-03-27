import { Catalog } from "src/models/catalog";
import { buildCatalogCollection } from "./build-catalog-collection";

export async function buildCatalog(
  catalogCollectionId: string,
  catalogSlug: string
): Promise<Catalog | undefined> {
  console.log(
    "buildCatalog for catalogCollectionId:",
    catalogCollectionId,
    "catalogSlug",
    catalogSlug
  );
  const catalogCollection = await buildCatalogCollection(catalogCollectionId);
  const catalog = catalogCollection.catalogs.find(
    (catalog) => catalog.slug === catalogSlug
  );

  console.log("catalog built, with blueprints:", catalog?.blueprints?.length);

  return catalog;
}
