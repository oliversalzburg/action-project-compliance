import esbuild from "esbuild";

esbuild
  .build({
    bundle: true,
    entryPoints: ["./source/local.ts", "./source/main.ts"],
    external: ["os"],
    format: "esm",
    inject: ["source/cjs-shim.ts"],
    outdir: "./output/",
    platform: "node",
    target: "node20",
  })
  .catch(console.error);
