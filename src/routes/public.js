import express from "express";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPublicMenu, getPublicProducts, getStoreConfig } from "../utils/menu.js";

export const publicRouter = express.Router();

publicRouter.get(
  "/menu",
  asyncHandler(async (_request, response) => {
    response.json(await getPublicMenu());
  })
);

publicRouter.get(
  "/categories",
  asyncHandler(async (_request, response) => {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    response.json(categories);
  })
);

publicRouter.get(
  "/products",
  asyncHandler(async (_request, response) => {
    response.json(await getPublicProducts());
  })
);

publicRouter.get(
  "/products/featured",
  asyncHandler(async (_request, response) => {
    response.json(await getPublicProducts({ isFeatured: true }));
  })
);

publicRouter.get(
  "/products/:id",
  asyncHandler(async (request, response) => {
    const product = await Product.findOne({ id: request.params.id, status: { $ne: "inactive" } });

    if (!product) {
      response.status(404).json({ message: "Produto não encontrado." });
      return;
    }

    const category = await Category.findOne({ id: product.categoryId, isActive: true });
    if (!category) {
      response.status(404).json({ message: "Produto não encontrado." });
      return;
    }

    response.json({
      ...product.toJSON(),
      categoryName: category.name,
      categorySlug: category.slug,
      needsConfirmation: product.status === "needs_confirmation"
    });
  })
);

publicRouter.get(
  "/store-config",
  asyncHandler(async (_request, response) => {
    response.json(await getStoreConfig());
  })
);
