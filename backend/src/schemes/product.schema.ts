import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ProductImageSchema, ProductImage } from './product-image.schema';
export type ProductDocument = Product & Document;

@Schema({ timestamps: true, _id: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0, default: 0 })
  stock: number;

  @Prop({ required: true })
  category: string;

  @Prop({})
  @Prop({ type: [ProductImageSchema], default: [] })
  images: ProductImage[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
