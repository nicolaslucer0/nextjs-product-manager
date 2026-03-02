import { Schema, model, models } from "mongoose";

const UsedPhonePriceSchema = new Schema(
  {
    modelName: { type: String, required: true, trim: true },
    storage: { type: String, required: true, trim: true },
    basePrice: { type: Number, required: true, min: 0 },
    changedPartsPrice: { type: Number, required: true, min: 0 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

UsedPhonePriceSchema.index({ modelName: 1, storage: 1 }, { unique: true });
UsedPhonePriceSchema.index({ active: 1, modelName: 1, storage: 1 });

export type UsedPhonePriceType = {
  _id: string;
  modelName: string;
  storage: string;
  basePrice: number;
  changedPartsPrice: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export default models.UsedPhonePrice ||
  model("UsedPhonePrice", UsedPhonePriceSchema);
