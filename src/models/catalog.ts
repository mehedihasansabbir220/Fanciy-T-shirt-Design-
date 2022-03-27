import { Attachment } from "./common";

export type Catalog = {
  id: number;
  name: string;
  slug: string;
  details?: string;
  image?: Attachment;
  icon?: string;
  productCount?: number;
  tags: string[];
  blueprints: string[];
};

export type CatalogCollection = {
  id: string;
  catalogs: Catalog[];
};
