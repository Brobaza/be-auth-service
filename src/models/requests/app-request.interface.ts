// import { Session } from '@/modules/sessions/entities/session.entity';
import { Request } from 'express';

export interface AppRequest extends Request {
  currentUserId: string;
  currentSessionId: string;
  skipVerification: boolean;
}
