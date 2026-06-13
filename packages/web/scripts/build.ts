import { copyFileSync, existsSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const scriptsDir = import.meta.dirname;
const webDir = join(scriptsDir, "..");
const publicDir = join(webDir, "src", "public");
const destBinary = join(publicDir, "daycode.exe");

const repo = "Dibyendu-dev/daycode";
const releaseUrl = `https://github.com/${repo}/releases/download/latest/daycode-windows-x64.exe`;

async function downloadBinary(): Promise<boolean> {
  try {
    console.log(`Downloading Windows binary from ${releaseUrl}...`);
    const res = await fetch(releaseUrl);
    if (!res.ok) {
      console.log(`GitHub release not available yet (HTTP ${res.status})`);
      return false;
    }
    const buffer = await res.arrayBuffer();
    writeFileSync(destBinary, Buffer.from(buffer));
    console.log("Downloaded from GitHub Releases");
    return true;
  } catch (err) {
    console.log("Download failed:", (err as Error).message);
    return false;
  }
}

async function buildLocally(): Promise<boolean> {
  const cliDir = join(scriptsDir, "..", "..", "cli");

  console.log("Falling back to local CLI build...");
  const result = spawnSync("bun", ["run", "--cwd", cliDir, "build"], {
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    console.error("Local CLI build failed");
    return false;
  }

  const exePath = join(cliDir, "daycode.exe");
  const linuxPath = join(cliDir, "daycode");

  if (existsSync(exePath)) {
    copyFileSync(exePath, destBinary);
    console.log("Copied Windows binary from CLI build");
    return true;
  }
  if (existsSync(linuxPath)) {
    copyFileSync(linuxPath, destBinary);
    console.log("Copied Linux binary (Windows users need to build from source)");
    return true;
  }

  console.error("No binary found after CLI build");
  return false;
}

if (!(await downloadBinary()) && !(await buildLocally())) {
  console.error("Binary unavailable — download endpoint will return 404");
  process.exit(0);
}

const size = (statSync(destBinary).size / 1024 / 1024).toFixed(1);
console.log(`daycode.exe ready (${size} MB)`);
