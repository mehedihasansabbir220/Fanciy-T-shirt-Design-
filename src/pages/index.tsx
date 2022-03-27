import BannerCard from "@components/common/banner-card";
import Container from "@components/ui/container";
import Layout from "@components/layout/layout";
import BannerWithProducts from "@containers/banner-with-products";
import BannerBlock from "@containers/banner-block";
import Divider from "@components/ui/divider";
import ProductsFeatured from "@containers/products-featured";
import NewArrivalsProductFeed from "@components/product/feeds/new-arrivals-product-feed";
import { homeThreeBanner as banner } from "@framework/static/banner";
import { homeThreeMasonryBanner as masonryBanner } from "@framework/static/banner";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ROUTES } from "@utils/routes";
import { GetStaticPaths, InferGetStaticPropsType } from "next";
import CatalogBlock from "@containers/catalog-block";
import { buildCatalogCollection } from "@ssr/builders/build-catalog-collection";
import { CatalogCollectionName } from "@models/enums/catalog-collection-name";

export default function Home({
  catalogDesignYourOwn,
  catalogDesignTemplates,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <BannerBlock data={masonryBanner} />
      {/* <Container>
        <ProductsFlashSaleBlock date={"2023-03-01T01:02:03"} />
      </Container>
      <BannerSliderBlock /> */}
      <Container>
        <CatalogBlock
          catalogCollection={catalogDesignYourOwn}
          sectionHeaderText="text-design-your-own-catalogs"
        />
        <ProductsFeatured sectionHeading="text-featured-products" limit={5} />
        <CatalogBlock
          catalogCollection={catalogDesignTemplates}
          sectionHeaderText="text-design-templates-catalogs"
        />
        {/* <CategoryBlock sectionHeading="text-shop-by-category" type="rounded" /> */}

        {/* <BannerCard
          key={`banner--key${banner[0].id}`}
          banner={banner[0]}
          href={`${ROUTES.COLLECTIONS}/${banner[0].slug}`}
          className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0"
        /> */}
        {/* <BrandGridBlock sectionHeading="text-top-brands" /> */}
        <BannerCard
          key={`banner--key${banner[1].id}`}
          banner={banner[1]}
          href={`${ROUTES.COLLECTIONS}/${banner[1].slug}`}
          className="mb-12 lg:mb-14 xl:mb-16 pb-0.5 lg:pb-1 xl:pb-0"
        />
        <BannerWithProducts
          sectionHeading="text-on-selling-products"
          categorySlug="/search"
        />
        {/* <ExclusiveBlock /> */}
        <NewArrivalsProductFeed />
        {/* <DownloadApps /> */}
        {/* <Support /> */}
        {/* <Instagram /> */}
        {/* <Subscription className="bg-opacity-0 px-5 sm:px-16 xl:px-0 py-12 md:py-14 xl:py-16" /> */}
      </Container>
      <Divider className="mb-0" />
    </>
  );
}

Home.Layout = Layout;

export const getStaticProps = async (props: any) => {
  const { locale } = props;

  return {
    props: {
      catalogDesignYourOwn: await buildCatalogCollection(
        CatalogCollectionName.DesignYourOwn
      ),
      catalogDesignTemplates: await buildCatalogCollection(
        CatalogCollectionName.DesignTemplates
      ),
      ...(await serverSideTranslations(locale!, [
        "common",
        "forms",
        "menu",
        "footer",
      ])),
    },
  };
};
