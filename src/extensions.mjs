import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as fs from "node:fs";
import { configRoot } from "./config.mjs";

export function extensionRoot(homeDir = os.homedir()) {
  return `${configRoot(homeDir)}/extensions`;
}

function manifestPath(root, name) {
  return path.join(root, name, "cf-extension.json");
}

export function readExtensionManifest(root, name, fsImpl = fs) {
  const manifest = JSON.parse(fsImpl.readFileSync(manifestPath(root, name), "utf8"));
  if (!validateExtensionManifest(manifest, name))
    throw new Error(`Invalid cfhub extension manifest: ${name}`);
  return manifest;
}

export function validateExtensionManifest(manifest, name) {
  return Boolean(
    manifest?.name &&
    isSafeExtensionName(manifest.name) &&
    (!name || manifest.name === name) &&
    manifest.version &&
    manifest.commands &&
    typeof manifest.commands === "object" &&
    !Array.isArray(manifest.commands) &&
    Object.values(manifest.commands).every(isSafeExtensionCommandPath),
  );
}

function isSafeExtensionName(name) {
  return typeof name === "string" && ![".", ".."].includes(name) && !/[\\/]/.test(name);
}

function isSafeExtensionCommandPath(commandPath) {
  if (typeof commandPath !== "string" || !commandPath.trim() || path.isAbsolute(commandPath))
    return false;
  return !commandPath.replaceAll("\\", "/").split("/").includes("..");
}

export function discoverExtensions(homeDir = os.homedir(), fsImpl = fs) {
  const root = extensionRoot(homeDir);
  if (typeof fsImpl.existsSync !== "function" || !fsImpl.existsSync(root)) return [];
  return fsImpl
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      try {
        return [readExtensionManifest(root, entry.name, fsImpl)];
      } catch {
        return [];
      }
    });
}

export function importExtensionModule(url) {
  return import(url);
}

export async function loadExtensionCommand(
  manifest,
  command,
  homeDir = os.homedir(),
  loadModule = importExtensionModule,
) {
  const relative = manifest.commands[command];
  if (!relative) return null;
  if (!isSafeExtensionName(manifest.name))
    throw new Error(`Unsafe extension command path: ${command}`);
  if (!isSafeExtensionCommandPath(relative))
    throw new Error(`Unsafe extension command path: ${command}`);
  const extensionDir = path.resolve(extensionRoot(homeDir), manifest.name);
  const modulePath = path.resolve(extensionDir, relative);
  const withinExtension = path.relative(extensionDir, modulePath);
  if (!withinExtension || withinExtension === ".." || withinExtension.startsWith(`..${path.sep}`))
    throw new Error(`Unsafe extension command path: ${command}`);
  const module = await loadModule(pathToFileURL(modulePath).href);
  return module.default || module.run || module.handler || null;
}
