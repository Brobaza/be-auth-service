import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from './session.service';
import { VerificationService } from './verification.service';
import { createUserDto } from 'src/models/requests/create-user.request';
import { RegisterResponse } from 'src/models/response/register.response';
import { ErrorDictionary } from 'src/enums/error.dictionary';
import { USER_SERVICE_NAME, UserServiceClient } from 'src/gen/user.service';
import { ClientGrpcProxy } from '@nestjs/microservices';
import { MICROSERVICE_SERVICE_NAME } from 'src/libs/constants/microservice.name';
import { firstValueFrom } from 'rxjs';
import { get, isEmpty } from 'lodash';
import { VerificationType } from 'src/enums/verifycation.type';
import { LoginRequest } from 'src/models/requests/login-request.interface';
import { LoginResponse } from 'src/models/response/login.response';
import { OK_RESPONSE } from 'src/utils/constants';

@Injectable()
export class AuthService {
  private userDomain: UserServiceClient;
  logger = new Logger(AuthService.name);

  constructor(
    private readonly sessionService: SessionsService,
    private readonly verificationService: VerificationService,

    @Inject(MICROSERVICE_SERVICE_NAME.USER_SERVICE)
    private readonly client: ClientGrpcProxy,
  ) {}

  onModuleInit() {
    this.userDomain =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async register(dto: createUserDto): Promise<RegisterResponse> {
    const { email, phoneNumber } = dto;

    const isTakenEmail = await firstValueFrom(
      this.userDomain.isTakenEmail({ email }),
    );

    this.logger.log('isTakenEmail: ', isTakenEmail);

    if (isTakenEmail.isTaken) {
      throw new ConflictException({
        code: ErrorDictionary.EMAIL_ALREADY_TAKEN,
      });
    }

    const isTakenPhoneNumber = await firstValueFrom(
      this.userDomain.isTakenPhoneNumber({
        phoneNumber,
      }),
    );

    this.logger.log('isTakenPhoneNumber: ', isTakenPhoneNumber);

    if (isTakenPhoneNumber.isTaken) {
      throw new ConflictException({
        code: ErrorDictionary.PHONE_NUMBER_ALREADY_TAKEN,
      });
    }

    const {
      id: userId,
      code,
      errMessage,
    } = await firstValueFrom(
      this.userDomain.createUser({
        name: get(dto, 'name', ''),
        email: get(dto, 'email', ''),
        phoneNumber: get(dto, 'phoneNumber', ''),
        location: get(dto, 'location', ''),
        gender: get(dto, 'gender', 'unknown'),
        password: get(dto, 'password', ''),
      }),
    );

    this.logger.log('createUser id: ', userId);

    if (code !== '200' || !isEmpty(errMessage)) {
      throw new ConflictException({
        code: ErrorDictionary.BAD_REQUEST,
      });
    }

    const { token: verifyToken } = await this.verificationService.generate(
      userId,
      VerificationType.EMAIL_REGISTER,
      email,
    );

    // this.queueDomain.sendUserActivityEvent({
    //   userId,
    //   activity: UserActivity.REGISTERED,
    // });

    const { accessExpiresAt, accessToken, refreshExpiresAt, refreshToken } =
      await this.sessionService.generate(userId);

    return {
      verifyToken,
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
    };
  }

  async login({ username, password }: LoginRequest): Promise<LoginResponse> {
    const { id, code, errMessage } = await firstValueFrom(
      this.userDomain.getUserByUserName({
        username,
        password,
      }),
    );

    if (code !== '200' || !isEmpty(errMessage)) {
      throw new UnauthorizedException({
        code: errMessage,
      });
    }

    const result = await this.sessionService.generate(id);

    return result;
  }

  async logout(userId: string, sessionId: string, token: string) {
    await this.sessionService.delete({ sessionId, userId, accessToken: token });
    return OK_RESPONSE;
  }
}
