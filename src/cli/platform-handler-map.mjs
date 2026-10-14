import { simpleHandlers } from "./simple-handlers.mjs";

export function createPlatformHandlerMap(handlers = {}) {
  return {
    "load-balancer": handlers.loadBalancer || simpleHandlers.loadBalancer,
    tunnel: handlers.tunnel || simpleHandlers.tunnel,
    workers: handlers.workers || simpleHandlers.workers,
    pages: handlers.pages || simpleHandlers.pages,
    r2: handlers.r2 || simpleHandlers.r2,
    d1: handlers.d1 || simpleHandlers.d1,
    queues: handlers.queues || simpleHandlers.queues,
    stream: handlers.stream || simpleHandlers.stream,
    images: handlers.images || simpleHandlers.images,
    ai: handlers.ai || simpleHandlers.ai,
    access: handlers.access || simpleHandlers.access,
  };
}
