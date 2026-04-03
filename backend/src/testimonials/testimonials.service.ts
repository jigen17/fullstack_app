import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Testimonial,
  TestimonialDocument,
} from 'src/schemes/testmonial.schema';
import { ProductsService } from 'src/products/products.service';
import { UsersService } from 'src/users/users.service';
import { CreateTestimonialDto } from 'src/dtos/create-testimonial.dto';
@Injectable()
export class TestimonialsService {
  constructor(
    @InjectModel(Testimonial.name)
    private testimonialModel: Model<TestimonialDocument>,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {}

  async createTestimonial(
    dto: CreateTestimonialDto,
    userId: string,
  ): Promise<Testimonial> {
    const user = await this.usersService.findOne(userId);
    const product = await this.productsService.findOne(dto.productId);
    if (!(user && product)) throw new NotFoundException('User not found');
    return this.testimonialModel.create({
      ...dto,
      userId,
    });
  }
}
