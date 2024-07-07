import { unknownToError } from "@oliversalzburg/js-utils/error-serializer.js";
import assert from "node:assert";
import { readFile, stat } from "node:fs/promises";
import YAML from "yaml";
import { ProjectInfo } from "../ProjectInfo.js";

/**
 * Check the project's `/package.json` NodeJS manifest.
 * @param _projectInfo - Information about the test subject.
 * @returns `true` if the check passed; `false` otherwise.
 */
export const checkPackageJson = async (_projectInfo: ProjectInfo) => {
  const subjectFilename = "package.json";
  process.stderr.write(`Checking '${subjectFilename}'...\n`);

  try {
    const subjectExists = await stat(subjectFilename);
    if (!subjectExists.isFile()) {
      throw new Error("Non-file object found.");
    }
    const subjectContents = await readFile(subjectFilename, "utf-8");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const subject = JSON.parse(subjectContents);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    assert(
      subject?.$schema === "https://json.schemastore.org/package.json",
      "$schema must be 'https://json.schemastore.org/package.json'.",
    );
    assert(subject?.license === "MIT", "Project must be MIT licensed.");
    assert(
      subject?.author === "Oliver Salzburg <oliver.salzburg@gmail.com>",
      "author must be 'Oliver Salzburg <oliver.salzburg@gmail.com>'.",
    );
    assert(subject?.type === "module", "Project must be ES module.");
    assert(typeof subject?.scripts?.build === "string", "Must have 'build' script.");
    assert(typeof subject?.scripts?.clean === "string", "Must have 'clean' script.");
    assert(typeof subject?.scripts?.lint === "string", "Must have 'lint' script.");
    assert(typeof subject?.scripts?.test === "string", "Must have 'test' script.");

    assert(
      typeof subject?.devDependencies?.["@oliversalzburg/eslint-config"] === "string",
      "Must use '@oliversalzburg/eslint-config'.",
    );
    assert(
      typeof subject?.devDependencies?.["lint-staged"] === "string",
      "Must use 'lint-staged'.",
    );
    assert(typeof subject?.devDependencies?.["prettier"] === "string", "Must use 'prettier'.");
    assert(typeof subject?.devDependencies?.["typescript"] === "string", "Must use 'typescript'.");

    assert(
      (subject?.packageManager as string | undefined)?.startsWith("yarn"),
      "Must use yarn package manager through Corepack.",
    );

    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  } catch (error) {
    process.stderr.write(`Failure: ${unknownToError(error).message}\n`);
    return true;
  }

  return false;
};

/**
 * Check the projects `/.github/workflows/qa.yml` GitHub Actions QA workflow for our expected
 * NodeJS test matrix.
 * @param projectInfo - Information about the test subject.
 * @returns `true` if the check passed; `false` otherwise.
 */
export const checkWorkflowNodeJsVersions = async (projectInfo: ProjectInfo) => {
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

    // If we produce a single-version target, we only want to test on that target.
    // If we produce a multi-version target, we want to test with all supported targets.

    if (projectInfo.isGithubAction) {
      const actionContents = await readFile("action.yml", "utf-8");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const action = YAML.parse(actionContents);

      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      const actionNodeRuntime = action?.runs?.using as string | undefined;
      assert(actionNodeRuntime === "node20", "Action must run on 'node20'.");

      const nodeRuntimeVersion = Number(actionNodeRuntime.replace(/^node/, ""));

      assert(
        (subject?.env?.NODE_VERSION as string | undefined)?.startsWith(`${nodeRuntimeVersion}.`),
        "NODE_VERSION must be tracked in the environment.",
      );

      assert(
        typeof subject?.jobs?.qa?.strategy?.matrix !== "undefined",
        "The 'qa' job must use a matrix strategy.",
      );
      assert(
        (
          subject?.jobs?.qa?.strategy?.matrix?.["os-release"] as Array<string> | undefined
        )?.includes("ubuntu-22.04"),
        "The 'qa' job matrix strategy must include 'ubuntu-22.04' in the 'os-release' of the matrix.",
      );
      assert(
        (
          subject?.jobs?.qa?.strategy?.matrix?.["os-release"] as Array<string> | undefined
        )?.includes("windows-2022"),
        "The 'qa' job matrix strategy must include 'windows-2022' in the 'os-release' of the matrix.",
      );
      assert(
        subject?.jobs?.qa?.["runs-on"] === "${{ matrix.os-release }}",
        "The 'qa' job must run on the matrixed OS release '${{ matrix.os-release }}'.",
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodeSetups = (subject?.jobs?.qa?.steps as Array<any> | undefined)?.filter(step =>
        (step.uses as string | undefined)?.startsWith("actions/setup-node"),
      );
      assert(
        nodeSetups?.length === 1,
        "The 'qa' job must contain exactly 1 'actions/setup-node' step.",
      );
      assert(
        nodeSetups[0].with?.["node-version"] === "${{ env.NODE_VERSION }}",
        "The 'node-version' in the 'qa' job must be '${{ env.NODE_VERSION }}'.",
      );

      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
    } else {
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      assert(
        (subject?.env?.NODE_LTS_VERSION as string | undefined)?.startsWith("20."),
        "NODE_LTS_VERSION must be tracked in the environment.",
      );
      assert(
        (subject?.env?.NODE_VERSION as string | undefined)?.startsWith("22."),
        "NODE_VERSION must be tracked in the environment.",
      );

      assert(
        subject?.jobs?.versions?.name === "Versions",
        "Workflow must have 'versions' job, with name 'Versions'.",
      );
      assert(
        subject?.jobs?.versions?.outputs?.NODE_LTS_VERSION === "${{ env.NODE_LTS_VERSION }}",
        "'versions' job must have 'NODE_LTS_VERSION' output with value '${{ env.NODE_LTS_VERSION }}'.",
      );
      assert(
        subject?.jobs?.versions?.outputs?.NODE_VERSION === "${{ env.NODE_VERSION }}",
        "'versions' job must have 'NODE_VERSION' output with value '${{ env.NODE_VERSION }}'.",
      );
    }

    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  } catch (error) {
    process.stderr.write(`Failure: ${unknownToError(error).message}\n`);
    return true;
  }

  return false;
};
