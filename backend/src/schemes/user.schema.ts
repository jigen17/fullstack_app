import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/enums/role.enum';
export type UserDocument = User & Document;

@Schema({ timestamps: true, _id: true })
export class User {
  _id: Types.ObjectId;
  @Prop({ type: String, required: true })
  firstName: string;
  @Prop({ type: String, required: true })
  lastName: string;
  @Prop({ type: String, required: true, unique: true })
  userName: string;
  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;
  @Prop({ required: true, select: false })
  password: string;
  @Prop({ required: false })
  avatarUrl?: string;
  @Prop({ enum: Role, default: Role.USER })
  role: Role;
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Product' }],
    required: false,
  })
  wishlist: Types.ObjectId[];
  @Prop({ index: true, default: true })
  isActive: boolean;
  @Prop({ default: false })
  isBanned: boolean;
  @Prop({ index: true, default: false })
  isDeleted: boolean;
  @Prop({ required: false })
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
