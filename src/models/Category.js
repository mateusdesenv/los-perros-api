import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const categorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

categorySchema.pre("validate", function setDefaults(next) {
  if (!this.slug && this.name) this.slug = slugify(this.name);
  if (!this.id) this.id = this.slug || slugify(this.name);
  next();
});

categorySchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  }
});

export const Category = mongoose.model("Category", categorySchema);
