import Card from "@components/common/card";
import SectionHeader from "@components/common/section-header";
import { ROUTES } from "@utils/routes";
import { Catalog, CatalogCollection } from "src/models/catalog";
import { CatalogCollectionName as CatalogCollectionName } from "@models/enums/catalog-collection-name";

interface Props {
  className?: string;
  classNameCatalogs?: string;
  catalogCollection: CatalogCollection;
  sectionHeaderText: string;
}

const CatalogBlock: React.FC<Props> = ({
  className,
  classNameCatalogs = "mb-12 md:mb-14 xl:mb-16 lg:pt-1 xl:pt-0",
  catalogCollection,
  sectionHeaderText,
}) => {
  return (
    <div className={className}>
      <SectionHeader sectionHeading={sectionHeaderText} />
      <div
        className={`grid grid-cols-1 gap-5 md:gap-14 xl:gap-7 xl:grid-cols-4 2xl:grid-cols-6 ${classNameCatalogs}`}
      >
        {catalogCollection.catalogs?.map((catalog: Catalog) => (
          <Card
            key={catalog.id}
            item={catalog}
            href={`${ROUTES.CATALOGS}/${catalogCollection.id}/${catalog.slug}`}
            variant={"rounded"}
            effectActive={true}
            size={"custom"}
            imageSize={500}
          />
        ))}
      </div>
    </div>
  );
};

export default CatalogBlock;
