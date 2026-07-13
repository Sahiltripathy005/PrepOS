import { logger } from "../shared/logger.js";

export interface ApiMetric {
  path: string;
  method: string;
  statusCode: number;
  durationMs: number;
  error?: string;
}

export class ObservabilityRegistry {
  private static readonly metrics: ApiMetric[] = [];

  public static recordMetric(metric: ApiMetric): void {
    this.metrics.push(metric);
    logger.debug("API Metric recorded", {
      path: metric.path,
      method: metric.method,
      statusCode: metric.statusCode,
      durationMs: metric.durationMs,
      error: metric.error
    });
  }

  public static getMetrics(): ApiMetric[] {
    return this.metrics;
  }

  public static getAverageLatency(path?: string): number {
    const filtered = path ? this.metrics.filter((m) => m.path === path) : this.metrics;
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, m) => acc + m.durationMs, 0);
    return sum / filtered.length;
  }

  public static getErrorRate(path?: string): number {
    const filtered = path ? this.metrics.filter((m) => m.path === path) : this.metrics;
    if (filtered.length === 0) return 0;
    const errors = filtered.filter((m) => m.statusCode >= 400).length;
    return errors / filtered.length;
  }
}
