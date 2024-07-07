import { unknownToError } from "@oliversalzburg/js-utils/errors/error-serializer.js";
import assert from "node:assert";
import { readFile, stat } from "node:fs/promises";
import YAML from "yaml";
import { ProjectInfo } from "../ProjectInfo.js";

/**
 * Check the project's `/.yarnrc.yml` configuration for the yarn package manager.
 * @param _projectInfo - Information about the test subject.
 * @returns `true` if the check passed; `false` otherwise.
 */
export const checkYarnrc = async (_projectInfo: ProjectInfo) => {
  const subjectFilename = ".yarnrc.yml";
  process.stderr.write(`Checking '${subjectFilename}'...\n`);

  try {
    const yarnrcExists = await stat(subjectFilename);
    if (!yarnrcExists.isFile()) {
      throw new Error("Non-file object found.");
    }
    const yarnrcContents = await readFile(subjectFilename, "utf-8");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const subject = YAML.parse(yarnrcContents);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    assert(subject?.compressionLevel === 0, "Compression level must be 0.");
    assert(subject?.defaultSemverRangePrefix === "", "Dependencies mustn't use semver ranges.");
    assert(subject?.enableGlobalCache === false, "Global cache must be disabled.");
    assert(subject?.enableTelemetry === false, "Telemetry must be disabled.");
    assert(subject?.logFilters[0].code === "YN0002", "YN0002 must be an error.");
    assert(subject?.logFilters[0].level === "error", "YN0002 must be an error.");
    assert(subject?.logFilters[1].code === "YN0060", "YN0060 must be an error.");
    assert(subject?.logFilters[1].level === "error", "YN0060 must be an error.");
    assert(subject?.nmMode === "hardlinks-local", "Node modules must use hardlinks.");
    assert(subject?.nodeLinker === "node-modules", "Linker must be node-modules.");
    assert(
      subject?.plugins[0].path === ".yarn/plugins/git-hooks.cjs",
      "git hooks plugin must be loaded.",
    );
    assert(subject?.plugins[0].spec === "git-hooks", "git-hooks must have expected spec.");
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  } catch (error) {
    process.stderr.write(`Failure: ${unknownToError(error).message}\n`);
    return true;
  }

  return false;
};
