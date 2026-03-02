import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    instagram: {
      type: String,
      default: "",
    },
    whatsapp: {
      type: String,
      default: "",
    },
    tiktok: {
      type: String,
      default: "",
    },
    locationAddress: {
      type: String,
      default: "",
    },
    locationCity: {
      type: String,
      default: "",
    },
    locationSchedule: {
      type: String,
      default: "",
    },
    locationMap: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export type SocialLinksType = {
  _id?: string;
  instagram: string;
  whatsapp: string;
  tiktok: string;
  locationAddress: string;
  locationCity: string;
  locationSchedule: string;
  locationMap: string;
};

export default mongoose.models.SocialLinks ||
  mongoose.model("SocialLinks", socialLinksSchema);
