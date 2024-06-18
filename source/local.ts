import core from "@actions/core";
import { redirectErrorsToConsole } from "@oliversalzburg/js-utils/error/console.js";
import { ProjectCompliance } from "./ProjectCompliance.js";

const isMainModule = import.meta.url.endsWith(process.argv[1]);

/**
 * Execute the project compliance checker locally.
 */
export const main = async (): Promise<void> => {
  try {
    const projectCompliance = new ProjectCompliance({ projectType: "nodejs-library" });
    await projectCompliance.main();
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
};

if (isMainModule) {
  main().catch(redirectErrorsToConsole(console));
}
