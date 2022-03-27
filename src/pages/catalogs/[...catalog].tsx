import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import Subscription from "@components/common/subscription";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import CatalogBanner from "@containers/catalog-banner";
import { BlueprintGrid } from "@components/blueprints/blueprint-grid";
import { Blueprint } from "@models/product";
import { CatalogCollectionName } from "@models/enums/catalog-collection-name";
import { buildCatalogCollection } from "@ssr/builders/build-catalog-collection";
import { ParsedUrlQuery } from "querystring";
import { buildCatalog } from "@ssr/builders/build-catalog";
import { buildBlueprint } from "@ssr/builders/build-blueprint";
import { buildProductsFromBlueprints } from "@ssr/builders/build-product";
import { Product } from "@framework/types";

export default function Catalog({
  products,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <div className="border-t-2 border-borderBottom">
      <Container>
        <CatalogBanner />
        <div className="pb-16 lg:pb-20">
          <BlueprintGrid className="3xl:grid-cols-6" products={products} />
        </div>
        <Subscription />
      </Container>
    </div>
  );
}

Catalog.Layout = Layout;

export const getStaticProps = async (props: any) => {
  const { locale, params } = props;
  const catalog = params?.catalog;
  const [catalogCollectionId, catalogSlug] = catalog as string[];
  console.log(
    "catalogCollectionId:",
    catalogCollectionId,
    "catalogSlug:",
    catalogSlug
  );

  const catalogData = await buildCatalog(catalogCollectionId, catalogSlug);
  const blueprints = catalogData?.blueprints || [];
  console.log("blueprints:", blueprints);

  const blueprintProducts: Blueprint[] = [];
  for (const blueprint of blueprints) {
    const blueprintProduct = await buildBlueprint(blueprint);
    if (blueprintProduct) {
      blueprintProducts.push(blueprintProduct);
    }
  }

  const products = await buildProductsFromBlueprints(blueprintProducts);

  return {
    props: {
      products: products as Product[],
      ...(await serverSideTranslations(locale!, [
        "common",
        "forms",
        "menu",
        "footer",
      ])),
    },
  };
};

export const getStaticPaths: GetStaticPaths = async ({ locales = [] }) => {
  // construct props for all the catalogs that we want to pre-render
  const catalogCollectionsToPrerender = [CatalogCollectionName.DesignYourOwn];

  const paths: {
    params: ParsedUrlQuery;
    locale?: string | undefined;
  }[] = [];

  for (const catalogCollectionName of catalogCollectionsToPrerender) {
    const catalogCollection = await buildCatalogCollection(
      catalogCollectionName
    );

    for (const catalog of catalogCollection.catalogs) {
      for (const locale of locales) {
        paths.push({
          params: { catalog: [catalogCollection.id, catalog.slug] },
          locale,
        });
      }
    }
  }

  return {
    paths: [...paths],
    fallback: true,
  };
};
