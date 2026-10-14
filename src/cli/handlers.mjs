import { createCoreHandlerMap } from "./core-handler-map.mjs";
import { createPlatformHandlerMap } from "./platform-handler-map.mjs";

export function createHandlerMap(handlers = {}) {
  return { ...createCoreHandlerMap(handlers), ...createPlatformHandlerMap(handlers) };
}
