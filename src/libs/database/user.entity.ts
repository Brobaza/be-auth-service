import { ApiProperty } from '@nestjs/swagger';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { Exclude } from 'class-transformer';
import { BaseEntity } from 'src/libs/base/base.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @ApiProperty({ example: 'Jaydon Frankie' })
  @Column()
  displayName: string;

  @ApiProperty({ example: 'https://example.com/avatar.png' })
  @Column({ nullable: true })
  photoURL?: string;

  @ApiProperty({ example: '+1 416-555-0198' })
  @Column()
  phoneNumber: string;

  @ApiProperty({ example: 'Canada' })
  @Column({ nullable: true })
  country?: string;

  @ApiProperty({ example: '90210 Broadway Blvd' })
  @Column({ nullable: true })
  address?: string;

  @ApiProperty({ example: 'California' })
  @Column({ nullable: true })
  state?: string;

  @ApiProperty({ example: 'San Francisco' })
  @Column({ nullable: true })
  city?: string;

  @ApiProperty({ example: '94116' })
  @Column({ nullable: true })
  zipCode?: string;

  @ApiProperty({ example: 'Short bio about the user' })
  @Column({ nullable: true })
  about?: string;

  @ApiProperty({ example: 'admin' })
  @Column({ nullable: true })
  role?: string;

  @ApiProperty({ example: true })
  @Column({ default: false })
  isPublic?: boolean;

  @ApiProperty({ example: 'admin001@gmail.com' })
  @Column({ unique: true })
  @Index()
  email: string;

  @ApiProperty({ example: 'Male' })
  @Column({ nullable: true })
  gender?: string;

  @ApiProperty({ example: '@demo1' })
  @Column()
  @Exclude()
  password: string;

  @BeforeInsert()
  @BeforeUpdate()
  beforeSave() {
    if (this.password) {
      this.password = this.hashPassword(this.password);
    }
  }

  hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }

  comparePassword(password: string) {
    return compareSync(password, this.password);
  }
}
