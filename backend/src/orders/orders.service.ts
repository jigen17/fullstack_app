import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
} from '.././schemes/order.schema';
import { OrderItem } from 'src/schemes/order-item.schema';
import { ProductDocument } from 'src/schemes/product.schema';
import { ProductsService } from 'src/products/products.service';
import { CreateOrderDto } from 'src/dtos/create-order.dto';
import { UpdateStatusDto } from 'src/dtos/update-status.dto';
import { AddTrackingDto } from 'src/dtos/add-tracking.dto';

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const productIds = dto.items.map((i) => i.productId);

    const products = await this.productsService.findManyByIds(productIds);

    if (products.length !== productIds.length) {
      const foundIds = products.map((p) =>
        (p as ProductDocument & { _id: Types.ObjectId })._id.toString(),
      );
      const missing = productIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(`Products not found: ${missing.join(', ')}`);
    }

    const orderItems: OrderItem[] = [];
    for (const item of dto.items) {
      const product = products.find(
        (p) => (p as any)._id.toString() === item.productId,
      ) as ProductDocument;

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        );
      }

      const primaryImage =
        product.images?.find((img) => img.isPrimary)?.url ??
        product.images?.[0]?.url ??
        '';

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        productName: product.name,
        productImage: primaryImage,
        quantity: item.quantity,
        priceAtPurchase: product.price,
        subtotal: product.price * item.quantity,
      });
    }

    const pricing = this.calculatePricing(orderItems);

    const order = new this.orderModel({
      user: new Types.ObjectId(userId),
      items: orderItems,
      pricing,
      shippingAddress: dto.shippingAddress,
      payment: { method: dto.paymentMethod },
      status: OrderStatus.PENDING,
      statusHistory: [{ status: OrderStatus.PENDING, changedAt: new Date() }],
    });

    const saved = await order.save();

    await Promise.all(
      dto.items.map((item) =>
        this.productsService.updateStock(item.productId, -item.quantity),
      ),
    );

    return saved;
  }

  async findAllByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string, userId?: string): Promise<OrderDocument> {
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (userId && order.user.toString() !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async findAll(status?: OrderStatus): Promise<Order[]> {
    const filter = status ? { status } : {};
    return this.orderModel.find(filter).sort({ createdAt: -1 });
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Order> {
    const order = await this.findOne(id);

    const allowed = ALLOWED_TRANSITIONS[order.status];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from "${order.status}" to "${dto.status}"`,
      );
    }

    order.status = dto.status;
    order.statusHistory.push({
      status: dto.status,
      changedAt: new Date(),
      note: dto.note ?? '',
    });

    if (dto.status === OrderStatus.SHIPPED) order.shippedAt = new Date();
    if (dto.status === OrderStatus.DELIVERED) order.deliveredAt = new Date();

    return order.save();
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id, userId);

    const cancellable = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel an order with status "${order.status}"`,
      );
    }

    await Promise.all(
      order.items.map((item) =>
        this.productsService.updateStock(
          item.productId.toString(),
          item.quantity,
        ),
      ),
    );

    order.status = OrderStatus.CANCELLED;
    order.statusHistory.push({
      status: OrderStatus.CANCELLED,
      changedAt: new Date(),
      note: 'Cancelled by user',
    });

    return order.save();
  }

  async markAsPaid(id: string, transactionId: string): Promise<Order> {
    const order = await this.findOne(id);

    order.payment.status = PaymentStatus.PAID;
    order.payment.transactionId = transactionId;
    order.paidAt = new Date();

    return this.updateStatus(id, { status: OrderStatus.CONFIRMED });
  }

  async addTracking(id: string, dto: AddTrackingDto): Promise<Order> {
    const order = await this.findOne(id);

    order.tracking.carrier = dto.carrier;
    order.tracking.trackingNumber = dto.trackingNumber;
    if (dto.estimatedDelivery) {
      order.tracking.estimatedDelivery = new Date(dto.estimatedDelivery);
    }

    return this.updateStatus(id, { status: OrderStatus.SHIPPED });
  }

  private calculatePricing(items: OrderItem[]) {
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const shipping = subtotal >= 50 ? 0 : 5.99;
    const tax = parseFloat((subtotal * 0.1).toFixed(2));
    const discount = 0;
    const total = parseFloat((subtotal + shipping + tax - discount).toFixed(2));

    return { subtotal, shipping, tax, discount, total };
  }
}
