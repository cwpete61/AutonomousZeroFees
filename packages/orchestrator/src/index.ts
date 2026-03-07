import { Module, Global } from '@nestjs/common';
import { OrchestratorService } from './engine/orchestrator.service';

@Global()
@Module({
    providers: [OrchestratorService],
    exports: [OrchestratorService],
})
export class OrchestratorModule { }
export * from './engine/orchestrator.service';
export * from './state-machine';
