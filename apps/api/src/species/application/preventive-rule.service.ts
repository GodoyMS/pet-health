import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PreventiveRuleOrmEntity } from '../infrastructure/typeorm/preventive-rule.orm-entity';

@Injectable()
export class PreventiveRuleService {
  constructor(
    @InjectRepository(PreventiveRuleOrmEntity)
    private readonly repo: Repository<PreventiveRuleOrmEntity>,
  ) {}

  create(data: Partial<PreventiveRuleOrmEntity>) {
    const rule = this.repo.create(data);
    return this.repo.save(rule);
  }

  findAll() {
    return this.repo.find({ relations: ['species'] });
  }

  findOne(id: string) {
    return this.repo.findOne({
      where: { id },
      relations: ['species'],
    });
  }

  update(id: string, data: Partial<PreventiveRuleOrmEntity>) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}