import { copyFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const scriptsDir = import.meta.dirname;
const webDir = join(scriptsDir, "..");
const cliDir = join(scriptsDir, "..", "..", "cli");
const publicDir = join(webDir, "src", "public");

const target = process.env.BUILD_TARGET || "bun-windows-x64";

const result = spawnSync("bun", [
  "build", "src/index.tsx", "--compile", "--outfile", "daycode", "--target", target,
], {
  cwd: cliDir,
  stdio: "inherit",
  shell: true,
});

if (result.status !== 0) {
  console.error("CLI build failed");
  process.exit(1);
}

const binaryName = target.includes("windows") ? "daycode.exe" : "daycode";
const srcBinary = join(cliDir, binaryName);
const destBinary = join(publicDir, "daycode.exe");

copyFileSync(srcBinary, destBinary);
console.log(`Copied ${binaryName} (${(statSync(srcBinary).size / 1024 / 1024).toFixed(1)} MB) → public/daycode.exe (target: ${target})`);
