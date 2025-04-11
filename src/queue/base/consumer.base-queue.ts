import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, ConsumerRunConfig, ConsumerSubscribeTopics, Kafka } from 'kafkajs';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafkaClient: Kafka;
  private consumers: Map<string | RegExp, Consumer> = new Map();

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.kafkaClient = new Kafka({
      brokers: this.configService.get<string[]>('kafka.brokers'),
      clientId: this.configService.get<string>('kafka.groupId'),
    });
  }

  async onModuleDestroy() {
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const topicName = topic.topics[0];
    const consumer = this.kafkaClient.consumer({
      groupId: this.configService.get<string>('kafka.groupId'),
    });

    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run({
      ...config,
      autoCommit: false,
    });

    this.consumers.set(topicName, consumer);
  }

  async commitOffset(topic: string, partition: number, offset: string) {
    const consumer = this.consumers.get(topic);
    if (!consumer) {
      throw new Error(`No consumer found for topic ${topic}`);
    }

    await consumer.commitOffsets([{ topic, partition, offset: (Number(offset) + 1).toString() }]);
  }
}
