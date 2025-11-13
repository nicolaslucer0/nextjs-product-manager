import { Schema, model, models } from "mongoose";

const CategoryConfigSchema = new Schema({
  category: { type: String, required: true, unique: true },
  warrantyMessage: { type: String, default: "Garantía de 30 días" },
  updatedAt: { type: Date, default: Date.now },
});

CategoryConfigSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export type CategoryConfigType = {
  _id: string;
  category: string;
  warrantyMessage: string;
  updatedAt: string;
};

export default models.CategoryConfig ||
  model("CategoryConfig", CategoryConfigSchema);
