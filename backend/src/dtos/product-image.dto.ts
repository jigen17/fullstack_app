import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class ProductImageDto {
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  alt?: string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
