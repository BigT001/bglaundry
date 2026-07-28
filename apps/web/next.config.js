const fs = require('fs');
const path = require('path');

// In this monorepo the owner credentials live at the repository root. Next.js
// normally loads only apps/web/.env*, so explicitly make the root ADMIN values
// authoritative when those local files exist. Hosted environment variables are
// unchanged because the ignored root files are not present in deployments.
for (const fileName of ['.env', '.env.local']) {
  const filePath = path.join(__dirname, '..', '..', fileName);
  if (!fs.existsSync(filePath)) continue;
  const source = fs.readFileSync(filePath, 'utf8');
  for (const key of ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME', 'ADMIN_PHONE', 'RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'ADMIN_NOTIFICATION_EMAIL', 'ADMIN_NOTIFICATION_EMAILS']) {
    const match = source.match(new RegExp(`^${key}=(.*)$`, 'm'));
    if (!match) continue;
    let value = match[1].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value.replace(/\\n/g, '\n');
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the dev server's incremental files separate from production builds.
  // Sharing `.next` lets `next build` replace chunks while `next dev` is still
  // running, which causes intermittent ENOENT vendor-chunk crashes.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
}

module.exports = nextConfig
