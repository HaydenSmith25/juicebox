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
  let posts = await getAllPosts();

  posts = posts.filter((post) => {
    if (post.active) {
      return true;
    }
    if (req.user && post.author.id === req.user.id) {
      return true;
    }
    return false;
  });

  res.send({
    posts,
  });
});

postsRouter.delete("/:postid", requireUser, async (req, res, next) => {
  try {
    const post = await getPostById(req.params.postId);
    if (post && post.author.id === req.user.id) {
      const updatedPost = await updatePost(post.id, { active: false });
      res.send({ post: updatedPost });
    } else {
      next(
        post
          ? {
              name: "UnauthorizedUserError",
              message:
                "You cannot delete a post which you are not the author of",
            }
          : {
              name: "PostNotFoundError",
              message: "That post does not exist",
            }
      );
    }
  } catch ({ name, message }) {
    next({ name, message });
  }
});

module.exports = postsRouter;
