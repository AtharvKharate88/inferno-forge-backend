const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

async function revertRepo(commitID) {
  const repoPath = path.resolve(process.cwd(), ".git");
  const commitsPath = path.join(repoPath, "commits");
  try {
    const commitDir = path.join(commitsPath, commitID);
    const files = await readdir(commitDir);
    const parentDir = path.resolve(repoPath, "..");

    for (const file of files) {
      await copyFile(path.join(commitDir, file), path.join(parentDir, file));
    }
    console.log(
      "Asynchronously undoing changes by creating a new commit that reverses the effects of a prior commit."
    );
  } catch (error) {
    console.log("unable to revert", error);
  }
}
module.exports = { revertRepo };
