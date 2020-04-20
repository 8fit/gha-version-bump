## gha-version-bump

GitHub Action for automated npm version bump.

This action bumps the patch version of your npm package, where you have a "staging" branch (the default branch in the repo), and a "production" branch (the one you name in the github workflow). On pushes to the "production" branch, this action pushes a version tag at the head of the "production" branch, then bumps the npm package version on your "staging" branch (the default branch).
[`.github/workflows/push.yml`](./.github/workflows/push.yml) file in this project as an example.

This action was inspired by: [phips28/gh-action-bump-version](https://github.com/phips28/gh-action-bump-version), but modified to fit our release flow of our website.

You will need to generate a personal token to use for this Github Action, if your default branch is protected.

