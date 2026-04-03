import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OrderItem, OrderItemSchema } from './order-item.schema';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  CASH = 'cash',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Schema({ _id: false })
class ShippingAddress {
  @Prop({ required: true }) street: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) country: string;
  @Prop({ required: true }) zip: string;
  @Prop({ default: '' }) state: string;
}

@Schema({ _id: false })
class Pricing {
  @Prop({ required: true, min: 0 }) subtotal: number;
  @Prop({ default: 0, min: 0 }) shipping: number;
  @Prop({ default: 0, min: 0 }) tax: number;
  @Prop({ default: 0, min: 0 }) discount: number;
  @Prop({ required: true, min: 0 }) total: number;
}

@Schema({ _id: false })
class PaymentInfo {
  @Prop({ enum: PaymentMethod, required: true })
  method: PaymentMethod;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.UNPAID })
  status: PaymentStatus;

  @Prop({ default: '' })
  transactionId: string;
}

@Schema({ _id: false })
class TrackingInfo {
  @Prop({ default: '' }) carrier: string;
  @Prop({ default: '' }) trackingNumber: string;
  @Prop() estimatedDelivery: Date;
}

@Schema({ _id: false })
class StatusHistoryEntry {
  @Prop({ enum: OrderStatus, required: true })
  status: OrderStatus;

  @Prop({ default: Date.now })
  changedAt: Date;

  @Prop({ default: '' })
  note: string;
}

@Schema({ timestamps: true, _id: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true, default: [] })
  items: OrderItem[];

  @Prop({ type: Pricing, required: true })
  pricing: Pricing;

  @Prop({ enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ type: [StatusHistoryEntry], default: [] })
  statusHistory: StatusHistoryEntry[];

  @Prop({ type: ShippingAddress, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ type: PaymentInfo, required: true })
  payment: PaymentInfo;

  @Prop({ type: TrackingInfo, default: () => ({}) })
  tracking: TrackingInfo;

  @Prop() paidAt: Date;
  @Prop() shippedAt: Date;
  @Prop() deliveredAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
