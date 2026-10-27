export async function showCertificateCoverage({ cf, zoneId, outputJson, toJsonOutput, printer }) {
  const result = await cf.get(`/zones/${zoneId}/ssl/certificate_packs`);
  const packs = Array.isArray(result?.result) ? result.result : [];
  const coverage = new Map(
    packs
      .flatMap((pack) =>
        (pack.hosts || []).map((host) => ({ host, status: pack.status, type: pack.type })),
      )
      .map((item) => [item.host, item]),
  );
  const items = [...coverage.values()];
  const summary = {
    coverage: items,
    complete: items.every((item) => item.status === "active"),
  };
  return outputJson ? toJsonOutput(summary) : printer.log(JSON.stringify(summary, null, 2));
}
