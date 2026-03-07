import { Logger } from '@nestjs/common';
import { Job } from 'bull';

export abstract class BaseProcessor {
    protected readonly logger: Logger;

    constructor(processorName: string) {
        this.logger = new Logger(processorName);
    }

    /**
     * Universal error handler for job processing.
     */
    protected handleFailure(job: Job, error: any) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
        // In production, emit to Error Agent or alerting system here
    }

    /**
     * Universal progress reporter.
     */
    protected reportProgress(job: Job, progress: number) {
        job.progress(progress);
        this.logger.debug(`Job ${job.id} progress: ${progress}%`);
    }
}
