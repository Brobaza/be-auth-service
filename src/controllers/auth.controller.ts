import { Controller, Logger } from '@nestjs/common';
import { get } from 'lodash';
import { SessionType } from 'src/enums/session-type.enum';
import {
  AuthServiceController,
  AuthServiceControllerMethods,
  GetPublicKeyDTO,
  LoginDTO,
  LoginResp,
  LogoutDTO,
  PublicKeyResp,
  RegisterDTO,
  RegisterResp,
  SessionDTO,
  StatusDTO,
  TokenDTO,
  VerifyResp,
} from 'src/gen/auth.service';
import {
  ACCESS_TOKEN_PUBLIC_KEY,
  REFRESH_TOKEN_PUBLIC_KEY,
} from 'src/jwt/jwt.constraints';
import { AuthService } from 'src/services/auth.service';
import { SessionsService } from 'src/services/session.service';

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
  logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionsService,
  ) {}

  async getPublicKey(request: GetPublicKeyDTO): Promise<PublicKeyResp> {
    if (request.key === SessionType.ACCESS) {
      return { key: ACCESS_TOKEN_PUBLIC_KEY };
    }

    if (request.key === SessionType.REFRESH) {
      return { key: REFRESH_TOKEN_PUBLIC_KEY };
    }

    return { key: '' };
  }

  async login(data: LoginDTO): Promise<LoginResp> {
    try {
      const result = await this.authService.login(data);

      const { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt } =
        result;

      return {
        data: {
          accessToken,
          refreshToken,
          accessTokenExpireAt: accessExpiresAt.toISOString(),
          refreshTokenExpireAt: refreshExpiresAt.toISOString(),
        },
        metadata: { code: '200', message: 'OK', errMessage: '' },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        data: {
          accessToken: '',
          refreshToken: '',
          accessTokenExpireAt: '',
          refreshTokenExpireAt: '',
        },
        metadata: {
          code: '500',
          message: 'Internal Server Error',
          errMessage: error.message,
        },
      };
    }
  }

  async register(data: RegisterDTO): Promise<RegisterResp> {
    try {
      this.logger.log('Registering user...');

      const result = await this.authService.register(data);

      const {
        accessToken,
        refreshToken,
        accessExpiresAt,
        refreshExpiresAt,
        verifyToken,
      } = result;

      return {
        data: {
          accessToken,
          refreshToken,
          accessTokenExpireAt: accessExpiresAt.toISOString(),
          refreshTokenExpireAt: refreshExpiresAt.toISOString(),
          verifyToken,
        },
        metadata: { code: '200', message: 'OK', errMessage: '' },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        data: {
          accessToken: '',
          refreshToken: '',
          accessTokenExpireAt: '',
          refreshTokenExpireAt: '',
          verifyToken: '',
        },
        metadata: {
          code: '500',
          message: 'Internal Server Error',
          errMessage: error.message,
        },
      };
    }
  }

  async verifyAccessToken(token: TokenDTO): Promise<VerifyResp> {
    try {
      const result = await this.sessionService.verifyToken(
        token.token,
        SessionType.ACCESS,
      );

      return {
        data: {
          id: get(result, 'sessionId', ''),
          decodedUserId: get(result, 'userId', ''),
        },
        metadata: { code: '200', message: 'OK', errMessage: '' },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        data: { id: '', decodedUserId: '' },
        metadata: {
          code: '500',
          message: 'Internal Server Error',
          errMessage: error.message,
        },
      };
    }
  }

  async verifySession(request: SessionDTO): Promise<VerifyResp> {
    try {
      const result = await this.sessionService.verifySessionId(
        get(request, 'id', ''),
        get(request, 'type', SessionType.ACCESS) as SessionType,
      );

      return {
        data: {
          id: get(result, 'sessionId', ''),
          decodedUserId: get(result, 'userId', ''),
        },
        metadata: { code: '200', message: 'OK', errMessage: '' },
      };
    } catch (error) {
      this.logger.error(error);

      return {
        data: { id: '', decodedUserId: '' },
        metadata: {
          code: '500',
          message: 'Internal Server Error',
          errMessage: error.message,
        },
      };
    }
  }

  async logout(request: LogoutDTO): Promise<StatusDTO> {
    try {
      const { userId, sessionId, token } = request;

      const result = await this.authService.logout(userId, sessionId, token);

      if (get(result, 'success', false)) {
        return {
          code: '200',
          message: 'OK',
          errMessage: '',
        };
      }

      return {
        code: '500',
        message: 'Internal Server Error',
        errMessage: 'Failed to logout',
      };
    } catch (error) {
      this.logger.error(error);

      return {
        code: '500',
        message: 'Internal Server Error',
        errMessage: error.message,
      };
    }
  }
}
