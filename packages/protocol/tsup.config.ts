import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],
  format: ["esm", "cjs"],
  outDir: "dist",
  clean: true,
  dts: true,
  bundle: false,
  target: "es2020",
});
