import { ApiProperty } from '@nestjs/swagger';
import { LoginResponse } from './login.response';

export class RegisterResponse extends LoginResponse {
  @ApiProperty({ example: 'RDBrV3EQHxB1byrBnwSeLTWHKIamkd99j2Bf' })
  verifyToken: string;
}
