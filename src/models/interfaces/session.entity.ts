import { isAfter } from 'date-fns';
import { BaseEntity } from 'src/libs/base/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'sessions' })
export class Session extends BaseEntity {
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  //   @ManyToOne(() => User, (user) => user.sessions)
  //   @JoinColumn({ name: 'userId' })
  //   user: User;
  @Column()
  userId: string;

  isExpired() {
    return isAfter(new Date(), this.expiresAt);
  }
}
