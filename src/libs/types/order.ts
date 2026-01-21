import { Types } from "mongoose";
import { OrderStatus } from "../enums/order.enum";
import { emitKeypressEvents } from "readline";
import { Product } from "./product";

export interface OrderItem {
  _id: Types.ObjectId;
  itemQuantity: number;
  itemPrice: number;
  orderId: Types.ObjectId;
  productId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: Types.ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  /** from agrigations **/
  orderItems: OrderItem[];
  productData: Product[];
}

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  productId: string | Types.ObjectId;
  orderId?: Types.ObjectId;
}

export interface OrderIquery {
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}
