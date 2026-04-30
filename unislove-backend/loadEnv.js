'use strict';
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

/**
 * Apply unislove-backend/.env to process.env (always wins over pre-set shell vars).
 * Stops stale DATABASE_URL (e.g. old Supabase host) from shadowing the file.
 */
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.warn('[loadEnv] Missing', envPath);
    return;
  }
  const parsed = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  for (const key of Object.keys(parsed)) {
    process.env[key] = parsed[key];
  }
}

loadEnv();
module.exports = { loadEnv };
