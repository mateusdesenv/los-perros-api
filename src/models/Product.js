import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    categoryId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    volume: { type: String, default: null },
    priceInCents: { type: Number, default: null },
    priceFormatted: { type: String, default: null },
    isAlcoholic: { type: Boolean, default: false },
    ageRestriction18: { type: Boolean, default: false },
    image: { type: String, default: null },
    status: {
      type: String,
      enum: ["active", "inactive", "needs_confirmation"],
      default: "active",
      index: true
    },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

productSchema.pre("validate", function setDefaults(next) {
  if (!this.id && this.name) this.id = slugify(this.name);
  if (this.isAlcoholic) this.ageRestriction18 = true;
  next();
});

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  }
});

export const Product = mongoose.model("Product", productSchema);
