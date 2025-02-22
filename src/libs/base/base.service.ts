/* eslint-disable @typescript-eslint/no-unused-vars */
import { NotFoundException } from '@nestjs/common';
import { isEmpty } from 'lodash';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { BaseEntity } from './base.entity';

export class BaseService<M extends BaseEntity> {
  constructor(protected readonly repository: Repository<M>) {}

  throwNotFound() {
    throw new NotFoundException();
  }

  async beforeCreate(data: DeepPartial<M>): Promise<void> {}

  async beforeUpdate(data: DeepPartial<M>): Promise<void> {}

  async create(data: DeepPartial<M>): Promise<{ id: string }> {
    await this.beforeCreate(data);

    const Record = await this.repository.save(this.repository.create(data));

    return { id: Record.id };
  }

  async findOne(condition: FindOneOptions<M>): Promise<M> {
    return this.repository.findOne(condition);
  }

  async findOneOrFail(condition: FindOneOptions<M>): Promise<M> {
    const record = await this.findOne(condition);

    if (isEmpty(record)) {
      this.throwNotFound();
    }

    return record;
  }

  async findById(id: string, ...relations: string[]): Promise<M> {
    return this.findOne({ where: { id } as any, relations });
  }

  async findByIdOrFail(id: string, ...relations: string[]) {
    return this.findOneOrFail({ where: { id } as any, relations });
  }

  async find(query: FindManyOptions<M>): Promise<M[]> {
    return this.repository.find(query);
  }

  async findAndCount(
    query: FindManyOptions<M>,
  ): Promise<{ items: M[]; total: number }> {
    const [items, total] = await this.repository.findAndCount(query);

    return { items, total };
  }

  async existsBy(condition: FindOneOptions<M>): Promise<boolean> {
    return this.repository.exists(condition);
  }

  async existsById(id: string): Promise<boolean> {
    return this.repository.existsBy({ id } as any);
  }

  async updateById(id: string, data: DeepPartial<M>): Promise<void> {
    await this.beforeUpdate(data);

    const exists = await this.existsById(id);

    if (!exists) {
      throw new NotFoundException();
    }

    await this.repository.update(id, data as any);
  }

  async updateBy(
    where: FindOptionsWhere<M> | FindOptionsWhere<M>[],
    data: DeepPartial<M>,
  ): Promise<void> {
    await this.beforeUpdate(data);

    const exists = await this.repository.existsBy(where);

    if (!exists) {
      throw new NotFoundException();
    }

    await this.repository.update(where as any, data as any);
  }

  async softDeleteById(id: string): Promise<void> {
    const exists = await this.existsById(id);

    if (!exists) {
      throw new NotFoundException();
    }

    await this.repository.softDelete(id);
  }

  async softDelete(condition: FindOptionsWhere<M>): Promise<void> {
    await this.repository.softDelete(condition as any);
  }

  async restoreById(id: string): Promise<void> {
    const exists = await this.existsById(id);

    if (!exists) {
      throw new NotFoundException();
    }

    await this.repository.restore(id);
  }

  async restore(condition: FindOptionsWhere<M>): Promise<void> {
    await this.repository.restore(condition as any);
  }

  async destroyById(id: string): Promise<void> {
    const exists = await this.existsById(id);

    if (!exists) {
      throw new NotFoundException();
    }

    await this.repository.delete(id);
  }

  async destroy(condition: FindOptionsWhere<M>): Promise<void> {
    await this.repository.delete(condition as any);
  }

  async findBySlug(slug: string, ...relations: string[]): Promise<M> {
    return this.findOne({ where: { slug } as any, relations });
  }
}
