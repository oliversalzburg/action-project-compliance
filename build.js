import { redirectErrorsToConsole } from "@oliversalzburg/js-utils/errors/console.js";
import esbuild from "esbuild";

esbuild
  .build({
    bundle: true,
    entryPoints: ["./source/auto-detect.ts"],
    external: ["os"],
    format: "esm",
    inject: ["source/cjs-shim.ts"],
    outfile: "./output/auto-detect.js",
    platform: "node",
    target: "node20",
  })
  .catch(redirectErrorsToConsole(console));
