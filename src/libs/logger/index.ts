import { ConsoleLogger, Injectable } from '@nestjs/common';
import { head } from 'lodash';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export default class AppLoggerService extends ConsoleLogger {
  private readonly winstonLogger: winston.Logger;

  constructor() {
    super();

    this.winstonLogger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss',
        }),
        winston.format.splat(),
        winston.format.printf((info) => {
          return `${info.timestamp} ${info.level}: ${JSON.stringify(info)}`;
        }),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          level: 'info',
          dirname: 'logs',
          filename: '%DATE%.jsonl',
          datePattern: 'MM-DD-YYYY',
          zippedArchive: true,
          maxSize: '10m',
          maxFiles: '14d',
        }),
      ],
    });
  }

  async log(message: string, context?: unknown, ...rest: unknown[]) {
    super.log(message, context, ...rest);
    this.winstonLogger.info(message, { context, ...rest });
  }

  async error(message: any, context?: unknown, ...rest: unknown[]) {
    super.error(message, context, ...rest);
    if (!context) context = head(rest);
    this.winstonLogger.error(message, { context });
  }
}
