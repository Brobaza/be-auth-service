import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { loadConfiguration } from './libs/config';
import { AuthService } from './services/auth.service';
import { Verification } from './models/interfaces/verification.entity';
import { Session } from './models/interfaces/session.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  MICROSERVICE_PACKAGE_NAME,
  MICROSERVICE_SERVICE_NAME,
  UserMicroServiceName,
} from './libs/constants/microservice.name';
import { join } from 'path';
import AppLoggerService from './libs/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [() => loadConfiguration()],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        return {
          type: 'postgres',
          host: configService.get<string>('postgres.host'),
          port: configService.get<number>('postgres.port'),
          username: configService.get<string>('postgres.username'),
          password: configService.get<string>('postgres.password'),
          database: configService.get<string>('postgres.database'),
          synchronize: !configService.get<boolean>('isProd'),
          dropSchema: false,
          logging: false,
          logger: 'advanced-console',
          autoLoadEntities: true,
          entities: [Verification, Session],
        };
      },
    }),

    TypeOrmModule.forFeature([Verification, Session]),

    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: MICROSERVICE_SERVICE_NAME.USER_SERVICE,
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            protoPath: join(__dirname, '../proto/user.service.proto'),
            package: MICROSERVICE_PACKAGE_NAME.USER_SERVICE,
            url: configService.get<string>('services.user.url'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AppLoggerService],
})
export class AppModule {}
