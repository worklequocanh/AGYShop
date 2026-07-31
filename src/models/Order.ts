import mongoose, { Schema, model, models } from "mongoose";

export interface IOrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
}

export interface IOrder {
  orderCode: string;
  username: string; // link to user by username
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: IShippingAddress;
  paymentMethod: "COD" | "QR" | "CARD";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Number, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  thumbnail: { type: String, required: true },
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>({
  orderCode: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: Schema.Types.Mixed, required: true },
  paymentMethod: { type: String, enum: ["COD", "QR", "CARD"], default: "COD" },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  orderStatus: { type: String, enum: ["pending", "processing", "shipping", "completed", "cancelled"], default: "pending" },
}, { timestamps: true });

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
