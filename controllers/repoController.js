const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  try {
    const { userId, name, issues, content, description, visibility } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Repository name is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "invalid user id" });
    }
    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner: userId,
      content,
      issues,
    });
    const result = await newRepository.save();
    res.status(201).json({
      message: "Repository created",
      repositoryId: result._id,
    });
  } catch (error) {
    console.error("Error during Repository creation:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function getAllRepository(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");
    res.json(repositories);
  } catch (error) {
    console.error("Error during Repository creation:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.find({ _id: id })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (error) {
    console.error("Error during Repository creation:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;

  try {
    const repository = await Repository.find({ name: name })
      .populate("owner")
      .populate("issues");
    res.json(repository);
  } catch (error) {
    console.error("Error during Repository creation:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function fetchRepositoryForCurrentUser(req, res) {
  const userId = req.params.userID || req.user;
  try {
    const repositories = await Repository.find({
      owner: userId,
    })
      .populate("owner")
      .populate("issues");
    // Return empty array instead of 404 - having no repos is not an error
    res.json(repositories);
  } catch (error) {
    console.error("Error during fetching Repository ", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function updateRepository(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;
  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "User repository not found" });
    }
    repository.content.push(content);
    repository.description = description;

    const updatedRepository = await repository.save();
    res.json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (error) {
    console.error("Error during updating Repository ", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function deleteRepository(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "User repository not found" });
    }
    res.json({ message: "repository deleted successfully" });
  } catch (error) {
    console.error("Error during deleting Repository ", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}
async function toggleVisiblityById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;
  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "User repository not found" });
    }
    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();
    res.json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (error) {
    console.error("error during toggling visiblity ", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

module.exports = {
  createRepository,
  getAllRepository,
  fetchRepositoryByName,
  fetchRepositoryById,
  fetchRepositoryForCurrentUser,
  updateRepository,
  toggleVisiblityById,
  deleteRepository,
};
