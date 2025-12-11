const express = require("express");
const repoController = require("../controllers/repoController");
const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepository);
// More specific routes must come before generic /:id route
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get(
  "/repo/user/:userID",
  repoController.fetchRepositoryForCurrentUser
);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.put("/repo/update/:id", repoController.updateRepository);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisiblityById);
repoRouter.delete("/repo/update/:id", repoController.deleteRepository);

module.exports = repoRouter;
