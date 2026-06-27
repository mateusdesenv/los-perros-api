import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { StoreConfig } from "../models/StoreConfig.js";

const categorySort = { displayOrder: 1, name: 1 };
const productSort = { displayOrder: 1, name: 1 };

export async function getStoreConfig() {
  const config = await StoreConfig.findOneAndUpdate(
    { singleton: "main" },
    {
      $setOnInsert: {
        singleton: "main",
        name: "Los Perros Market",
        type: "Conveniência Delivery",
        currency: "BRL",
        whatsapp: "",
        deliveryNote: "Delivery de conveniência com bebidas, pizzas, refrigerantes e produtos selecionados."
      }
    },
    { new: true, upsert: true }
  ).lean();

  return sanitizeDoc(config, ["singleton"]);
}

export async function getPublicCategories() {
  const categories = await Category.find({ isActive: true }).sort(categorySort).lean();
  return categories.map((category) => sanitizeDoc(category));
}

export async function getPublicProducts(extraFilter = {}) {
  const categories = await getPublicCategories();
  const activeCategoryIds = categories.map((category) => category.id);
  const categoriesById = categories.reduce((mapped, category) => {
    mapped[category.id] = category;
    return mapped;
  }, {});
  const products = await Product.find({
    categoryId: { $in: activeCategoryIds },
    status: { $ne: "inactive" },
    ...extraFilter
  })
    .sort(productSort)
    .lean();

  return products.map((product) => ({
    ...sanitizeDoc(product),
    categoryName: categoriesById[product.categoryId]?.name,
    categorySlug: categoriesById[product.categoryId]?.slug,
    needsConfirmation: product.status === "needs_confirmation"
  }));
}

export async function getPublicMenu() {
  const [establishment, categories, products] = await Promise.all([
    getStoreConfig(),
    getPublicCategories(),
    getPublicProducts()
  ]);

  const productsByCategory = products.reduce((grouped, product) => {
    grouped[product.categoryId] = grouped[product.categoryId] || [];
    grouped[product.categoryId].push(product);
    return grouped;
  }, {});

  return {
    establishment,
    categories: categories
      .map((category) => ({
        ...category,
        products: productsByCategory[category.id] || []
      }))
      .filter((category) => category.products.length > 0)
  };
}

export async function getAdminMenu() {
  const [establishment, categories, products] = await Promise.all([
    getStoreConfig(),
    Category.find().sort(categorySort).lean(),
    Product.find().sort(productSort).lean()
  ]);

  const sanitizedProducts = products.map((product) => sanitizeDoc(product));
  const productsByCategory = sanitizedProducts.reduce((grouped, product) => {
    grouped[product.categoryId] = grouped[product.categoryId] || [];
    grouped[product.categoryId].push(product);
    return grouped;
  }, {});

  return {
    establishment,
    categories: categories.map((category) => ({
      ...sanitizeDoc(category),
      products: productsByCategory[category.id] || []
    }))
  };
}

function sanitizeDoc(doc, omittedKeys = []) {
  const { _id, ...rest } = doc || {};
  omittedKeys.forEach((key) => {
    delete rest[key];
  });
  return rest;
}
