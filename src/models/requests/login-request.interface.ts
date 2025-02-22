import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginRequest {
  @ApiProperty({ example: 'admin001@gmail.com' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: '123123' })
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
