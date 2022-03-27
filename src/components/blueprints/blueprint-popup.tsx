import React, { useState } from "react";
import { useRouter } from "next/router";
import { ROUTES } from "@utils/routes";
import { useUI } from "@contexts/ui.context";
import Button from "@components/ui/button";
import usePrice from "@framework/product/use-price";
import { useTranslation } from "next-i18next";
import parse from "html-react-parser";
import { Product, Variant } from "@framework/types";
import { BlueprintVariants } from "./blueprint-variants";
import { buildVariantPrice } from "@ssr/builders/build-product";
import { Collapse } from "@components/common/accordion";
import Carousel from "@components/ui/carousel/carousel";
import { SwiperSlide } from "swiper/react";

export default function BlueprintPopup() {
  const { t } = useTranslation("common");
  const { modalData, closeModal } = useUI();

  const blueprint = modalData.data as Product;

  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    blueprint.variants[0]
  );

  const variantPrice = buildVariantPrice(
    selectedVariant?.price,
    selectedVariant?.printAreas
  );

  console.log(`variant ${selectedVariant.id} price:`, variantPrice);
  // buildVariantPrice(selectedVariant?.price, selectedVariant?.printAreas[0]) ||
  // blueprint.price;
  const variantSalePrice = variantPrice.minPrice * 1.0;

  const { price, basePrice, discount } = usePrice({
    amount: variantSalePrice,
    baseAmount: variantPrice.minPrice,
    currencyCode: "USD",
  });
  const { slug, image, name, description, variants } = blueprint;
  const [expanded, setExpanded] = useState<number>(-1);

  const navigateToDesignPage = () => {
    closeModal();
    router.push(
      `${ROUTES.DESIGN_STUDIO}/${slug}/${selectedVariant.id}`,
      undefined,
      {
        locale: router.locale,
      }
    );
  };

  function navigateToProductPage() {
    closeModal();
    router.push(`${ROUTES.PRODUCT}/${slug}`, undefined, {
      locale: router.locale,
    });
  }

  const images = selectedVariant?.images || [blueprint.image.original];

  const productGalleryCarouselResponsive = {
    "768": {
      slidesPerView: 1,
    },
    "0": {
      slidesPerView: 1,
    },
  };

  //   const imageSrc =
  //     (selectedVariant?.images[0] as string) || blueprint.image.original;

  function handleChangeVariant(variant: Variant) {
    console.log("handleChangeVariant, new variant: ", variant);
    setSelectedVariant(variant);
  }

  return (
    <div className="rounded-lg bg-white">
      <div className="flex flex-col lg:flex-row w-full md:w-[650px] lg:w-[960px] mx-auto overflow-hidden">
        <div className="flex-shrink-0 items-start justify-center w-full lg:w-430px max-h-430px lg:max-h-full overflow-hidden">
          <Carousel
            pagination={{
              clickable: true,
            }}
            breakpoints={productGalleryCarouselResponsive}
            className="product-gallery"
            buttonGroupClassName="hidden"
          >
            {images?.map((image, index: number) => (
              <SwiperSlide key={`product-gallery-key-${index}`}>
                <div className="flex-shrink-0 items-start justify-center w-full lg:w-430px max-h-430px lg:max-h-full overflow-hidden">
                  <div className="col-span-1 transition duration-150 ease-in hover:opacity-90 mb-10">
                    <img
                      src={
                        image ??
                        "/assets/placeholder/products/product-gallery.svg"
                      }
                      alt={`${name}--${index}`}
                      className="object-cover w-full"
                    />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Carousel>
        </div>

        <div className="flex flex-col p-5 md:p-8 w-full">
          <div className="pb-5">
            <div
              className="mb-2 md:mb-2.5 block -mt-1.5"
              onClick={navigateToProductPage}
              role="button"
            >
              <h2 className="text-heading text-lg md:text-xl lg:text-2xl font-semibold hover:text-black">
                {name}
              </h2>
            </div>

            <div className="flex items-center mt-3">
              <div className="text-heading font-semibold text-base md:text-xl lg:text-2xl">
                {price}
              </div>
              {discount && (
                <del className="font-segoe text-gray-400 text-base lg:text-xl ps-2.5 -mt-0.5 md:mt-0">
                  {basePrice}
                </del>
              )}
            </div>
          </div>

          <BlueprintVariants
            variants={blueprint.variants}
            onChange={handleChangeVariant}
          />

          <div className="pt-2 md:pt-4">
            <div className="flex items-center justify-between mb-4 space-s-3 sm:space-s-4">
              <Button
                onClick={navigateToDesignPage}
                variant="flat"
                className={`w-full h-11 md:h-12 px-1.5`}
              >
                {t("text-start-design")}
              </Button>
            </div>
          </div>

          <Collapse
            i={0}
            title={"Product Details"}
            translatorNS="common"
            content={
              <div className="text-sm leading-6 md:text-body md:leading-7">
                {parse(description || "")}
              </div>
            }
            expanded={expanded}
            setExpanded={setExpanded}
            variant="transparent"
          />

          {/* <p className="text-sm leading-6 md:text-body md:leading-7">
            {parse(description || "")}
          </p> */}
        </div>
      </div>
    </div>
  );
}
