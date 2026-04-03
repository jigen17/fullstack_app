import { IsString, IsOptional, IsDateString } from 'class-validator';

export class AddTrackingDto {
  @IsString()
  carrier: string;

  @IsString()
  trackingNumber: string;

  @IsDateString()
  @IsOptional()
  estimatedDelivery?: string;
}
