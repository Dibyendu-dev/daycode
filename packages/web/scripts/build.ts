import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { spawnSync } from "node:child_process";

const scriptsDir = import.meta.dirname;
const webDir = join(scriptsDir, "..");
const cliDir = join(scriptsDir, "..", "..", "cli");
const publicDir = join(webDir, "src", "public");

const result = spawnSync("bun", ["run", "--cwd", cliDir, "build"], {
  stdio: "inherit",
  shell: true,
});

if (result.status !== 0) {
  console.error("CLI build failed");
  process.exit(1);
}

const binaries = readdirSync(cliDir).filter(
  (f) => f === "daycode" || f.startsWith("daycode.")
);

if (binaries.length === 0) {
  console.error("daycode binary not found in cli/");
  process.exit(1);
}

const srcBinary = join(cliDir, binaries[0]);
const destBinary = join(publicDir, "daycode.exe");

copyFileSync(srcBinary, destBinary);
console.log(`Copied ${binaries[0]} (${(statSync(srcBinary).size / 1024 / 1024).toFixed(1)} MB) → public/daycode.exe`);
