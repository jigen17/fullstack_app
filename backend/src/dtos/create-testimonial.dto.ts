import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @IsNotEmpty()
  productId: string;
  @IsString()
  @IsNotEmpty()
  comment: string;
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  rating: number;
}
