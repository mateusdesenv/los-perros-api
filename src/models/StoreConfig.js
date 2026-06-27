import mongoose from "mongoose";

const storeConfigSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "main", unique: true, index: true },
    name: { type: String, default: "Los Perros Market" },
    type: { type: String, default: "Conveniência Delivery" },
    currency: { type: String, default: "BRL" },
    whatsapp: { type: String, default: "" },
    deliveryNote: { type: String, default: "" },
    openingHours: { type: String, default: "" },
    instagram: { type: String, default: "" },
    ifoodUrl: { type: String, default: "" }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

storeConfigSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.singleton;
    return ret;
  }
});

export const StoreConfig = mongoose.model("StoreConfig", storeConfigSchema);
