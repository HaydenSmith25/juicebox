const { Client } = require("pg");
const { rows } = require("pg/lib/defaults");
const client = new Client("postgres://localhost:5432/juicebox-dev");

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  createPost,
  updatePost,
  getAllPosts,
  getPostsByUser,
  getUserById,
};

//USERS

async function createUser({ username, password, name, location }) {
  try {
    const { user } = await client.query(
      `INSERT INTO users(username, password, name, location) 
        VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING 
         RETURNING *;`,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location FROM users`
  );
  return rows;
}

async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  const {
    rows: [user],
  } = await client.query(`
  SELECT id, name, username, location FROM users
  WHERE id=${userId};`);

  if (!user || (user && !user.id)) {
    return;
  }

  const posts = getPostsByUser(user.id);

  user.posts = posts;

  return user;
}

//POSTS

async function createPost({ authorID, title, content }) {
  try {
    const { post } = await client.query(
      `INSERT INTO users(authorID, title, content) 
        VALUES ($1, $2, $3) 
         RETURNING *;`,
      [authorID, title, content]
    );

    return post;
  } catch (err) {
    throw error;
  }
}

async function updatePost(fields = { title, content, active }) {
  try {
    const setString = Object.keys(fields)
      .map((key, index) => `"${key}"=$${index + 1}`)
      .join(", ");

    if (setString.length === 0) {
      return;
    }

    try {
      const {
        rows: [post],
      } = await client.query(
        `
      UPDATE posts
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
        Object.values(fields)
      );

      return post;
    } catch (error) {
      throw error;
    }
  } catch (err) {
    throw error;
  }
}

async function getAllPosts() {
  try {
    const { rows } = await client.query(`
    SELECT * FROM posts;`);

    return rows;
  } catch (err) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = client.query(`
    SELECT * FROM posts
    WHERE "authorId"=${userId};`);

    return rows;
  } catch (err) {
    throw error;
  }
}

module.exports = { client, getAllUsers, createUser, updateUser };
