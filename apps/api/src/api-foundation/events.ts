import { EventEmitter } from "node:events";
import { logger } from "../shared/logger.js";

export interface IEvent {
  name: string;
  payload: unknown;
  timestamp: Date;
}

export interface IEventDispatcher {
  dispatch(event: IEvent): Promise<void>;
  subscribe(eventName: string, handler: (event: IEvent) => void | Promise<void>): void;
}

export class InMemoryEventDispatcher implements IEventDispatcher {
  private readonly emitter = new EventEmitter();

  public async dispatch(event: IEvent): Promise<void> {
    logger.debug(`Dispatching event: ${event.name}`, { payload: event.payload });
    this.emitter.emit(event.name, event);
  }

  public subscribe(eventName: string, handler: (event: IEvent) => void | Promise<void>): void {
    this.emitter.on(eventName, async (event: IEvent) => {
      try {
        await handler(event);
      } catch (error) {
        logger.error(`Error in event listener handler for event: ${eventName}`, error as Error);
      }
    });
  }
}

export class BackgroundTaskExecutor {
  public static run(name: string, task: () => Promise<void>): void {
    logger.info(`Starting background task: ${name}`);
    task().catch((error) => {
      logger.error(`Background task '${name}' failed execution`, error as Error);
    });
  }
}
