import { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, default: "" },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  active: { type: Boolean, default: false }, // Cambiado a false por defecto
  createdAt: { type: Date, default: Date.now },
});

export type UserType = {
  _id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  active: boolean;
};

export default models.User || model("User", UserSchema);
