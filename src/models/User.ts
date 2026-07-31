import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  image?: string;
  role: "user" | "admin";
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  image: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

export const User = models.User || model<IUser>("User", UserSchema);
