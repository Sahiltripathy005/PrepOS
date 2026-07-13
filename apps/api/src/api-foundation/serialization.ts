export function safeJsonStringify(value: unknown): string {
  return JSON.stringify(value, (_, val) => {
    if (typeof val === "bigint") {
      return val.toString();
    }
    return val;
  });
}

export function safeJsonParse<T = unknown>(jsonString: string): T {
  return JSON.parse(jsonString, (_, val) => {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
    if (typeof val === "string" && isoDateRegex.test(val)) {
      return new Date(val);
    }
    return val;
  });
}
