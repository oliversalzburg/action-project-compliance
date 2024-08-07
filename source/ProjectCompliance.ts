import { ProjectInfo } from "./ProjectInfo.js";
import { checkEditorconfig } from "./checks/editorconfig.js";
import { checkGithubWorkflowQA } from "./checks/github-workflow-qa.js";
import { checkPackageJson } from "./checks/nodejs-project.js";
import { checkYarnrc } from "./checks/yarnrc.js";

/**
 * Options for the project compliance checker.
 */
export interface ProjectComplianceOptions {
  /**
   * Information about the project we're checking.
   */
  projectInfo: ProjectInfo;
}

/**
 * Main entrypoint of the project compliance checker.
 */
export class ProjectCompliance {
  #options: ProjectComplianceOptions;

  /**
   * Constructs a new project compliance checker.
   * @param options - The options for the compliance checker.
   */
  constructor(options: ProjectComplianceOptions) {
    this.#options = options;
  }

  /**
   * Execute the compliance check.
   */
  async main() {
    process.stderr.write("Starting operation...\n");

    const projectInfo = this.#options.projectInfo;
    process.chdir(projectInfo.rootDirectory);
    process.stderr.write(`  cwd: '${process.cwd()}'\n`);

    let failed = false;
    failed = (await checkEditorconfig(projectInfo)) || failed;

    if (this.#options.projectInfo.isGithubHosted) {
      failed = (await checkGithubWorkflowQA(projectInfo)) || failed;
    }
    if (this.#options.projectInfo.isNodeJsProject) {
      failed = (await checkPackageJson(projectInfo)) || failed;
      failed = (await checkYarnrc(projectInfo)) || failed;
    }

    if (failed) {
      process.stderr.write("Failed.\n");
      process.exit(1);
    }

    process.stderr.write("Done.\n");
  }
}
