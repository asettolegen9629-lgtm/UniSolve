'use strict';
/**
 * Grant admin: sets isAdmin=true for a user in the database.
 * Uses DATABASE_URL from unislove-backend/.env (same DB as production if URL matches Render).
 *
 * Usage:
 *   node grant-admin.js user@email.com
 *   node grant-admin.js --username myhandle
 */
require('./loadEnv');
const prisma = require('./prismaClient');

async function main() {
  const args = process.argv.slice(2);
  let email = null;
  let username = null;

  if (args[0] === '--username' && args[1]) {
    username = args[1].replace(/^@/, '');
  } else if (args[0]) {
    email = args[0];
  } else {
    email = 'asettolegen9629@gmail.com';
  }

  let user;
  if (email) {
    user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`No user with email: ${email}`);
      process.exit(1);
    }
  } else {
    user = await prisma.user.findFirst({
      where: { username },
    });
    if (!user) {
      console.error(`No user with username: ${username}`);
      process.exit(1);
    }
  }

  if (user.isAdmin) {
    console.log(`Already admin: ${user.email} (${user.id})`);
    await prisma.$disconnect();
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isAdmin: true },
  });

  console.log(`OK — admin granted:`);
  console.log(`  id:       ${user.id}`);
  console.log(`  email:    ${user.email}`);
  console.log(`  username: @${user.username}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
