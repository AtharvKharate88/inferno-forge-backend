const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ReturnDocument } = require("mongodb");
const dotenv = require("dotenv");
const ObjectId = require("mongodb").ObjectId; //when we fetch id from url
// then we neeed to mongodb version of id so that it match
dotenv.config();

const uri = process.env.MONGODB_URI;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
}

async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("githubClone");
    const userCollection = db.collection("users");
    const users = await userCollection.find({}).toArray();
    res.json(users);
  } catch (error) {
    console.log("error during fetching:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function signup(req, res) {
  const { username, password, email } = req.body;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const userCollection = db.collection("users");

    const user = await userCollection.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exist" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await userCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: result.insertId });
  } catch (error) {
    console.error("Error during signup:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("githubClone");
    const userCollection = db.collection("users");
    const user = await userCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.log("error during login", err.message);
    res.status(500).send("Server error");
  }
}

async function getUserProfile(req, res) {
  const currentId = req.params.id;
  try {
    await connectClient();
    const db = client.db("githubClone");
    const userCollection = db.collection("users");
    const user = await userCollection.findOne({ _id: new ObjectId(currentId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log("error during fetching:", error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
}

async function updateUserProfile(req, res) {
  const currentId = req.params.id;
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("githubClone");
    const userCollection = db.collection("users");
    let updateFields = { email };
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }
    const result = await userCollection.findOneAndUpdate(
      {
        _id: new ObjectId(currentId),
      },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    console.log("ID RECEIVED =", req.params);

    if (!result.value) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send(result.value);
  } catch (error) {
    console.log("Error during updating :", error.message);
    res.status(500).send("Server error");
  }
}

async function deleteUserProfile(req, res) {
  const currentId = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubClone");
    const userCollection = db.collection("users");
    const result = await userCollection.deleteOne({
      _id: new ObjectId(currentId),
    });
    if (result.deletedCount == 0) {
      return res.json({ message: "User profile deleted successfully" });
    }
  } catch (error) {
    console.log("Error during deleting :", error.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
