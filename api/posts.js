const express = require("express");
const { user } = require("pg/lib/defaults");
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require("../DB");
const { requireUser } = require("./util");

postsRouter.post("/", requireUser, async (req, res, next) => {
  const { title, content, tags = "" } = req.body;

  const tagArr = tags.trim().split(/\s+/);
  let postData = {};

  if (tagArr.length) {
    postData.tags = tagArr;
  }
  try {
    // add authorId, title, content to postData object
    postData = { ...postData, authorId: req.user.id, title, content };
    const post = await createPost(postData);

    if (post) {
      res.send({ post });
    } else {
      next({
        name: "PostCreationError",
        message: "Post creation failed",
      });
    }
    // this will create the post and the tags for us
    // if the post comes back, res.send({ post });
    // otherwise, next an appropriate error object
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.patch("/:postId", requireUser, async (req, res, next) => {
  const { postId } = req.params;
  const { title, content, tags } = req.body;

  const updateFields = {};

  if (tags && tags.length > 0) {
    updateFields.tags = tags.trim().split(/\s+/);
  }
  if (title) {
    updateFields.title = title;
  }
  if (content) {
    updateFields.content = content;
  }
  try {
    const originalPost = await getPostById(postId);

    if (originalPost.author.id === req.user.id) {
      const updatePost = await updatePost(postId, updateFields);
      res.send({ post: updatePost });
    } else {
      next({
        name: "UnauthorizedUserError",
        message: " Users can only edit posts they have authored",
      });
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

postsRouter.use((req, res, next) => {
  console.log("A request is being made to /posts");

  next();
});

postsRouter.get("/", async (req, res) => {
  const posts = await getAllPosts();

  res.send({
    posts,
  });
});

module.exports = postsRouter;
