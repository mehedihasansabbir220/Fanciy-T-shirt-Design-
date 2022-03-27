import Container from "@components/ui/container";
import Layout from "@components/layout/layout-designstudio";
import Divider from "@components/ui/divider";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticPaths, InferGetStaticPropsType } from "next";
import { buildBlueprint } from "@ssr/builders/build-blueprint";
import {
  buildProductsFromBlueprints,
  buildVariantPrice,
} from "@ssr/builders/build-product";
import { Product } from "@framework/types";
import { CatalogCollectionName } from "@models/enums/catalog-collection-name";
import { buildCatalogCollection } from "@ssr/builders/build-catalog-collection";
import { ParsedUrlQuery } from "querystring";
import Button from "@components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@contexts/cart/cart.context";
import { toast } from "react-toastify";
import { useWindowSize } from "@utils/use-window-size";
import { CartItem } from "@contexts/cart/cart.utils";
import HeaderDesignStudio from "@components/layout/header/header-design-studio";
import {
  saveProductDesign,
  selectProductVariantToDesign,
} from "src/framework/designer";

export default function ProductPage({
  product,
  selectedVaraint: selectedVaraintFromProp,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (!product) {
    return <></>;
  }

  const [addToCartLoader, setAddToCartLoader] = useState<boolean>(false);
  const { addItemToCart } = useCart();
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const [selectedVariant, setSelectedVariant] = useState(
    selectedVaraintFromProp || product.variants[0]
  );

  console.log(
    "selected variant:",
    selectedVariant,
    "selectedVaraintFromProp",
    selectedVaraintFromProp
  );

  const addToCart = (
    productKey: string,
    productImageUrls: { printArea: string; url: string }[]
  ) => {
    if (!product) {
      return;
    }

    // to show btn feedback while product carting
    // setAddToCartLoader(true);
    // setTimeout(() => {
    //   setAddToCartLoader(false);
    // }, 600);

    // const variantIndex = Math.floor(Math.random() * product.variants.length);
    // const selectedVariant = product.variants[variantIndex];
    // console.log(`Variant index: ${variantIndex}, variant:`, selectedVariant);

    const cartItem: CartItem = {
      ...product,
      name: `${product.name} - ${selectedVariant.color.title}`,
      image: {
        id: `${selectedVariant.id}_image`,
        original: productImageUrls[0].url,
        thumbnail: productImageUrls[0].url,
      },
      discountCodes: [],
      printAreas: productImageUrls.map((url) => ({
        image: url.url,
        position: url.printArea,
      })),
      id: selectedVariant.id,
      selectedVariantId: selectedVariant.id,
      blueprintId: product.id,
      price: buildVariantPrice(selectedVariant.price, [
        selectedVariant.printAreas[0],
        selectedVariant.printAreas[1], // TODO check if design exists for this print area
      ]).maxPrice,
    };
    addItemToCart(cartItem, 1);

    toast("Added to the cart", {
      progressClassName: "fancy-progress-bar",
      position: windowWidth > 768 ? "bottom-right" : "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const onClickNext = async () => {
    const saveResult = await saveProductDesign();
    setProductDataUrl(saveResult.urlProductImage[0].url);
    addToCart(saveResult.productKey, saveResult.urlProductImage);
    console.log("saveResult:", saveResult);
  };

  const onClickProduct = () => {
    selectProductVariantToDesign(selectedVariant);
  };

  useEffect(() => {
    selectProductVariantToDesign(selectedVariant);
  }, [selectedVariant]);

  const [productDataUrl, setProductDataUrl] = useState<string>();

  return (
    <>
      <HeaderDesignStudio
        onClickProduct={onClickProduct}
        onClickNext={onClickNext}
      />
      <main
        className="relative flex-grow flex flex-col"
        style={{
          minHeight: "-webkit-fill-available",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Divider className="mb-0" />
        {productDataUrl && (
          <img
            style={{ objectFit: "contain" }}
            src={productDataUrl}
            alt="product preview"
          />
        )}

        <div className="flex flex-grow flex-col">
          <iframe
            id="designstudiostatic"
            src="/designstudiostatic/index.html"
            width="100%"
            className="flex-grow"
          />
        </div>
      </main>
    </>
  );
}

ProductPage.Layout = Layout;

export const getStaticProps = async (props: any) => {
  const { locale, params } = props;
  const [blueprintId, variantId] = params?.designstudio;

  const blueprint = await buildBlueprint(blueprintId);

  let product: Product | undefined = undefined;
  if (blueprint) {
    let products = await buildProductsFromBlueprints([blueprint]);
    if (products.length > 0) {
      product = products[0];
    }
  }

  let selectedVaraint = product?.variants.find(
    (v) => v.id.toString() === variantId
  );

  if (!selectedVaraint) {
    selectedVaraint = product?.variants[0];
  }

  return {
    props: {
      product,
      selectedVaraint,
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
      for (const blueprintId of catalog.blueprints || []) {
        const blueprint = await buildBlueprint(blueprintId);
        if (!blueprint) {
          continue;
        }

        for (const variant of blueprint?.variants) {
          for (const locale of locales) {
            paths.push({
              params: {
                designstudio: [blueprintId.toString(), variant.id.toString()],
              },
              locale,
            });
          }
        }
      }
    }
  }

  return {
    paths: [...paths],
    fallback: true,
  };
};
