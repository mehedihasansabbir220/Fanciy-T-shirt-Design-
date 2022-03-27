import { Variant } from "@framework/types";
import cn from "classnames";
import { useEffect, useState } from "react";
interface Props {
  className?: string;
  variants: Variant[];
  onChange: (variant: Variant) => void;
}

export const BlueprintVariants: React.FC<Props> = ({
  className = "mb-4",
  variants,
  onChange,
}) => {
  const uniqueColors = Array.from(
    new Set(variants.map((variant) => variant.color.code[0]))
  );

  const uniqueSizes = Array.from(
    new Set(variants.map((variant) => variant.size.title))
  );

  const options: {
    [key: string]: {
      title: string;
      options: { id: string; value: string; isColor: boolean; title: string }[];
    };
  } = {
    size: {
      title: "Size",
      options: uniqueSizes.map((size) => {
        return {
          id: size,
          isColor: false,
          value: size,
          title: size,
        };
      }),
    },
    color: {
      title: "Color",
      options: uniqueColors.map((color) => {
        return {
          id: color,
          isColor: true,
          value: color,
          title: color,
        };
      }),
    },
  };

  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({
    size: options.size.options[0].value,
    color: options.color.options[0].value,
  });

  function handleOptionClicked(value: { [title: string]: string }) {
    setSelectedOptions((prev) => ({
      ...prev,
      ...value,
    }));
  }

  const selectedVariantsByColor = variants.filter(
    (variant) => variant.color.code[0] == selectedOptions.color
  );

  const selectedVariant =
    selectedVariantsByColor.find(
      (variant) => variant.size.title == selectedOptions.size
    ) || selectedVariantsByColor[0];

  useEffect(() => {
    console.log("useeffect, selectedVariant:", selectedVariant);
    onChange(selectedVariant);
  }, [selectedOptions]);

  console.log("selectedOptions:", selectedOptions);
  console.log("selectedVariant:", selectedVariant);

  return (
    <>
      {Object.keys(options).map((optionKey) => {
        const option = options[optionKey];
        return (
          <VariantsView
            className={className}
            key={option.title}
            optionKey={optionKey}
            title={option.title}
            options={option.options}
            active={selectedOptions[optionKey]}
            onClick={handleOptionClicked}
          />
        );
      })}
    </>
  );
};

interface VariantsViewProps {
  className: string;
  title: string;
  optionKey: string;
  options: {
    id: string;
    title: string;
    value: string;
    isColor: boolean;
  }[];
  active: string;
  onClick: (value: { [title: string]: string }) => void;
}

const VariantsView: React.FC<VariantsViewProps> = ({
  className = "mb-4",
  title,
  options,
  active,
  optionKey,
  onClick,
}) => {
  console.log("active:", active);
  return (
    <div className={className}>
      <h3 className="text-base md:text-lg text-heading font-semibold mb-2.5 capitalize">
        {title}
      </h3>
      <ul className="colors flex flex-wrap -me-3">
        {options?.map(({ id, value, isColor }) => (
          <li
            key={`${value}-${id}`}
            className={cn(
              "cursor-pointer rounded border border-gray-100 w-7 md:w-9 h-7 md:h-9 p-1 mb-2 md:mb-3 me-2 md:me-3 flex justify-center items-center text-heading text-xs md:text-sm uppercase font-semibold transition duration-200 ease-in-out hover:border-black",
              {
                "border-black": value === active,
              }
            )}
            onClick={() => onClick({ [optionKey]: value })}
          >
            {isColor ? (
              <span
                className="h-full w-full rounded block"
                style={{ backgroundColor: value }}
              />
            ) : (
              value
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
