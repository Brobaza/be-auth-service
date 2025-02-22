import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity as TypeOrmBaseEntity,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @ApiProperty({ example: 'ffc1e8fe-8a25-4f55-be5b-622d8f07643b' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 1 })
  @VersionColumn()
  version: number;

  @ApiProperty({ example: '2021-08-01T00:00:00.000Z' })
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => `CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'`,
  })
  createdAt: Date;

  @ApiProperty({ example: '2021-08-01T00:00:00.000Z' })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => `CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'`,
    onUpdate: `CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh'`,
  })
  updatedAt: Date;

  @ApiProperty({ example: null })
  @DeleteDateColumn({
    type: 'timestamptz',
  })
  deletedAt: Date;
}
