const express = require("express");
const dotenv = require("dotenv"); //dotenv helps you load environment variables from a .env file into process.env.
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const mainRouter = require("./routes/main.router");

const { initRepo } = require("./controllers/init");
const { addRepo } = require("./controllers/add");
const { commitRepo } = require("./controllers/commit");
const { pushRepo } = require("./controllers/push");
const { pullRepo } = require("./controllers/pull");
const { revertRepo } = require("./controllers/revert");

dotenv.config(); //values in .env can be used after writing this

yargs(hideBin(process.argv))
  .command("start", "start a new server", {}, startServer)
  .command("init", "Initialise a new repository", {}, initRepo)
  .command(
    "add <filePath>",
    "add a file to repository",
    (yargs) => {
      yargs.positional("filePath", {
        describe: "file add to staging area",
        type: "string",
      });
    },
    (argv) => {
      addRepo(argv.filePath);
    }
  )
  .command(
    "commit <message>",
    "commit the staged file",
    (yargs) => {
      yargs.positional("message", {
        describe: "commit message",
        type: "string",
      });
    },
    (argv) => {
      commitRepo(argv.message);
    }
  )

  .command("push", "Push commits to S3", {}, pushRepo)
  .command("pull", "Pull commits from S3", {}, pullRepo)
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "commit id revert to",
        type: "string",
      });
    },
    (argv) => {
      revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need to atleast one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  app.use(bodyParser.json());
  app.use(express.json());
  const mongoURI = process.env.MONGODB_URI;
  mongoose
    .connect(mongoURI)
    .then(() => console.log("Mongodb connected"))
    .catch((err) => console.log("unable to connect"));
  app.use(cors({ origin: "*" }));
  app.use("/", mainRouter);
  app.get("/", (req, res) => {
    res.send("Welcome!");
  });
  let user = "test";
  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    socket.on("joinRoom", (userID) => {
      user = userID;
      console.log("===");
      console.log(user);
      console.log("===");
      socket.join(userID);
    });
  });
  const db = mongoose.connection;
  db.once("open", async () => {
    console.log("CRUD operation called");
  });

  httpServer.listen(port, () => {
    console.log(`Server is running on PORT ${port}`);
  });
}
