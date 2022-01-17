const express = require("express");
const tagsRouter = express.Router();

tagsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

const { getAllTags, getPostsByTagName } = require("../DB");

tagsRouter.get("/", async (req, res) => {
  const tags = await getAllTags();

  res.send({
    tags,
  });
});

tagsRouter.get("./:tagName/posts", async (req, res, next) => {
  const { tagName } = req.params;

  try {
    let posts = await getPostsByTagName(tagName);
    posts = posts.filter((post) => {
      if (post.active) {
        return true;
      }
      if (req.user && req.user.id && post.author.id === req.user.id) {
        return true;
      }
      return false;
    });

    res.send({ posts });
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = tagsRouter;
