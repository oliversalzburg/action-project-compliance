import { unknownToError } from "@oliversalzburg/js-utils";
import assert from "node:assert";
import { readFile, stat } from "node:fs/promises";
import YAML from "yaml";

export const checkGithubWorkflowQA = async () => {
  const subjectFilename = ".github/workflows/qa.yml";
  console.info(`Checking '${subjectFilename}'...`);

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
    console.error("Failure: ", unknownToError(error).message);
    return true;
  }

  return false;
};
