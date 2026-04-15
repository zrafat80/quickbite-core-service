// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { User } from './entity/user.entity';
import { USER_ERRORS, USER_MESSAGES } from './user.constants';
import { UpdateProfileDTO } from './dto/user-profile.dto';
import { Knex } from 'knex';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  // Expose a clean method to check if a user exists
  async checkUserExists(
    email: string,
    phone: string,
    trx?: Knex.Transaction,
  ): Promise<boolean> {
    return this.userRepo.findUserExistsByEmailOrPhone(email, phone);
  }

  // Expose a clean method to create a user
  async createUser(
    userData: Partial<User>,
    trx?: Knex.Transaction,
  ): Promise<User> {
    return this.userRepo.createUser(userData, trx);
  }

  // We will need this one for the login route next!
  async findUserByEmail(
    email: string,
    trx?: Knex.Transaction,
  ): Promise<User | undefined> {
    return this.userRepo.findUserByEmail(email, trx);
  }
  async updatePassword(id: number, password: string, trx?: Knex.Transaction) {
    this.userRepo.updateUserPassword(id, password, trx);
  }
  async getByUserId(userId: number) {
    const user = await this.userRepo.findUserById(userId);

    if (!user) {
      // You can import AUTH_ERRORS here, or just use a clear string
      throw new NotFoundException(USER_ERRORS.USER_NOT_FOUND);
    }

    // Return the clean, sanitized profile
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      systemRole: user.systemRole,
    };
  }
  async updateProfile(userId: number, data: UpdateProfileDTO) {
    // 1. Update the database
    await this.userRepo.updateProfile(userId, data);

    // 2. Fetch the fresh, updated user profile using your existing method!
    const updatedUser = await this.getByUserId(userId);

    // 3. Return the exact JSON structure your frontend expects
    return {
      message: USER_MESSAGES.PROFILE_UPDATED,
      user: updatedUser,
    };
  }
}
