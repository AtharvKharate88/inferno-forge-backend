const fs = require("fs").promises;
const path = require("path");

async function addRepo(filePath) {
  const repoPath = path.resolve(process.cwd(), ".git");
  const stagingPath = path.join(repoPath, "staging");
  try {
    await fs.mkdir(stagingPath, { recursive: true });
    const fileName = path.basename(filePath);
    await fs.copyFile(filePath, path.join(stagingPath, fileName));
    //fs.copyFile(src, dest)
    console.log(`file ${fileName} added to staging area`);
  } catch (error) {
    console.log("Error adding file", error);
  }
}

module.exports = { addRepo };
