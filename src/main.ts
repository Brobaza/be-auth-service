import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AUTH_PROTO_SERVICE_PACKAGE_NAME } from './gen/auth.service';
import AppLoggerService from './libs/logger';

async function bootstrap() {
  const appModule = await NestFactory.create(AppModule);

  const configService = appModule.get(ConfigService);

  appModule.enableCors({
    origin: true,
    credentials: true,
  });

  appModule.use(helmet());

  appModule.use(cookieParser());

  await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      protoPath: join(process.cwd(), 'proto/auth.service.proto'),
      package: AUTH_PROTO_SERVICE_PACKAGE_NAME,
      url: configService.get('grpcUrl'),
    },
  });

  appModule.useLogger(appModule.get(AppLoggerService));

  appModule.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  appModule.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    }),
  );

  appModule.use(compression({ level: 6 }));

  await appModule.startAllMicroservices();

  await appModule.listen(configService.get<number>('port'));
}
bootstrap();
