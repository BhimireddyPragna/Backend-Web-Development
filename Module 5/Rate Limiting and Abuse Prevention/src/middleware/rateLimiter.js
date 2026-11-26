'use strict';
// middleware/rateLimiter.js
//
// YOUR TASK: replace this pass-through with a real rate limiter.
//
// Right now this middleware lets EVERY request through, so the login route can be
// brute-forced without limit. Build a strict limiter with `express-rate-limit`
// (already in package.json) that is exported as the middleware used by the three
// auth routes in src/routes/auth.js.
//
// Requirements (checked by the tests):
//   - windowMs: 15 minutes
//   - max: 5 attempts per window per IP
//   - after the limit, respond with 429 and a `Retry-After` header
//   - standardHeaders: true, legacyHeaders: false
//   - (recommended) skipSuccessfulRequests: true so only FAILED attempts count
//
// Also add a COMMENT explaining how a Redis-backed store (rate-limit-redis) would
// replace the default in-memory store in a multi-instance deployment, and why the
// in-memory store is not enough when several instances run behind a load balancer.
//
// Hint: express-rate-limit returns a middleware function — export it directly:
//   const rateLimit = require('express-rate-limit');
//   module.exports = rateLimit({ ...options });
const rateLimit = require('express-rate-limit');
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: true, // Only count failed requests towards the limit
  handler: (req, res) => {
    res.set('Retry-After', Math.ceil(15 * 60)); // Set Retry-After header in seconds
    res.status(429).json({ message: 'Too many requests, please try again later.' });
  },
});

// COMMENT:
// In a multi-instance deployment behind a load balancer, the default in-memory store of express-rate-limit is insufficient because each instance maintains its own separate count of requests. This means that if a user makes requests that are distributed across multiple instances, they could exceed the rate limit without being blocked, as each instance would not be aware of the requests handled by the others. To address this, a Redis-backed store (using rate-limit-redis) can be used to centralize the request counts across all instances. This allows for consistent rate limiting regardless of which instance handles the request, ensuring that the limit is enforced globally rather than per instance. 


module.exports = (req, res, next) => next(); // TODO: replace this stub
