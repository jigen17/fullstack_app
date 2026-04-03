import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ProductImage {
  @Prop({ required: true })
  url: string;

  @Prop({ default: '' })
  alt: string;

  @Prop({ default: false })
  isPrimary: boolean;

  @Prop({ default: 0 })
  order: number;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);
