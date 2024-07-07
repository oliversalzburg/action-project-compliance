/**
 * Information about a project that drives the selection of checks.
 */
export interface ProjectInfo {
  /**
   * Does this project produce artifacts that are viewed with a browser?
   */
  isBrowserTarget: boolean;

  /**
   * Is this project a GitHub Action?
   */
  isGithubAction: boolean;

  /**
   * Is this project hosted on GitHub, and should integrate with GitHub?
   */
  isGithubHosted: boolean;

  /**
   * Is this a NodeJS project?
   */
  isNodeJsProject: boolean;

  /**
   * Does this project produce an OCI image?
   */
  isOciTarget: boolean;

  /**
   * Where the project is located on disc.
   */
  rootDirectory: string;
}
