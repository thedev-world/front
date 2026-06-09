import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { arch, platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const PLATFORM_PACKAGES = {
  "darwin-arm64": {
    lightningcss: "lightningcss-darwin-arm64",
    oxide: "@tailwindcss/oxide-darwin-arm64",
  },
  "darwin-x64": {
    lightningcss: "lightningcss-darwin-x64",
    oxide: "@tailwindcss/oxide-darwin-x64",
  },
  "linux-x64": {
    lightningcss: "lightningcss-linux-x64-gnu",
    oxide: "@tailwindcss/oxide-linux-x64-gnu",
  },
  "linux-arm64": {
    lightningcss: "lightningcss-linux-arm64-gnu",
    oxide: "@tailwindcss/oxide-linux-arm64-gnu",
  },
};

function readPackageVersion(packageName) {
  const packageJsonPath = join(
    root,
    "node_modules",
    ...packageName.split("/"),
    "package.json",
  );

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  return JSON.parse(readFileSync(packageJsonPath, "utf8")).version;
}

function hasPlatformPackage(packageName) {
  const packageDir = join(root, "node_modules", ...packageName.split("/"));

  if (!existsSync(packageDir)) {
    return false;
  }

  return readdirSync(packageDir).some((fileName) => fileName.endsWith(".node"));
}

const platformKey = `${platform()}-${arch()}`;
const platformPackages = PLATFORM_PACKAGES[platformKey];

if (!platformPackages) {
  console.warn(
    `[ensure-native-css] Unsupported platform "${platformKey}", skipping native binary install.`,
  );
  process.exit(0);
}

const packagesToInstall = [];

const lightningcssVersion = readPackageVersion("lightningcss");
if (lightningcssVersion && !hasPlatformPackage(platformPackages.lightningcss)) {
  packagesToInstall.push(
    `${platformPackages.lightningcss}@${lightningcssVersion}`,
  );
}

const oxideVersion = readPackageVersion("@tailwindcss/oxide");
if (oxideVersion && !hasPlatformPackage(platformPackages.oxide)) {
  packagesToInstall.push(`${platformPackages.oxide}@${oxideVersion}`);
}

if (packagesToInstall.length === 0) {
  process.exit(0);
}

console.log(
  `[ensure-native-css] Installing native CSS binaries for ${platformKey}...`,
);

execSync(
  `npm install --no-save --no-fund --no-audit ${packagesToInstall.join(" ")}`,
  {
    cwd: root,
    stdio: "inherit",
  },
);
