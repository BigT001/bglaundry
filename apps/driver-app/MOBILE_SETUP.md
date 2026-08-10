# BG Laundry rider app development

## 1. Start the API

From the repository root:

```bash
pnpm --filter web dev
```

The API will run on `http://localhost:4000/api/v1`.

## 2. Configure the rider app environment

The rider app uses the same backend and admin dashboard as the web app. In
production, the app environment must contain:

```text
EXPO_PUBLIC_API_URL=https://bglaundry.org/api/v1
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=...
```

For local development, omit `EXPO_PUBLIC_API_URL`. Expo will use the Metro
host machine's IP address so a physical phone on the same Wi-Fi can reach the
local API.

## 3. Create rider accounts from the admin dashboard

Create riders in the web admin dashboard. Rider login uses the same
`/api/v1/auth/login` endpoint as the web app, but only `DRIVER` accounts can
enter the rider app.

## 4. Build and test locally

```bash
cd apps/driver-app
pnpm exec expo prebuild
pnpm exec expo run:android
```

For iOS on macOS:

```bash
cd apps/driver-app
pnpm exec expo prebuild
pnpm exec expo run:ios
```

After the development build is installed, start Metro with:

```bash
pnpm --filter driver-app start -- --dev-client
```
