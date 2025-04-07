import { ReflectionService } from '@grpc/reflection';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
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

  appModule.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      protoPath: join(process.cwd(), 'proto/auth.service.proto'),
      package: AUTH_PROTO_SERVICE_PACKAGE_NAME,
      url: configService.get('grpcUrl'),
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
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

  const port = configService.get<number>('port');

  await appModule.listen(port, () => {
    const logger: Logger = new Logger('Server connection');
    logger.log(
      `🔒Auth service has started successfully running on port ${port}`,
    );
  });
}
bootstrap();
