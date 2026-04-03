import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ _id: true, timestamps: true })
export class Testimonial {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId;

  @Prop({ type: Number, min: 0, max: 5, default: 0 })
  ratings?: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: null })
  deletedAt?: Date;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
