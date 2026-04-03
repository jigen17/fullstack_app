import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { JwtPayloadDto } from 'src/dtos/current-user.dto';
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() req: JwtPayloadDto) {
    return this.usersService.findOne(req.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() req: JwtPayloadDto, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.sub, dto);
  }

  @Delete('me')
  deleteMe(@CurrentUser() req: JwtPayloadDto) {
    return this.usersService.softDelete(req.sub);
  }

  @Get('me/wishlist')
  getWishlist(@CurrentUser() req: JwtPayloadDto) {
    return this.usersService.getWishlist(req.sub);
  }

  @Post('me/wishlist')
  addToWishlist(
    @CurrentUser() req: JwtPayloadDto,
    @Body('productId') productId: string,
  ) {
    return this.usersService.addToWishlist(req.sub, productId);
  }

  @Delete('me/wishlist/:productId')
  removeFromWishlist(
    @CurrentUser() req: JwtPayloadDto,
    @Param('productId') productId: string,
  ) {
    return this.usersService.removeFromWishlist(req.sub, productId);
  }
}
