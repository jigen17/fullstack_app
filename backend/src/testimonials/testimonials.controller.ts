import { Controller, Request, UseGuards, Post, Body } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateTestimonialDto } from 'src/dtos/create-testimonial.dto';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private testimonialsService: TestimonialsService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTestimonialDto, @Request() req) {
    return this.testimonialsService.createTestimonial(dto, req.user._id);
  }
}
