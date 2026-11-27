
const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');
const sessionStore = require('../session/sessionStore');

const router = express.Router();

const COOKIE_NAME = 'sid';
const SESSION_MAX_AGE = 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true',
  sameSite: 'lax',
  signed: true,
  path: '/',
  maxAge: SESSION_MAX_AGE,
});

function safeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

router.post('/login', async (req, res, next) => {
  try {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.trim().toLowerCase()
        : '';

    const password =
      typeof req.body?.password === 'string'
        ? req.body.password
        : '';

    if (!email || !password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email and password are required',
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    const validPassword =
      user &&
      typeof user.passwordHash === 'string' &&
      await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
      });
    }

    const session = sessionStore.create(user.id);

    res.cookie(COOKIE_NAME, session.id, cookieOptions());

    return res.status(200).json({
      data: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  return res.status(200).json({
    data: req.user,
  });
});

router.post('/logout', (req, res, next) => {
  try {
    const sid = req.signedCookies?.sid;

    if (sid && typeof sid === 'string') {
      sessionStore.destroy(sid);
    }

    const options = cookieOptions();
    delete options.maxAge;

    res.clearCookie(COOKIE_NAME, options);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
