export async function flushTerminalPager(lines, pager, spawnImpl) {
  if (!pager || lines.length === 0) return;
  await new Promise((resolve, reject) => {
    const child = spawnImpl(pager, [], { stdio: ["pipe", "inherit", "inherit"] });
    child.once("error", reject);
    child.once("close", (code) =>
      code === 0 || code === null
        ? resolve()
        : reject(new Error(`Pager exited with status ${code}`)),
    );
    child.stdin.on("error", (error) => {
      if (error.code !== "EPIPE") reject(error);
    });
    child.stdin.end(`${lines.join("\n")}\n`);
  });
}
