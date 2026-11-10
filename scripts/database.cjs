const { databaseModels } = require("../dist/database/models");
exports.createDatabase = (connection) => {
  const models = Object.fromEntries(
    databaseModels.map(({ name, schema }) => [
      name,
      connection.models[name] || connection.model(name, schema),
    ]),
  );
  return {
    users: models.Account,
    workshops: models.Studio,
    products: models.Artwork,
    workshopProducts: models.WorkshopProduct,
    batches: models.Batch,
    quotes: models.Quotation,
    news: models.Bulletin,
  };
};
