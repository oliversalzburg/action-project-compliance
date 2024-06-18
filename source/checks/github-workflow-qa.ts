import { unknownToError } from "@oliversalzburg/js-utils/error-serializer.js";
import assert from "node:assert";
import { readFile, stat } from "node:fs/promises";
import YAML from "yaml";

/**
 * Check the projects `/.github/workflows/qa.yml` GitHub Actions QA workflow.
 * @returns `true` if the check passed; `false` otherwise.
 */
export const checkGithubWorkflowQA = async () => {
  const subjectFilename = ".github/workflows/qa.yml";
  process.stderr.write(`Checking '${subjectFilename}'...\n`);

  try {
    const workflowQAExists = await stat(subjectFilename);
    if (!workflowQAExists.isFile()) {
      throw new Error("Non-file object found.");
    }
    const workflowQAContents = await readFile(subjectFilename, "utf-8");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const subject = YAML.parse(workflowQAContents);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    assert(subject?.name === "QA", "Workflow name should be 'QA'.");
    assert(subject?.jobs?.qa?.name === "Run QA", "qa job name should be 'Run QA'.");
    assert(
      subject?.jobs?.qa?.["runs-on"] === "ubuntu-22.04",
      "qa job should run on 'ubuntu-22.04'.",
    );

    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  } catch (error) {
    process.stderr.write(`Failure: ${unknownToError(error).message}\n`);
    return true;
  }

  return false;
};
