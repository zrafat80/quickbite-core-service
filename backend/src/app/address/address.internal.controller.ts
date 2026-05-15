import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { RequireInternalApiKeyGuard } from 'src/lib/middleware/guards/internal-api-key.guard';

@Controller('internal/customer-addresses')
export class AddressInternalController {
  constructor(private readonly addressService: AddressService) {}

  @Get(':addressId')
  @UseGuards(RequireInternalApiKeyGuard)
  async getById(@Param('addressId', ParseIntPipe) addressId: number) {
    return this.addressService.findInternalById(addressId);
  }
}
