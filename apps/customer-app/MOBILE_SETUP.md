# BG Laundry customer app development

## 1. Start the API

From the repository root:

```bash
pnpm --filter web dev
```

The API will run on `http://localhost:4000/api/v1`.

## 2. Configure Firebase

Create Android and iOS applications in the same Firebase project used by the
BG Laundry backend:

- Android package: `org.bglaundry.customer`
- iOS bundle ID: `org.bglaundry.customer`

Download and place these files in `apps/customer-app/`:

- `google-services.json`
- `GoogleService-Info.plist`

Enable **Phone** under Firebase Console → Authentication → Sign-in method.
Add Android SHA-1 and SHA-256 fingerprints. For iOS, configure APNs for the
Firebase application.

The backend deployment must contain:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

The customer app environment must contain:

```text
EXPO_PUBLIC_API_URL=https://bglaundry.org/api/v1
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

For local development, omit `EXPO_PUBLIC_API_URL`. Expo will use the Metro
host machine's IP address so a physical phone on the same Wi-Fi can reach the
local API.

## 3. Create the native development build

Firebase Phone Auth is a native module and does not run inside Expo Go.

```bash
cd apps/customer-app
pnpm exec expo prebuild
pnpm exec expo run:android
```

For iOS on macOS:

```bash
cd apps/customer-app
pnpm exec expo prebuild
pnpm exec expo run:ios
```

After the development build is installed, start Metro with:

```bash
pnpm --filter customer-app start -- --dev-client
```

Keep the API and Metro running in separate terminal windows.
