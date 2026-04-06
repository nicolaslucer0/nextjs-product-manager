import { Schema, model, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

CategorySchema.index({ name: 1 });

export type CategoryType = {
  _id: string;
  name: string;
  createdAt: string;
};

export default models.Category || model("Category", CategorySchema);
