import { IsMongoId, IsNotEmpty } from 'class-validator';

export class WishlistItemDto {
  @IsMongoId()
  @IsNotEmpty()
  productId: string;
}
