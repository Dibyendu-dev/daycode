import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const projectRoot = join(import.meta.dirname, "..");
const publicDir = join(projectRoot, "src", "public");
const cliDir = join(projectRoot, "..", "cli");

const app = new Hono();

app.get("/download", async (c) => {
  const exeName = existsSync(join(publicDir, "daycode.exe")) ? "daycode.exe" : "daycode";
  const publicPath = join(publicDir, exeName);
  const cliFallback = existsSync(join(cliDir, "daycode.exe"))
    ? join(cliDir, "daycode.exe")
    : join(cliDir, "daycode");

  const filePath = existsSync(publicPath) ? publicPath : cliFallback;

  if (!existsSync(filePath)) {
    return c.text("daycode binary not found. Ensure the CLI is built first.", 404);
  }

  const file = await readFile(filePath);
  const stat = await import("node:fs").then((fs) => fs.promises.stat(filePath));

  return new Response(file, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="daycode.exe"',
      "Content-Length": String(stat.size),
    },
  });
});

app.use("/*", serveStatic({ root: publicDir }));

export default { port: 8080, fetch: app.fetch };
