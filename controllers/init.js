const fs = require("fs").promises;
//promises utility which is used to create files
const path = require("path");

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".git");
  const commitPath = path.join(repoPath, "commits");
  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitPath, { recursive: true });
    await fs.writeFile(
      path.join(repoPath, "config.json"), //path.join is used to create file in repopath
      JSON.stringify({ bucket: process.env.S3_Bucket })
    );
  } catch (error) {
    console.log("error initializing the repository", error);
  }
}

module.exports = { initRepo };
