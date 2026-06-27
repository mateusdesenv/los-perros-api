import express from "express";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { StoreConfig } from "../models/StoreConfig.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";
import { getAdminMenu, getStoreConfig } from "../utils/menu.js";

export const adminRouter = express.Router();

adminRouter.use(adminAuth);

adminRouter.get(
  "/menu",
  asyncHandler(async (_request, response) => {
    response.json(await getAdminMenu());
  })
);

adminRouter.get(
  "/categories",
  asyncHandler(async (_request, response) => {
    response.json(await Category.find().sort({ displayOrder: 1, name: 1 }));
  })
);

adminRouter.post(
  "/categories",
  asyncHandler(async (request, response) => {
    const payload = normalizeCategoryPayload(request.body);
    const category = await Category.create(payload);
    response.status(201).json(category);
  })
);

adminRouter.put(
  "/categories/:id",
  asyncHandler(async (request, response) => {
    const category = await Category.findOneAndUpdate(
      { id: request.params.id },
      normalizeCategoryPayload(request.body, request.params.id),
      { new: true, runValidators: true }
    );

    if (!category) {
      response.status(404).json({ message: "Categoria não encontrada." });
      return;
    }

    response.json(category);
  })
);

adminRouter.delete(
  "/categories/:id",
  asyncHandler(async (request, response) => {
    const category = await Category.findOneAndDelete({ id: request.params.id });
    if (!category) {
      response.status(404).json({ message: "Categoria não encontrada." });
      return;
    }

    await Product.deleteMany({ categoryId: request.params.id });
    response.status(204).send();
  })
);

adminRouter.get(
  "/products",
  asyncHandler(async (_request, response) => {
    response.json(await Product.find().sort({ displayOrder: 1, name: 1 }));
  })
);

adminRouter.post(
  "/products",
  asyncHandler(async (request, response) => {
    const product = await Product.create(normalizeProductPayload(request.body));
    response.status(201).json(product);
  })
);

adminRouter.put(
  "/products/:id",
  asyncHandler(async (request, response) => {
    const product = await Product.findOneAndUpdate(
      { id: request.params.id },
      normalizeProductPayload(request.body, request.params.id),
      { new: true, runValidators: true }
    );

    if (!product) {
      response.status(404).json({ message: "Produto não encontrado." });
      return;
    }

    response.json(product);
  })
);

adminRouter.delete(
  "/products/:id",
  asyncHandler(async (request, response) => {
    const product = await Product.findOneAndDelete({ id: request.params.id });
    if (!product) {
      response.status(404).json({ message: "Produto não encontrado." });
      return;
    }

    response.status(204).send();
  })
);

adminRouter.get(
  "/store-config",
  asyncHandler(async (_request, response) => {
    response.json(await getStoreConfig());
  })
);

adminRouter.put(
  "/store-config",
  asyncHandler(async (request, response) => {
    const config = await StoreConfig.findOneAndUpdate(
      { singleton: "main" },
      {
        $set: {
          name: request.body.name || "Los Perros Market",
          type: request.body.type || "Conveniência Delivery",
          currency: request.body.currency || "BRL",
          whatsapp: request.body.whatsapp || "",
          deliveryNote: request.body.deliveryNote || "",
          openingHours: request.body.openingHours || "",
          instagram: request.body.instagram || "",
          ifoodUrl: request.body.ifoodUrl || ""
        }
      },
      { new: true, upsert: true, runValidators: true }
    );

    response.json(config);
  })
);

function normalizeCategoryPayload(body, fallbackId) {
  const name = body.name?.trim();
  const slug = body.slug?.trim() || slugify(name);

  return {
    id: body.id || fallbackId || slug,
    name,
    slug,
    description: body.description || "",
    displayOrder: Number(body.displayOrder || 0),
    isActive: body.isActive !== false
  };
}

function normalizeProductPayload(body, fallbackId) {
  const name = body.name?.trim();

  return {
    id: body.id || fallbackId || slugify(name),
    categoryId: body.categoryId,
    name,
    description: body.description || null,
    volume: body.volume || null,
    priceInCents: body.priceInCents ?? null,
    priceFormatted: body.priceFormatted || null,
    isAlcoholic: Boolean(body.isAlcoholic),
    ageRestriction18: Boolean(body.ageRestriction18 || body.isAlcoholic),
    image: body.image || null,
    status: body.status || "active",
    isFeatured: Boolean(body.isFeatured),
    displayOrder: Number(body.displayOrder || 0)
  };
}
