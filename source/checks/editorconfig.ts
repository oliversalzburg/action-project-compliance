import { unknownToError } from "@oliversalzburg/js-utils/error-serializer.js";
import { parse } from "ini";
import assert from "node:assert";
import { readFile, stat } from "node:fs/promises";

/**
 * Check the project's `/.editorconfig` generic IDE/editor configuration.
 * @returns `true` if the check passed; `false` otherwise.
 */
export const checkEditorconfig = async () => {
  const subjectFilename = ".editorconfig";
  process.stderr.write(`Checking '${subjectFilename}'...\n`);

  try {
    const editorconfigExists = await stat(subjectFilename);
    if (!editorconfigExists.isFile()) {
      throw new Error("Non-file object found.");
    }
    const editorconfigContents = await readFile(subjectFilename, "utf-8");

    const subject = parse(editorconfigContents);

    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    assert(subject.root === true, "Configuration must be marked root document.");

    assert(subject["*"].charset === "utf-8", "Files must use UTF-8 encoding.");
    assert(subject["*"].end_of_line === "lf", "Lines must be terminated with LF.");
    assert(subject["*"].indent_size === "2", "Indent size must be 2.");
    assert(subject["*"].indent_style === "space", "Indent style must be 'space'.");
    assert(subject["*"].insert_final_newline === true, "Files must be terminated with newline.");

    // Causes some editors to also indent code blocks the same way, breaking the default for
    // code formatting.
    assert(typeof subject["*.md"] === "undefined", "Markdown files MUST not be overridden.");
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  } catch (error) {
    process.stderr.write(`Failure: ${unknownToError(error).message}\n`);
    return true;
  }

  return false;
};
