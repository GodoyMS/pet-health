import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UserOrmEntity } from "../infrastructure/typeorm/user.orm-entity";
import { User } from "../domain/user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: Repository<UserOrmEntity>
  ) {}

  private toDomain(entity: UserOrmEntity): User {
    return new User(
      entity.id,
      entity.email,
      entity.name,
      entity.passwordHash,
      entity.provider,
      entity.googleId,
      entity.role,
      entity.emailVerified
    );
  }

  async create(
    name: string,
    email: string,
    passwordHash: string,
    options?: { emailVerified?: boolean }
  ): Promise<User> {
    const entity = this.repo.create({
      name,
      email,
      passwordHash,
      provider: "email",
      emailVerified: options?.emailVerified ?? true
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async createOAuthUser(name: string, email: string, googleId: string): Promise<User> {
    const entity = this.repo.create({
      name,
      email,
      passwordHash: null,
      provider: "google",
      googleId,
      emailVerified: true
    });
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { googleId } });
    return entity ? this.toDomain(entity) : null;
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.repo.update({ id }, { passwordHash });
  }

  async markEmailVerified(id: string): Promise<User> {
    await this.repo.update({ id }, { emailVerified: true });
    const entity = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(entity);
  }

  async updateUnverifiedRegistration(
    id: string,
    name: string,
    passwordHash: string
  ): Promise<User> {
    await this.repo.update({ id }, { name, passwordHash, emailVerified: false });
    const entity = await this.repo.findOneOrFail({ where: { id } });
    return this.toDomain(entity);
  }

  /**
   * Permanently delete a user. All data owned by the user (pets, health logs,
   * AI reports, preventive-care items, Google Calendar tokens and sync records)
   * is removed automatically via `ON DELETE CASCADE` foreign keys.
   */
  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }
}
