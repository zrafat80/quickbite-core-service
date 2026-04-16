// src/app/address/address.module.ts
import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { AddressRepository } from './repository/address.repository';

@Module({
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
  exports: [AddressService],
})
export class AddressModule {}
