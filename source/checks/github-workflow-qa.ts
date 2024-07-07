import { unknownToError } from "@oliversalzburg/js-utils/errors/error-serializer.js";
import assert from "node:assert";
import { readFile, stat } from "node:fs/promises";
import YAML from "yaml";
import { ProjectInfo } from "../ProjectInfo.js";
import { checkWorkflowNodeJsVersions } from "./nodejs-project.js";

/**
 * Check the projects `/.github/workflows/qa.yml` GitHub Actions QA workflow.
 * @param projectInfo - Information about the test subject.
 * @returns `true` if the check passed; `false` otherwise.
 */
export const checkGithubWorkflowQA = async (projectInfo: ProjectInfo) => {
  const subjectFilename = ".github/workflows/qa.yml";
  process.stderr.write(`Checking '${subjectFilename}'...\n`);

  try {
    const subjectExists = await stat(subjectFilename);
    if (!subjectExists.isFile()) {
      throw new Error("Non-file object found.");
    }
    const subjectContents = await readFile(subjectFilename, "utf-8");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const subject = YAML.parse(subjectContents);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    assert(subject?.name === "QA", "Workflow name must be 'QA'.");
    assert(typeof subject?.jobs?.qa !== "undefined", "QA workflow must have 'qa' job.");
    assert(subject?.jobs?.qa?.name === "Run QA", "qa job name must be 'Run QA'.");

    if (projectInfo.isNodeJsProject) {
      await checkWorkflowNodeJsVersions(projectInfo);
    } else {
      assert(
        subject?.jobs?.qa?.["runs-on"] === "ubuntu-22.04",
        "qa job must run on 'ubuntu-22.04'.",
      );
    }

    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  } catch (error) {
    process.stderr.write(`Failure: ${unknownToError(error).message}\n`);
    return true;
  }

  return false;
};
