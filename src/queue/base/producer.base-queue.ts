import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord, logLevel } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private kafkaClient: Kafka;
  private producer: Producer;
  private logger = new Logger('ProducerService');

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.kafkaClient = new Kafka({
      clientId: this.configService.get<string>('kafka.clientId'),
      brokers: this.configService.get<string[]>('kafka.brokers'),
      logLevel: logLevel.INFO,
      retry: {
        retries: 5,
        initialRetryTime: 300,
      },
      ...(this.configService.get<boolean>('kafka.useSSL') && {
        ssl: true,
      }),
      ...(this.configService.get<boolean>('kafka.useSASL') && {
        sasl: {
          mechanism: 'plain',
          username: this.configService.get<string>('kafka.sasl.username'),
          password: this.configService.get<string>('kafka.sasl.password'),
        },
      }),
    });

    this.producer = this.kafkaClient.producer({
      allowAutoTopicCreation: false,
      transactionTimeout: 30000,
      maxInFlightRequests: 5,
      idempotent: true,
    });

    await this.producer.connect();
    this.logger.log('Kafka Producer connected');

    this.producer.on('producer.connect', () => {
      this.logger.log('Kafka Producer connected');
    });

    this.producer.on('producer.disconnect', () => {
      this.logger.warn('Kafka Producer disconnected');
    });

    this.producer.on('producer.network.request', (request) => {
      this.logger.log('Producer request: ', JSON.stringify(request));
    });

    this.producer.on('producer.network.request_queue_size', (size) => {
      this.logger.log('Producer request queue size: ', JSON.stringify(size));
    });

    this.producer.on('producer.network.request_timeout', (timeout) => {
      this.logger.warn('Producer request timeout: ', JSON.stringify(timeout));
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    this.logger.log('Kafka Producer disconnected');
  }

  async produce(record: ProducerRecord) {
    try {
      const responses = await this.producer.send({
        topic: record.topic,
        messages: record.messages,
        compression: 1,
      });
      this.logger.log(
        `Message sent to ${record.topic}`,
        JSON.stringify(responses),
      );
    } catch (error) {
      this.logger.error('Error sending message to Kafka', error);
    }
  }
}
