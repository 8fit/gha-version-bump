const { Toolkit } = require("actions-toolkit");
const { execSync } = require("child_process");
const github = require("@actions/github");

// Change working directory if user defined PACKAGEJSON_DIR
if (process.env.PACKAGEJSON_DIR) {
  process.env.GITHUB_WORKSPACE = `${process.env.GITHUB_WORKSPACE}/${process.env.PACKAGEJSON_DIR}`;
  process.chdir(process.env.GITHUB_WORKSPACE);
}

function getNewVersion() {
  return execSync("npm version --git-tag-version=false patch")
    .toString()
    .trim();
}

// Run your GitHub Action!
Toolkit.run(async tools => {
  const pkg = tools.getPackageJSON();
  const currentVersion = pkg.version.toString();
  const currentVersionWithPrefix =`${
    process.env["INPUT_TAG-PREFIX"]
  }${currentVersion}`;
  const newVersion = getNewVersion();
  const newVersionWithPrefix = `${
    process.env["INPUT_TAG-PREFIX"]
  }${newVersion}`;

  console.log(
    "current:",
    currentVersionWithPrefix,
    " / newVersion: ",
    newVersionWithPrefix
  );

  try {
    // set git user
    await tools.runInWorkspace("git", [
      "config",
      "user.name",
      '"Automated Version Bump"'
    ]);
    await tools.runInWorkspace("git", [
      "config",
      "user.email",
      '"gha-version-bump@users.noreply.github.com"'
    ]);

    // First add the currentVersionWithPrefix tag to 'master'
    console.log(`creating tag ${currentVersionWithPrefix}`)
    await tools.runInWorkspace("git", ["tag", currentVersionWithPrefix]);

    // Switch to the default branch, and commit the version bump newVersionWithPrefix
    const defaultBranch = github.context.payload.repository.default_branch;
    console.log(`checking out ${defaultBranch}`)
    await tools.runInWorkspace("git", ["checkout", defaultBranch]);
    await tools.runInWorkspace("npm", [
      "version",
      "--allow-same-version=true",
      "--git-tag-version=false",
      "patch"
    ]);

    await tools.runInWorkspace("git", [
      "commit",
      "-a",
      "-m",
      `ci: version bump to ${newVersionWithPrefix}`
    ]);

    const remoteRepo = `https://${process.env.GITHUB_ACTOR}:${process.env.GITHUB_TOKEN}@github.com/${process.env.GITHUB_REPOSITORY}.git`;
    console.log("remoteRepo: ", remoteRepo);
    await tools.runInWorkspace("git", ["push", remoteRepo, "--follow-tags"]);
    await tools.runInWorkspace("git", ["push", remoteRepo, "--tags"]);
  } catch (e) {
    tools.log.fatal(e);
    tools.exit.failure("Failed to bump version");
  }
  tools.exit.success("Version bumped!");
});
