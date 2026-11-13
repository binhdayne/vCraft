import {
  BatchModelName,
  BatchSchema,
} from "../modules/batches/schemas/batches.schema";
import {
  ArtworkModelName,
  ArtworkSchema,
} from "../modules/catalog/schemas/products.schema";
import {
  WorkshopProductModelName,
  WorkshopProductSchema,
} from "../modules/catalog/schemas/workshop-products.schema";
import {
  StudioModelName,
  StudioSchema,
} from "../modules/catalog/schemas/workshops.schema";
import {
  BulletinModelName,
  BulletinSchema,
} from "../modules/news/schemas/news.schema";
import {
  MediaAssetModelName,
  MediaAssetSchema,
} from "../modules/media/schemas/media-asset.schema";
import {
  QuotationModelName,
  QuotationSchema,
} from "../modules/quotes/schemas/quotes.schema";
import {
  AccountModelName,
  AccountSchema,
} from "../modules/users/schemas/users.schema";
import {
  CartModelName,
  CartSchema,
} from "../modules/cart/schemas/cart.schema";
export const databaseModels = [
  { name: AccountModelName, schema: AccountSchema },
  { name: StudioModelName, schema: StudioSchema },
  { name: ArtworkModelName, schema: ArtworkSchema },
  { name: WorkshopProductModelName, schema: WorkshopProductSchema },
  { name: BatchModelName, schema: BatchSchema },
  { name: QuotationModelName, schema: QuotationSchema },
  { name: BulletinModelName, schema: BulletinSchema },
  { name: MediaAssetModelName, schema: MediaAssetSchema },
  { name: CartModelName, schema: CartSchema },
];
