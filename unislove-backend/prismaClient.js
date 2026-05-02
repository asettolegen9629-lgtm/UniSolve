require('./loadEnv');
const { PrismaClient } = require('@prisma/client');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || !String(databaseUrl).trim()) {
  throw new Error('DATABASE_URL is empty after loadEnv — set it in unislove-backend/.env, unislove-backend/.env.save, or environment variables');
}
if (databaseUrl.includes('niiidqlvjecpaglrsvyl')) {
  throw new Error(
    'DATABASE_URL still points at the old Supabase project (niiidqlvjecpaglrsvyl). Replace it in .env with the Session pooler URI from the Supabase dashboard.'
  );
}

const prisma = new PrismaClient({
  datasources: {
    db: { url: databaseUrl },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
//
