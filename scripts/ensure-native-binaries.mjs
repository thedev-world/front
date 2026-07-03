import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { arch, platform } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Native optional deps that npm often skips when the lockfile was built on another OS. */
const PLATFORM_PACKAGES = {
  "darwin-arm64": {
    lightningcss: "lightningcss-darwin-arm64",
    oxide: "@tailwindcss/oxide-darwin-arm64",
    rolldown: "@rolldown/binding-darwin-arm64",
  },
  "darwin-x64": {
    lightningcss: "lightningcss-darwin-x64",
    oxide: "@tailwindcss/oxide-darwin-x64",
    rolldown: "@rolldown/binding-darwin-x64",
  },
  "linux-x64": {
    lightningcss: "lightningcss-linux-x64-gnu",
    oxide: "@tailwindcss/oxide-linux-x64-gnu",
    rolldown: "@rolldown/binding-linux-x64-gnu",
  },
  "linux-arm64": {
    lightningcss: "lightningcss-linux-arm64-gnu",
    oxide: "@tailwindcss/oxide-linux-arm64-gnu",
    rolldown: "@rolldown/binding-linux-arm64-gnu",
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

function hasNativeBinary(packageName) {
  const packageDir = join(root, "node_modules", ...packageName.split("/"));

  if (!existsSync(packageDir)) {
    return false;
  }

  return readdirSync(packageDir).some((fileName) => fileName.endsWith(".node"));
}

function maybeAdd(packagesToInstall, packageName, version) {
  if (version && !hasNativeBinary(packageName)) {
    packagesToInstall.push(`${packageName}@${version}`);
  }
}

const platformKey = `${platform()}-${arch()}`;
const platformPackages = PLATFORM_PACKAGES[platformKey];

if (!platformPackages) {
  console.warn(
    `[ensure-native-binaries] Unsupported platform "${platformKey}", skipping.`,
  );
  process.exit(0);
}

const packagesToInstall = [];

maybeAdd(
  packagesToInstall,
  platformPackages.lightningcss,
  readPackageVersion("lightningcss"),
);
maybeAdd(
  packagesToInstall,
  platformPackages.oxide,
  readPackageVersion("@tailwindcss/oxide"),
);
maybeAdd(
  packagesToInstall,
  platformPackages.rolldown,
  readPackageVersion("rolldown"),
);

if (packagesToInstall.length === 0) {
  process.exit(0);
}

console.log(
  `[ensure-native-binaries] Installing native binaries for ${platformKey}: ${packagesToInstall.join(", ")}`,
);

execSync(
  `npm install --no-save --no-fund --no-audit ${packagesToInstall.join(" ")}`,
  {
    cwd: root,
    stdio: "inherit",
  },
);
