'use strict';

const prisma = require('../prismaClient');

function sanitizeEmailLocal(clerkId) {
  const safe = String(clerkId).replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safe.slice(0, 80)}@clerk.placeholder`;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * When Clerk issues a new user id (new instance, account reset, etc.) but the email
 * is unchanged, attach the new clerkId to the existing row instead of violating unique email.
 */
/**
 * Resolves a unique username (User.username is @unique). Used by sync and first API hit.
 */
async function pickUniqueUsername(usernameBaseRaw, clerkId) {
  let usernameBase = String(usernameBaseRaw || '')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .slice(0, 40);
  if (!usernameBase) usernameBase = `u_${String(clerkId).replace(/[^a-zA-Z0-9_]/g, '').slice(-12)}`;
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? usernameBase : `${usernameBase}_${i}`;
    const clash = await prisma.user.findUnique({ where: { username: candidate } });
    if (!clash) return candidate;
  }
  return `${usernameBase}_${Date.now()}`;
}

async function attachClerkIdToExistingEmail(clerkId, emailRaw, profileFields = {}) {
  const normalized = normalizeEmail(emailRaw);
  if (!normalized || normalized.endsWith('@clerk.placeholder')) return null;

  const existing = await prisma.user.findFirst({
    where: { email: { equals: emailRaw.trim(), mode: 'insensitive' } },
  });
  if (!existing || existing.clerkId === clerkId) return existing?.clerkId === clerkId ? existing : null;

  const data = {
    clerkId,
    email: emailRaw.trim(),
    fullName: profileFields.fullName || existing.fullName,
  };
  if (profileFields.profilePicture !== undefined && profileFields.profilePicture !== null) {
    data.profilePicture = profileFields.profilePicture;
  }

  return prisma.user.update({
    where: { id: existing.id },
    data,
  });
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

  const merged = await attachClerkIdToExistingEmail(clerkId, email, {
    fullName:
      `${req.user?.fullName || ''}`.trim() ||
      `${req.headers['x-clerk-full-name'] || ''}`.trim() ||
      undefined,
    profilePicture: null,
  });
  if (merged) return merged;

  const usernameBaseRaw =
    req.user?.username ||
    req.headers['x-clerk-username'] ||
    email.split('@')[0];

  const fullName =
    `${req.user?.fullName || ''}`.trim() ||
    `${req.headers['x-clerk-full-name'] || ''}`.trim() ||
    String(usernameBaseRaw).replace(/[^a-zA-Z0-9_]/g, '') ||
    `u_${clerkId.slice(-12)}`;

  const username = await pickUniqueUsername(usernameBaseRaw, clerkId);

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
      user = await prisma.user.findUnique({ where: { clerkId } });
      if (user) return user;
      const retryMerge = await attachClerkIdToExistingEmail(clerkId, email, { fullName });
      if (retryMerge) return retryMerge;
    }
    throw e;
  }
}

module.exports = { ensureUserRecord, attachClerkIdToExistingEmail, pickUniqueUsername };
