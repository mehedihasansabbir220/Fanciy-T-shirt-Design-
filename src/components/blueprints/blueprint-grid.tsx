import type { FC } from "react";
import BlueprintCard from "./blueprint-card";
import { Product } from "@framework/types";

interface BlueprintGridProps {
  className?: string;
  products: Product[];
}

export const BlueprintGrid: FC<BlueprintGridProps> = ({
  className = "",
  products,
}) => {
  return (
    <>
      <div
        className={`grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-3 lg:gap-x-5 xl:gap-x-7 gap-y-3 xl:gap-y-5 2xl:gap-y-8 ${className}`}
      >
        {products?.map((product: Product) => (
          <BlueprintCard
            key={`product--key${product.id}`}
            product={product}
            variant="grid"
          />
        ))}
        ;
      </div>
    </>
  );
};
