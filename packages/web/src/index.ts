import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const app = new Hono();

app.get("/download", async (c) => {
  const publicPath = join(import.meta.dirname, "public", "daycode.exe");
  const cliPath = join(import.meta.dirname, "..", "..", "cli", "daycode.exe");

  const filePath = existsSync(publicPath) ? publicPath : cliPath;

  if (!existsSync(filePath)) {
    return c.text("daycode.exe not found. Build the CLI package first with `bun run --cwd packages/cli build`.", 404);
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

app.use("/*", serveStatic({ root: "./src/public" }));

export default { port: 8080, fetch: app.fetch };
