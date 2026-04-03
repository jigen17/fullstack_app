import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument, Product } from 'src/schemes/product.schema';
import { CreateProductDto } from 'src/dtos/create-product.dto';
import { UpdateProductDto } from 'src/dtos/update-product.dto';
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  private get activeFilter() {
    return { isActive: true } as const;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return this.productModel.create(dto);
  }

  async findAll(category?: string, limit = 20, skip = 0): Promise<Product[]> {
    const filter: Record<string, unknown> = { ...this.activeFilter };
    if (category) filter['category'] = category;
    return (await this.productModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .lean()) as unknown as Product[];
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel
      .findOne({ _id: id, ...this.activeFilter })
      .lean();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, ...this.activeFilter },
        { $set: dto },
        { new: true },
      )
      .lean();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.productModel
      .findOneAndUpdate(
        { _id: id, ...this.activeFilter },
        { isActive: false },
        { new: true },
      )
      .lean();
    if (!product) throw new NotFoundException('Product not found');
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    const result = await this.productModel.updateOne(
      {
        _id: id,
        ...this.activeFilter,
        ...(quantity < 0 ? { stock: { $gte: Math.abs(quantity) } } : {}),
      },
      { $inc: { stock: quantity } },
    );

    if (result.matchedCount === 0) {
      const product = await this.productModel.exists({ _id: id });
      if (!product) throw new NotFoundException('Product not found');

      throw new ConflictException('Insufficient stock or product is inactive');
    }
  }
  async findManyByIds(ids: string[]): Promise<Product[]> {
    const products = await this.productModel
      .find({ _id: { $in: ids }, ...this.activeFilter })
      .lean();

    const foundIds = new Set(products.map((p) => String(p._id)));
    const missingIds = ids.filter((id) => !foundIds.has(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Products not found for IDs: ${missingIds.join(', ')}`,
      );
    }

    return products;
  }
}
