import { IsEnum, IsString, IsOptional } from 'class-validator';
import { OrderStatus } from 'src/schemes/order.schema';
export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  @IsOptional()
  note?: string;
}
