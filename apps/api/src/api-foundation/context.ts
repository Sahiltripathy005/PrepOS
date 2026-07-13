import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  correlationId: string;
  traceId: string;
  userId?: string;
  locale?: string;
  timezone?: string;
  startTime: number;
}

export const contextStorage = new AsyncLocalStorage<RequestContext>();

export class ApiContext {
  public static get(): RequestContext | undefined {
    return contextStorage.getStore();
  }

  public static getCorrelationId(): string {
    return this.get()?.correlationId ?? "unknown";
  }

  public static getUserId(): string | undefined {
    return this.get()?.userId;
  }

  public static getLocale(): string {
    return this.get()?.locale ?? "en";
  }

  public static getTimezone(): string {
    return this.get()?.timezone ?? "UTC";
  }
}
