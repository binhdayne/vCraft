import {
  BatchModelName,
  BatchSchema,
} from "../modules/batches/schemas/batches.schema";
import {
  ArtworkModelName,
  ArtworkSchema,
} from "../modules/catalog/schemas/products.schema";
import {
  StudioModelName,
  StudioSchema,
} from "../modules/catalog/schemas/workshops.schema";
import {
  BulletinModelName,
  BulletinSchema,
} from "../modules/news/schemas/news.schema";
import {
  QuotationModelName,
  QuotationSchema,
} from "../modules/quotes/schemas/quotes.schema";
import {
  AccountModelName,
  AccountSchema,
} from "../modules/users/schemas/users.schema";
export const databaseModels = [
  { name: AccountModelName, schema: AccountSchema },
  { name: StudioModelName, schema: StudioSchema },
  { name: ArtworkModelName, schema: ArtworkSchema },
  { name: BatchModelName, schema: BatchSchema },
  { name: QuotationModelName, schema: QuotationSchema },
  { name: BulletinModelName, schema: BulletinSchema },
];
