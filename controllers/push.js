const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pushRepo() {
  const repoPath = path.resolve(process.cwd(), ".git");
  const commitsPath = path.join(repoPath, "commits");
  try {
    const commitDirs = await fs.readdir(commitsPath);
    for (const commitDir of commitDirs) {
      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);
      for (const file of files) {
        const filepath = path.join(commitPath, file);
        const filecontent = await fs.readFile(filepath);
        const params = {
          Bucket: S3_BUCKET,
          Key: `commits/${commitDir}/${file}`,
          Body: filecontent,
        };
        await s3.upload(params).promise();
      }
    }
    console.log(" pushing changes to the remote repository.");
  } catch (err) {
    console.log("error pushing to s3", err);
  }
}

module.exports = { pushRepo };
