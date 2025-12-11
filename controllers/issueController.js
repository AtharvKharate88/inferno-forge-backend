const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {
  const { title, description } = req.body;
  const { id } = req.params;
  try {
    const issue = new Issue({
      title,
      description,
      repository: id,
    });
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    console.error("Error during issue creation:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}
async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    issue.title = title;
    issue.description = description;
    issue.status = status;

    await issue.save();
    res.json({ message: "Issue updated successfully", issue });
  } catch (error) {
    console.error("Error during Issue updation", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function deleteIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json({ message: "Issue deleted successfully" });
  } catch (error) {
    console.error("Error during Issue deletion", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function getAllIssues(req, res) {
  const { id } = req.params;
  try {
    const issues = await Issue.find({ repository: id }).populate("repository");
    if (!issues || issues.length === 0) {
      return res.json([]);
    }
    res.json(issues);
  } catch (error) {
    console.error("Error during Issue fetching", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id).populate("repository");
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }
    res.json(issue);
  } catch (error) {
    console.error("Error during Issue fetching", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

module.exports = {
  createIssue,
  deleteIssueById,
  updateIssueById,
  getAllIssues,
  getIssueById,
};
