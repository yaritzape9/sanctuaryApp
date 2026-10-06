// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const APP_DIR = path.join(process.cwd(), "app");
const ROUTE_FILE = /^route\.(ts|tsx|js|jsx)$/;

function findRouteFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return findRouteFiles(fullPath);
    return ROUTE_FILE.test(entry.name) ? [path.relative(APP_DIR, fullPath)] : [];
  });
}

describe("route handler locations", () => {
  const routeFiles = findRouteFiles(APP_DIR);

  it("finds the API route handlers", () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  it("keeps every route handler under app/api", () => {
    const outsideApi = routeFiles.filter(
      (file) => !file.startsWith(`api${path.sep}`)
    );
    expect(outsideApi).toEqual([]);
  });
});
