import mongoose, { Schema, model, models } from "mongoose";

export interface ICategory {
  slug: string;
  name: string;
  image?: string;
}

const CategorySchema = new Schema<ICategory>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, default: "" },
});

export const Category = models.Category || model<ICategory>("Category", CategorySchema);
