require("dotenv").config();
const PORT = 1337;
const express = require("express");
const server = express();
const { client } = require("./DB");
client.connect();

const morgan = require("morgan");
server.use(morgan("dev"));

server.use(express.json());

const apiRouter = require("./api");
server.use("/api", apiRouter);

server.use((req, res, next) => {
  console.log("<____Body Logger START____>");
  console.log(req.body);
  console.log("<____Body Logger END____>");

  next();
});

server.listen(PORT, () => {
  console.log("The server is up on port", PORT);
});
