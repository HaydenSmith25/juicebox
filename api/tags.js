const express = require("express");
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

const { getAllTags } = require("../DB");

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

module.exports = tagsRouter;
