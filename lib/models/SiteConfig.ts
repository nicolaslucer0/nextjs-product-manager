import { Schema, model, models } from "mongoose";

const SiteConfigSchema = new Schema({
  dollarRate: { type: Number, default: 0 },
  paymentMessage: { type: String, default: "" },
  shippingMessage: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

SiteConfigSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export type SiteConfigType = {
  _id: string;
  dollarRate: number;
  paymentMessage: string;
  shippingMessage: string;
  updatedAt: string;
};

// Forzar actualización del schema si los campos cambian
if (models.SiteConfig) {
  models.SiteConfig.schema = SiteConfigSchema;
}

export default models.SiteConfig || model("SiteConfig", SiteConfigSchema);
