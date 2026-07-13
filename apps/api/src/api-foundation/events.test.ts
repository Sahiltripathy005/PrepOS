import { describe, it, expect, vi } from "vitest";
import { InMemoryEventDispatcher } from "./events.js";

describe("Event Dispatcher", () => {
  it("should trigger subscribers when dispatching events", async () => {
    const dispatcher = new InMemoryEventDispatcher();
    const handler = vi.fn();

    dispatcher.subscribe("user.created", handler);

    const event = {
      name: "user.created",
      payload: { id: "123" },
      timestamp: new Date()
    };

    await dispatcher.dispatch(event);

    expect(handler).toHaveBeenCalledWith(event);
  });
});
