const postStore = require('../data/postStore');

// Map is the internal storage implementation.
// When switching to Prisma, only this repository changes.
// The service continues using the same five methods.

const posts = new Map(
  postStore.posts.map((post) => [post.id, post])
);

let nextId = postStore.nextId();

function findAll() {
  return Array.from(posts.values());
}

function findById(id) {
  return posts.get(Number(id)) || null;
}

function create(fields) {
  const post = {
    id: nextId++,
    ...fields,
  };

  posts.set(post.id, post);

  return post;
}

function update(id, patch) {
  const post = findById(id);

  if (!post) return null;

  if (patch.title !== undefined) post.title = patch.title;
  if (patch.body !== undefined) post.body = patch.body;

  return post;
}

function remove(id) {
  return posts.delete(Number(id));
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};