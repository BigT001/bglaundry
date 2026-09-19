const { execFileSync } = require('node:child_process');

const databaseUrl = process.env.DATABASE_URL || '';
const productionHosts = ['supabase.co', 'supabase.com'];
let hostname = '';

try {
  hostname = new URL(databaseUrl).hostname;
} catch {
  throw new Error('DATABASE_URL is missing or invalid. Refusing to run prisma migrate dev.');
}

if (productionHosts.some(host => hostname.endsWith(host)) && process.env.ALLOW_PRODUCTION_MIGRATE_DEV !== 'true') {
  throw new Error(
    `Refusing prisma migrate dev against ${hostname}. Use "pnpm db:migrate:deploy" for an existing database, or set ALLOW_PRODUCTION_MIGRATE_DEV=true only after taking a verified backup.`,
  );
}

execFileSync('prisma', ['migrate', 'dev'], { stdio: 'inherit' });
