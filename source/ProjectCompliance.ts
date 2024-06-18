import { checkGithubWorkflowQA } from "./checks/github-workflow-qa.js";
import { checkYarnrc } from "./checks/yarnrc.js";

/**
 * Options for the project compliance checker.
 */
export interface ProjectComplianceOptions {
  /**
   * The type of project we're checking.
   */
  projectType: "nodejs-library" | "nodejs-cli" | "browser-ui" | "browser-library" | "oci";
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

    let failed = false;
    failed = await checkGithubWorkflowQA();
    if (this.#options.projectType !== "oci") {
      failed = await checkYarnrc();
    }

    if (failed) {
      process.stderr.write("Failed.\n");
      process.exit(1);
    }

    process.stderr.write("Done.\n");
  }
}
