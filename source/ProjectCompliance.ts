import { checkGithubWorkflowQA } from "./checks/github-workflow-qa.js";
import { checkYarnrc } from "./checks/yarnrc.js";

export interface ProjectComplianceOptions {
  projectType: "nodejs-library" | "nodejs-cli" | "browser-ui" | "browser-library" | "oci";
}

export class ProjectCompliance {
  #options: ProjectComplianceOptions;

  constructor(options: ProjectComplianceOptions) {
    this.#options = options;
  }

  async main() {
    console.info("Starting operation...");

    let failed = false;
    failed = await checkGithubWorkflowQA();
    if (this.#options.projectType !== "oci") {
      failed = await checkYarnrc();
    }

    if (failed) {
      console.error("Failed.");
      process.exit(1);
    }

    console.info("Done.");
  }
}
