import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/client.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  // The generated Prisma Client uses import.meta.url, which is undefined in CJS
  // We shim it to point to the current file location
  banner: {
    js: `
const { pathToFileURL } = require("url");
const import_meta_url = pathToFileURL(__filename).toString();
`.trim(),
  },
  define: {
    "import.meta.url": "import_meta_url",
  },
});
