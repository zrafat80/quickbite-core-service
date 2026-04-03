// src/address/address.controller.ts
import { Controller, Post, Body, Req, UseGuards, Get, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { Request } from 'express';
import { AddressService } from './address.service';
import { CreateAddressDTO } from './dto/create-address.dto';
import { JwtAuthGuard } from 'src/common/middleware/guard';
import { UpdateAddressDTO } from './dto/update-address.dto';
@Controller('customer/addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}
  @Get()
  @UseGuards(JwtAuthGuard) // 🔒 Locked down!
  async getAddresses(@Req() req: Request) {
    // Extract user ID from the secure cookie
    const userId = (req as any).user?.userId;

    return this.addressService.getAddresses(userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAddress(@Req() req: Request, @Body() body: CreateAddressDTO) {
    const userId = (req as any).user?.userId;

    return this.addressService.createAddress(userId, body);
  }
  @Patch(':addressId')
  @UseGuards(JwtAuthGuard) // 🔒 Locked down!
  async updateAddress(
    @Req() req: Request,
    @Param('addressId', ParseIntPipe) addressId: number, // 🪄 Auto-converts string "5" to number 5
    @Body() body: UpdateAddressDTO,
  ) {
    // Extract user ID from the secure httpOnly cookie
    const userId = (req as any).user?.userId;

    // Pass everything straight to the service
    return this.addressService.updateAddress(userId, addressId, body);
  }
  @Delete(':addressId')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(
    @Req() req: Request,
    @Param('addressId', ParseIntPipe) addressId: number
  ) {
    const userId = (req as any).user?.userId;
    return this.addressService.deleteAddress(userId, addressId);
  }
}
