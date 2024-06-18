import { unknownToError } from "@oliversalzburg/js-utils/error-serializer.js";
import assert from "node:assert";
import { readFile, stat } from "node:fs/promises";

/**
 * Check the project's `/package.json` NodeJS manifest.
 * @returns `true` if the check passed; `false` otherwise.
 */
export const checkPackageJson = async () => {
  const subjectFilename = "package.json";
  process.stderr.write(`Checking '${subjectFilename}'...\n`);

  try {
    const packageJsonExists = await stat(subjectFilename);
    if (!packageJsonExists.isFile()) {
      throw new Error("Non-file object found.");
    }
    const packageJsonContents = await readFile(subjectFilename, "utf-8");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const subject = JSON.parse(packageJsonContents);

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
