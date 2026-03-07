import { Module, Global } from '@nestjs/common';
import { RedisEventBus } from './redis-event-bus.service';

@Global()
@Module({
    providers: [RedisEventBus],
    exports: [RedisEventBus],
})
export class EventsModule { }
