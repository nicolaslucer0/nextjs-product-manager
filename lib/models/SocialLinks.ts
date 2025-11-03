import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    instagram: {
      type: String,
      default: "https://instagram.com",
    },
    whatsapp: {
      type: String,
      default: "+1234567890",
    },
    tiktok: {
      type: String,
      default: "https://tiktok.com",
    },
    locationAddress: {
      type: String,
      default: "Av. Principal 123",
    },
    locationCity: {
      type: String,
      default: "Ciudad, País",
    },
    locationSchedule: {
      type: String,
      default: "Lun - Sáb: 9AM - 8PM",
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
