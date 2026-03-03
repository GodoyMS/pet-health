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
    return new User(entity.id, entity.email, entity.name, entity.passwordHash);
  }

  async create(
    name: string,
    email: string,
    passwordHash: string
  ): Promise<User> {
    const entity = this.repo.create({ name, email, passwordHash });
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
}

