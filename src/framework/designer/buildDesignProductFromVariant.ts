import { PrintArea, Variant } from "@framework/types";

export function buildDesignProductFromVariant(variant: Variant) {
  return [
    buildView(variant, 0, variant.printAreas[0]),
    buildView(variant, 1, variant.printAreas[1]),
  ];
}

function buildView(variant: Variant, imageIndex: number, printArea: PrintArea) {
  const imageSize = 1024;
  const targetSize = 600;
  const scale = targetSize / imageSize;

  const stageWidth = imageSize * scale;
  const stageHeight = imageSize * scale;

  console.log("scale:", scale);

  return {
    title: printArea.position,
    thumbnail: variant.images[imageIndex],
    options: {
      stageWidth: stageWidth.toString(),
      stageHeight: stageHeight.toString(),
    },
    elements: [
      {
        title: "Shirt",
        source: variant.images[imageIndex],
        type: "image",
        parameters: {
          left: stageWidth / 2,
          top: stageHeight / 2,
          //   width: 1024,
          //   height: 1024,
          //   originX: "left",
          //   originY: "top",
          originX: "center",
          originY: "center",
          z: -1,
          fill: false,
          //   colors: ["#b33939"],
          colorLinkGroup: "base",
          draggable: 0,
          rotatable: 0,
          resizable: 0,
          removable: 0,
          zChangeable: 0,
          scaleX: scale * 1.4,
          scaleY: scale * 1.4,
          lockUniScaling: false,
          uniScalingUnlockable: 0,
          angle: 0,
          price: 10,
          replaceInAllViews: false,
          autoSelect: 0,
          topped: 0,
          boundingBoxMode: "none",
          opacity: 1,
          excludeFromExport: true,
          locked: 1,
          showInColorSelection: false,
          resizeToW: 0,
          resizeToH: 0,
          filter: null,
          //   scaleMode: "fit",
          minScaleLimit: 0.01,
          advancedEditing: false,
          uploadZone: 0,
        },
      },
      {
        title: "Design",
        source: "images/shirt_turq/Design1.png",
        type: "image",
        parameters: {
          left: 410,
          top: 363,
          originX: "center",
          originY: "center",
          z: -1,
          fill: false,
          colors: ["#000"],
          colorLinkGroup: false,
          draggable: 1,
          rotatable: 1,
          resizable: 1,
          removable: 1,
          zChangeable: 1,
          scaleX: 1,
          scaleY: 1,
          lockUniScaling: false,
          uniScalingUnlockable: 0,
          angle: 0,
          price: 0,
          autoCenter: true,
          replace: "design",
          replaceInAllViews: false,
          autoSelect: 0,
          topped: 0,
          boundingBoxMode: "clipping",
          opacity: 1,
          excludeFromExport: false,
          locked: 0,
          showInColorSelection: false,
          resizeToW: 0,
          resizeToH: 0,
          filter: null,
          scaleMode: "fit",
          minScaleLimit: 0.01,
          advancedEditing: false,
          uploadZone: 0,
        },
      },
    ],
  };
}
