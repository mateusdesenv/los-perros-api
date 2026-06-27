import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDatabase } from "../config/database.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { StoreConfig } from "../models/StoreConfig.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const menuPath = path.resolve(__dirname, "../../../los-perros-web/src/data/menuData.json");

async function seed() {
  await connectDatabase();

  const rawMenu = await fs.readFile(menuPath, "utf-8");
  const menu = JSON.parse(rawMenu);
  const featuredIds = pickFeaturedProductIds(menu);

  await StoreConfig.findOneAndUpdate(
    { singleton: "main" },
    {
      $set: {
        singleton: "main",
        name: menu.establishment.name || "Los Perros Market",
        type: menu.establishment.type || "Conveniência Delivery",
        currency: menu.establishment.currency || "BRL",
        whatsapp: menu.establishment.whatsapp || "",
        deliveryNote: menu.establishment.deliveryNote || "",
        openingHours: menu.establishment.openingHours || "",
        instagram: menu.establishment.instagram || "",
        ifoodUrl: menu.establishment.ifoodUrl || ""
      }
    },
    { upsert: true, new: true }
  );

  for (const [categoryIndex, category] of menu.categories.entries()) {
    await Category.findOneAndUpdate(
      { $or: [{ id: category.id }, { slug: category.slug }] },
      {
        $set: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          displayOrder: category.displayOrder ?? categoryIndex,
          isActive: category.isActive !== false
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    for (const [productIndex, product] of (category.products || []).entries()) {
      await Product.findOneAndUpdate(
        { id: product.id },
        {
          $set: {
            id: product.id,
            categoryId: category.id,
            name: product.name,
            description: product.description || null,
            volume: product.volume || null,
            priceInCents: product.priceInCents ?? null,
            priceFormatted: product.priceFormatted || null,
            isAlcoholic: Boolean(product.isAlcoholic),
            ageRestriction18: Boolean(product.ageRestriction18 || product.isAlcoholic),
            image: product.image || null,
            status: product.status || "active",
            isFeatured: product.isFeatured ?? featuredIds.has(product.id),
            displayOrder: product.displayOrder ?? productIndex
          }
        },
        { upsert: true, new: true, runValidators: true }
      );
    }
  }

  const [categoryCount, productCount] = await Promise.all([
    Category.countDocuments(),
    Product.countDocuments()
  ]);

  console.log(`Seed concluído: ${categoryCount} categorias e ${productCount} produtos.`);
}

function pickFeaturedProductIds(menu) {
  const preferredCategoryIds = [
    "cervejas-geladas",
    "destilados",
    "refrigerantes",
    "energeticos",
    "pizzas-do-gobbo",
    "vinhos",
    "espumantes"
  ];

  const picked = new Set();
  const allProducts = menu.categories.flatMap((category) =>
    (category.products || []).map((product) => ({ ...product, categoryId: category.id }))
  );

  preferredCategoryIds.forEach((categoryId) => {
    const product = allProducts.find(
      (item) => item.categoryId === categoryId && item.priceInCents !== null && item.status !== "inactive"
    );
    if (product) picked.add(product.id);
  });

  allProducts.forEach((product) => {
    if (picked.size >= 8) return;
    if (product.status !== "inactive") picked.add(product.id);
  });

  return picked;
}

seed()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { default: mongoose } = await import("mongoose");
    await mongoose.disconnect();
  });
