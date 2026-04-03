import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from 'src/schemes/user.schema';
import { CreateUserDto } from 'src/dtos/create-user.dto';
import { UpdateUserDto } from 'src/dtos/update-user.dto';
import { Product, ProductDocument } from 'src/schemes/product.schema';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTIVE_FILTER = { isActive: true, isDeleted: { $ne: true } };

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const exists = await this.userModel.exists({ email: dto.email });
    if (exists) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({ ...dto, password: hash });
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<User>> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel
        .find(ACTIVE_FILTER)
        .select('-password -wishlist')
        .skip(skip)
        .limit(limit)
        .lean<User[]>(),
      this.userModel.countDocuments(ACTIVE_FILTER),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password -wishlist')
      .lean<User>();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password')
      .lean<User>();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const updateData = { ...dto };

    if (updateData.email) {
      const conflict = await this.userModel.exists({
        email: updateData.email,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (conflict) throw new ConflictException('Email already in use');
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select('-password')
      .lean<User>();

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async banUser(id: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: id },
      { $set: { isBanned: true, isActive: false } },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException('User not found');
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } },
    );
    if (result.matchedCount === 0)
      throw new NotFoundException('User not found');
  }

  async hardDelete(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException('User not found');
  }
  async getWishlist(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<Product>> {
    const user = await this.userModel
      .findById(userId)
      .select('wishlist')
      .lean<UserDocument>();
    if (!user) throw new NotFoundException('User not found');

    const total = user.wishlist.length;
    const skip = (page - 1) * limit;

    const pagedIds = user.wishlist.slice(skip, skip + limit);

    const data = await this.productModel
      .find({ _id: { $in: pagedIds } })
      .lean<Product[]>();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async addToWishlist(userId: string, productId: string): Promise<void> {
    const productExists = await this.productModel.exists({ _id: productId });
    if (!productExists) throw new NotFoundException('Product not found');

    const result = await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { wishlist: productId } },
    );

    if (result.matchedCount === 0)
      throw new NotFoundException('User not found');
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $pull: { wishlist: productId } },
    );

    if (result.matchedCount === 0)
      throw new NotFoundException('User not found');
  }
}
