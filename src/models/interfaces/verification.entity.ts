import { isAfter } from 'date-fns';
import { VerificationType } from 'src/enums/verifycation.type';
import { BaseEntity } from 'src/libs/base/base.entity';
import { currentTime } from 'src/utils/helper';
import { Column, Entity, Index } from 'typeorm';

@Entity({ name: 'verifications' })
@Index(['code', 'token'], { unique: true })
export class Verification extends BaseEntity {
  @Column()
  code: string;

  @Column()
  token: string;

  @Column()
  credential: string;

  //   @ManyToOne(() => User, (user) => user.verifications, { onDelete: 'CASCADE' })
  //   @JoinColumn({ name: 'user_id' })
  //   user: User;
  @Column()
  userId: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  usedAt: Date;

  @Column({ type: 'enum', enum: Object.values(VerificationType) })
  type: VerificationType;

  isExpired() {
    return isAfter(currentTime(), this.expiresAt);
  }
}
