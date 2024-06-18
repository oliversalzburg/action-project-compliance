import { redirectErrorsToConsole } from "@oliversalzburg/js-utils/error/console.js";
import { existsSync } from "node:fs";
import { ProjectCompliance } from "./ProjectCompliance.js";
import { ProjectInfo } from "./ProjectInfo.js";

/**
 * Try to determine what kind of environment we're operating in.
 */
export const main = async (): Promise<void> => {
  const hasPackageJson = existsSync("package.json");
  const hasGithub = existsSync(".github");
  const hasIndexHtml = existsSync("index.html");
  const hasDockerfile = existsSync("Dockerfile");

  const projectInfo: ProjectInfo = {
    isBrowserTarget: hasIndexHtml,
    isGithubHosted: hasGithub,
    isNodeJsProject: hasPackageJson,
    isOciTarget: hasDockerfile,
  };

  const projectCompliance = new ProjectCompliance({ projectInfo });
  await projectCompliance.main();
};

main().catch(redirectErrorsToConsole(console));
