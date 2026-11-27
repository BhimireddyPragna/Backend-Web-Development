const crypto = require('crypto');

const sessions = new Map();

const SESSION_TTL = 60 * 60 * 1000; // 1 hour

function create(userId) {
  const id = crypto.randomUUID();

  const session = {
    userId,
    expiresAt: Date.now() + SESSION_TTL,
  };

  sessions.set(id, session);

  return {
    id,
    ...session,
  };
}

function get(id) {
  if (!id) return null;

  const session = sessions.get(id);

  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }

  return session;
}

function destroy(id) {
  if (!id) return false;

  return sessions.delete(id);
}

module.exports = {
  create,
  get,
  destroy,
};