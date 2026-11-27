
'use strict';

const Redis = require('ioredis');

// Create Redis instance
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  lazyConnect: true,
});

// Get data from cache
async function cacheGet(key) {
  try {
    const val = await redis.get(key);

    if (val === null) {
      return null;
    }

    return JSON.parse(val);
  } catch (err) {
    console.error('[cache] GET error:', err);
    return null;
  }
}

// Store data in cache with TTL
async function cacheSet(key, data, ttlSeconds) {
  try {
    await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch (err) {
    console.error('[cache] SET error:', err);
  }
}

// Delete data from cache
async function cacheDel(key) {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('[cache] DEL error:', err);
  }
}

module.exports = { cacheGet, cacheSet, cacheDel };
