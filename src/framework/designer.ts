import { Variant } from "@framework/types";
import { sleep } from "@utils/sleep";
import axios from "axios";
import { UploadUrlResponse } from "src/pages/api/upload-url";
import {
  getUploadUrl,
  uploadData,
  uploadImageDataUrl,
} from "src/services/upload-services";
import { buildDesignProductFromVariant } from "./designer/buildDesignProductFromVariant";

async function getDesigner() {
  let designer;
  let retry = 200;
  while (retry-- > 0) {
    // check if designer is ready
    const iframeWindow = (document.getElementById("designstudiostatic") as any)
      ?.contentWindow;
    const isReady = iframeWindow.designerFunctions.isReady();
    console.log("is designer ready:", isReady);
    if (!isReady) {
      await sleep(300);
      console.log("retry till designer is ready:", retry);
      continue;
    }

    // try getting a reference to the designer object
    designer = (document.getElementById("designstudiostatic") as any)
      ?.contentWindow.designer;
    console.log("designer:", designer);

    if (designer) {
      break;
    }

    await sleep(300);
    console.log("retry getting designer:", retry);
  }

  if (!designer) {
    console.log("Fatal: failed to load desigenr");
    return;
  }

  return designer;
}

export async function selectProductVariantToDesign(variant: Variant) {
  let designer = await getDesigner();
  console.log(designer, "variant:", variant);
  const designProduct = buildDesignProductFromVariant(variant);
  console.log("design product:", designProduct);

  let retry = 10;
  while (retry-- > 0) {
    try {
      designer.loadProduct(designProduct);
      break;
    } catch (error) {}
    await sleep(300);
  }
}

export async function saveProductDesign() {
  const imageScale = 1.4;
  const imageSize = 1024;
  const targetSize = 600;
  const scale = targetSize / imageSize;

  const stageWidth = imageSize * scale;
  const stageHeight = imageSize * scale;

  const designer = await getDesigner();

  // store the product json
  const {
    url: urlProduct,
    designFolder,
    product,
  } = await storeProductJson(designer);

  // store the product image
  const urlProductImage = await storeProductImage(
    designer,
    designFolder,
    product
  );

  // store the design image
  const urlDesignImage = await storeDesignImage(
    designer,
    stageWidth,
    stageHeight,
    imageScale,
    designFolder,
    product
  );

  // TODO store the design info in DB which should also assoicate it with the user if signed in

  return {
    productKey: designFolder,
    urlProduct,
    urlProductImage,
    urlDesignImage,
  };
}

async function storeDesignImage(
  designer: any,
  stageWidth: number,
  stageHeight: number,
  imageScale: number,
  designFolder: string,
  product: any
) {
  console.log("store the design image");
  const urls: { printArea: string; url: string }[] = [];
  for (let viewId = 0; viewId < product.length; viewId++) {
    console.log("view:", viewId);
    const view = product[viewId];
    const printArea = view.title;
    const designImage = await getDesignImage(
      designer,
      stageWidth,
      stageHeight,
      imageScale,
      viewId
    );
    const uploadUrlResponse = await getUploadUrl(
      `design-${printArea}.png`,
      "image/png",
      designFolder
    );
    await uploadImageDataUrl(uploadUrlResponse, designImage);
    urls.push({
      printArea: printArea,
      url: getFullUrlToFile(uploadUrlResponse),
    });
  }
  return urls;
}

async function storeProductImage(
  designer: any,
  designFolder: string,
  product: any
) {
  console.log("store the product image, #views:", product.length);
  const urls: { printArea: string; url: string }[] = [];
  for (let viewId = 0; viewId < product.length; viewId++) {
    console.log("view:", viewId);
    const view = product[viewId];
    const printArea = view.title;
    const productImage = await getProductImage(designer, viewId);
    const uploadUrlResponse = await getUploadUrl(
      `product-${printArea}.png`,
      "image/png",
      designFolder
    );
    await uploadImageDataUrl(uploadUrlResponse, productImage);
    urls.push({
      printArea: printArea,
      url: getFullUrlToFile(uploadUrlResponse),
    });
  }
  return urls;
}

async function storeProductJson(designer: any) {
  console.log("store the product json");
  const product = designer.getProduct();
  console.log("product:", product);
  let uploadUrlResponse = await getUploadUrl(
    "product.json",
    "application/json"
  );
  const { folder: designFolder } = uploadUrlResponse;
  await uploadData(uploadUrlResponse, product);
  return { url: getFullUrlToFile(uploadUrlResponse), designFolder, product };
}

function getFullUrlToFile(uploadUrlResponse: UploadUrlResponse) {
  return uploadUrlResponse.url + "/" + uploadUrlResponse.fullFilePath;
}

async function getProductImage(designer: any, viewId: number) {
  const dataUrl = await new Promise((resolve) => {
    designer.getProductDataURL(
      (dataUrl: string) => {
        resolve(dataUrl);
      },
      "transparent",
      {
        onlyExportable: false,
        format: "png",
      },
      [viewId, viewId + 1]
    );
  });

  return dataUrl as string;
}

async function getDesignImage(
  designer: any,
  stageWidth: number,
  stageHeight: number,
  scale: number,
  viewId: number
) {
  const boundingBoxWidth = 200 * scale;
  const boundingBoxHeight = 300 * scale;
  const bbLeft = stageWidth / 4 - boundingBoxWidth / 4;
  const bbTop = stageHeight / 4 - boundingBoxHeight / 4;

  const boundingBox = {
    left: bbLeft,
    top: bbTop,
    width: bbLeft + boundingBoxWidth,
    height: bbTop + boundingBoxHeight,
  };
  const dataUrl = await new Promise((resolve) => {
    designer.getProductDataURL(
      (dataUrl: string) => {
        resolve(dataUrl);
      },
      "transparent",
      {
        onlyExportable: true,
        format: "png",
        ...boundingBox,
      },
      [viewId, viewId + 1]
    );
  });

  return dataUrl as string;
}
