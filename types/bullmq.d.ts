declare module "bullmq" {
  export type JobsOptions = {
    repeat?: { every?: number } | null;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
  } & Record<string, unknown>;

  export class Queue<T = unknown> {
    constructor(name: string, opts?: Record<string, unknown>);
    add(name: string, data: T, opts?: JobsOptions): Promise<void>;
  }

  export class Worker<T = unknown> {
    constructor(name: string, processor: (job: T) => Promise<void> | void, opts?: Record<string, unknown>);
  }

  export class QueueScheduler {
    constructor(name: string, opts?: Record<string, unknown>);
  }
}
