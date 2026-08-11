const { spawnSync } = require('child_process');

if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.warn(
    '[prebuild] Skipping prisma migrate deploy because DATABASE_URL or DIRECT_URL is not configured.',
  );
  process.exit(0);
}

const result = spawnSync(
  'pnpm',
  ['--filter', '@bglaundry/database', 'exec', 'prisma', 'migrate', 'deploy'],
  { stdio: 'inherit' },
);

process.exit(result.status || 0);
