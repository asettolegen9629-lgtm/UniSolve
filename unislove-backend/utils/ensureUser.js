'use strict';

const prisma = require('../prismaClient');

function sanitizeEmailLocal(clerkId) {
  const safe = String(clerkId).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safe.slice(0, 80)}@clerk.placeholder`;
}

/**
 * Ensures a User row exists for req.user (set by authenticateUser).
 * Mirrors sync/create logic so notifications, likes, comments, etc. work on first request.
 */
async function ensureUserRecord(req) {
  const clerkId = req.user?.clerkId;
  if (!clerkId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (user) return user;

  const email =
    req.user?.email ||
    req.headers['x-clerk-email'] ||
    sanitizeEmailLocal(clerkId);

  let usernameBase =
    req.user?.username ||
    req.headers['x-clerk-username'] ||
    email.split('@')[0];
  usernameBase = String(usernameBase).replace(/[^a-zA-Z0-9_]/g, '') || `u_${clerkId.slice(-12)}`;

  const fullName =
    `${req.user?.fullName || ''}`.trim() ||
    `${req.headers['x-clerk-full-name'] || ''}`.trim() ||
    usernameBase;

  let username = usernameBase;
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? username : `${usernameBase}_${i}`;
    const clash = await prisma.user.findUnique({ where: { username: candidate } });
    if (!clash) {
      username = candidate;
      break;
    }
  }

  try {
    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        username,
        fullName,
        profilePicture: null,
      },
    });
    return user;
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.user.findUnique({ where: { clerkId } });
    }
    throw e;
  }
}

module.exports = { ensureUserRecord };
