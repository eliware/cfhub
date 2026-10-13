import { makeSimpleResource } from "../handlers/simple-resource.mjs";

export const simpleHandlers = {
  loadBalancer: makeSimpleResource({
    name: "load-balancer",
    scope: "zone",
    path: (id) => `/zones/${id}/load_balancers`,
  }),
  tunnel: makeSimpleResource({
    name: "tunnel",
    scope: "account",
    path: (id) => `/accounts/${id}/cfd_tunnel`,
  }),
  workers: makeSimpleResource({
    name: "workers",
    scope: "account",
    path: (id) => `/accounts/${id}/workers/scripts`,
  }),
  pages: makeSimpleResource({
    name: "pages",
    scope: "account",
    path: (id) => `/accounts/${id}/pages/projects`,
  }),
  r2: makeSimpleResource({
    name: "r2",
    scope: "account",
    path: (id) => `/accounts/${id}/r2/buckets`,
  }),
  d1: makeSimpleResource({
    name: "d1",
    scope: "account",
    path: (id) => `/accounts/${id}/d1/database`,
  }),
  queues: makeSimpleResource({
    name: "queues",
    scope: "account",
    path: (id) => `/accounts/${id}/queues`,
  }),
  stream: makeSimpleResource({
    name: "stream",
    scope: "account",
    path: (id) => `/accounts/${id}/stream`,
  }),
  images: makeSimpleResource({
    name: "images",
    scope: "account",
    path: (id) => `/accounts/${id}/images/v1`,
  }),
  ai: makeSimpleResource({ name: "ai", scope: "account", path: (id) => `/accounts/${id}/ai` }),
  access: makeSimpleResource({
    name: "access",
    scope: "account",
    path: (id) => `/accounts/${id}/access/apps`,
  }),
};
