import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { DomainEvent, EventHandler } from './index';

@Injectable()
export class RedisEventBus implements OnModuleDestroy {
    private readonly publisher: Redis;
    private readonly subscriber: Redis;
    private readonly logger = new Logger(RedisEventBus.name);
    private readonly handlers = new Map<string, EventHandler[]>();

    constructor(private configService: ConfigService) {
        const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        this.publisher = new Redis(redisUrl);
        this.subscriber = new Redis(redisUrl, {
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
        });

        this.subscriber.on('message', (channel, message) => {
            this.handleIncomingMessage(channel, message);
        });
    }

    async publish<T>(event: DomainEvent<T>): Promise<void> {
        const channel = event.eventType;
        const message = JSON.stringify(event);

        await this.publisher.publish(channel, message);
        this.logger.debug(`Event published to channel ${channel}`);
    }

    async subscribe(eventType: string, handler: EventHandler): Promise<void> {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
            await this.subscriber.subscribe(eventType);
            this.logger.log(`Subscribed to event type: ${eventType}`);
        }

        this.handlers.get(eventType)?.push(handler);
    }

    private async handleIncomingMessage(channel: string, message: string) {
        const handlers = this.handlers.get(channel);
        if (!handlers || handlers.length === 0) return;

        try {
            const event: DomainEvent = JSON.parse(message);
            await Promise.all(handlers.map(handler => handler(event)));
        } catch (error) {
            this.logger.error(`Error handling event from channel ${channel}:`, error);
        }
    }

    async onModuleDestroy() {
        await this.publisher.quit();
        await this.subscriber.quit();
    }
}
