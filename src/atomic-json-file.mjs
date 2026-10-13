export function replaceJsonFile(filePath, value, fsImpl, mode = 0o600) {
  if (typeof fsImpl.renameSync !== "function") {
    fsImpl.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, { mode });
    if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(filePath, mode);
    return;
  }
  const temporary = `${filePath}.${process.pid}.tmp`;
  fsImpl.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode });
  if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(temporary, mode);
  fsImpl.renameSync(temporary, filePath);
  if (typeof fsImpl.chmodSync === "function") fsImpl.chmodSync(filePath, mode);
}
