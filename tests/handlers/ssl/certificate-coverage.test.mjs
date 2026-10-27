import { jest } from "@jest/globals";
import { showCertificateCoverage } from "../../../src/handlers/ssl/certificate-coverage.mjs";

const base = (result, overrides = {}) => ({
  cf: { get: jest.fn().mockResolvedValue(result) },
  zoneId: "z1",
  outputJson: true,
  toJsonOutput: jest.fn(),
  printer: { log: jest.fn() },
  ...overrides,
});

test("projects active certificate pack coverage and removes duplicate hosts", async () => {
  const ctx = base({
    result: [
      { hosts: ["example.com", "example.com"], status: "active", type: "universal" },
      { hosts: ["example.com"], status: "active", type: "advanced" },
    ],
  });
  await showCertificateCoverage(ctx);
  expect(ctx.cf.get).toHaveBeenCalledWith("/zones/z1/ssl/certificate_packs");
  expect(ctx.toJsonOutput).toHaveBeenCalledWith({
    coverage: [{ host: "example.com", status: "active", type: "advanced" }],
    complete: true,
  });
});

test("marks non-active certificate packs as incomplete", async () => {
  const ctx = base({
    result: [{ hosts: ["example.com"], status: "pending", type: "advanced" }],
  });
  await showCertificateCoverage(ctx);
  expect(ctx.toJsonOutput).toHaveBeenCalledWith({
    coverage: [{ host: "example.com", status: "pending", type: "advanced" }],
    complete: false,
  });
});

test("prints text and handles missing packs or hosts", async () => {
  const printer = { log: jest.fn() };
  await showCertificateCoverage(base({}, { outputJson: false, printer }));
  expect(printer.log).toHaveBeenCalledWith(
    JSON.stringify({ coverage: [], complete: true }, null, 2),
  );

  const noHosts = base({ result: [{ status: "active" }] });
  await showCertificateCoverage(noHosts);
  expect(noHosts.toJsonOutput).toHaveBeenCalledWith({ coverage: [], complete: true });
});
