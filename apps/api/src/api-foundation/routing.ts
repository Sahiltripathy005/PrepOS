import { Router, Request, Response, NextFunction } from "express";

export interface RouteMetadata {
  method: "get" | "post" | "put" | "delete" | "patch";
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestSchema?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseSchema?: any;
}

export class RouterRegistry {
  private static readonly routes: RouteMetadata[] = [];
  private static readonly v1Router = Router();

  public static register(
    meta: RouteMetadata,
    ...handlers: Array<(req: Request, res: Response, next: NextFunction) => void | Promise<void>>
  ): void {
    this.routes.push(meta);
    this.v1Router[meta.method](meta.path, ...handlers);
  }

  public static getV1Router(): Router {
    return this.v1Router;
  }

  public static getRoutesMetadata(): RouteMetadata[] {
    return this.routes;
  }
}
