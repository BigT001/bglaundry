# BG Laundry & Dry Cleaning

BG Laundry is a multi-application laundry operations platform for customers, riders, and administrators. It combines customer booking and payment, rider fulfillment, live order tracking, service and pricing management, invoice administration, and role-based authentication in one pnpm/Turborepo monorepo.

The repository contains a responsive Next.js website and API, two Expo mobile applications, a shared Prisma/PostgreSQL data layer, and shared rider business logic.

## Table of contents

- [Platform overview](#platform-overview)
- [Applications and packages](#applications-and-packages)
- [Architecture](#architecture)
- [Core features](#core-features)
- [Technology stack](#technology-stack)
- [Repository structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [Database workflows](#database-workflows)
- [Running the applications](#running-the-applications)
- [Authentication and account security](#authentication-and-account-security)
- [Order lifecycle](#order-lifecycle)
- [Flutterwave payment flow](#flutterwave-payment-flow)
- [API reference](#api-reference)
- [Build and validation](#build-and-validation)
- [Deployment](#deployment)
- [Security checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Platform overview

BG Laundry supports four primary surfaces:

1. **Public website** – presents services, pricing, rider information, and the BG Laundry brand.
2. **Customer experience** – allows customers to create accounts, maintain profiles, select laundry services, schedule pickups, pay through Flutterwave, and track orders.
3. **Rider experience** – gives assigned riders access to their jobs, route information, verification codes, status transitions, and earnings.
4. **Administrative experience** – provides operational dashboards for services, prices, customers, riders, orders, invoices, and business statistics.

The Next.js application is also the backend. API route handlers under `apps/web/app/api/v1` communicate with PostgreSQL through the shared Prisma package.

## Applications and packages

### `apps/web`

A Next.js 15 application running on port `4000` in development.

It includes:

- Public landing, services, pricing, rider, and information pages.
- Responsive customer dashboard.
- Customer profile, saved addresses, email, and authenticated password changes.
- Active-order accordion and progress tracking.
- Administrator authentication and operational dashboard.
- Service catalogue and price management.
- Customer, rider, order, and invoice administration.
- Versioned REST-style API routes under `/api/v1`.
- Flutterwave checkout initialization, callback verification, webhook processing, and payment-status lookup.
- Firebase client and Admin SDK integration.
- Cloudflare R2 media helpers.

The web application uses the Next.js App Router. It does not run a separate Express or NestJS API process.

### `apps/customer-app`

An Expo 54 / React Native customer application using Expo Router.

Key capabilities include:

- Customer authentication and local session persistence.
- Service browsing and dynamic price retrieval.
- Laundry basket management.
- Pickup and delivery scheduling.
- Order submission.
- Flutterwave hosted-checkout handoff.
- Payment confirmation polling.
- Active and historical order views.
- Order tracking.
- Profile and address management.
- Firebase integration.

The app uses the custom URL scheme `bglaundry://` so the hosted payment callback can return customers to the application.

### `apps/driver-app`

An Expo 54 / React Native application for laundry riders.

Key capabilities include:

- Rider authentication.
- Assigned-order lists.
- Pickup and delivery workflow.
- Order status updates.
- Pickup and delivery verification.
- Route/location views using Expo Location and React Native Maps.
- Rider earnings visibility.
- Shared transition rules from `@bglaundry/rider-core`.

### `packages/database`

The shared database package, published inside the workspace as `@bglaundry/database`.

It contains:

- Prisma schema.
- PostgreSQL migrations.
- Generated Prisma Client exports.
- Shared Prisma enum and model types.

Primary data models include:

- `User`
- `DriverProfile`
- `Order`
- `OrderItem`
- `Payment`
- `TrackingEvent`
- `Earning`
- `Invoice`
- `InvoiceItem`
- `Service`
- `PasswordResetToken`

### `packages/rider-core`

Shared rider-domain logic used by the web API and driver application. This package centralizes rider order status rules and helps keep mobile and server behavior consistent.

## Architecture

```text
Customer web dashboard ─┐
Customer Expo app ──────┼──► Next.js API (/api/v1) ──► Prisma ──► PostgreSQL
Driver Expo app ────────┤              │
Admin dashboard ────────┘              ├──► Flutterwave
                                       ├──► Firebase
                                       ├──► Cloudflare R2
                                       └──► Maps/location services
```

Important architectural rules:

- The backend is implemented with Next.js route handlers.
- Payment secret keys are used only by server-side routes.
- Order totals are calculated by the backend; client-supplied payment amounts are not trusted.
- Prisma is the only application data-access layer.
- Mobile apps call the versioned Next.js API.
- Customer and rider sessions use bearer JWTs.
- Passwords and reset codes are stored only as bcrypt hashes.

## Core features

### Customer features

- Phone-number and password registration/login.
- Optional profile email address.
- Home and office address management.
- Authenticated password changes without SMS OTP.
- Live service catalogue and Naira pricing.
- Basket and item quantity management.
- Pickup scheduling and order booking.
- Secure Flutterwave hosted checkout.
- Active orders with clear mobile accordion separation.
- Pickup/delivery verification codes.
- Detailed order progress timeline.
- Completed booking history.

### Rider features

- Rider-specific authentication and authorization.
- Assigned work queue.
- Online/offline rider profile state.
- Pickup and delivery route support.
- Controlled order status transitions.
- Verification-code confirmation.
- Earnings data.

### Administrator features

- Administrative login.
- Business statistics dashboard.
- Customer and rider management.
- Driver account provisioning.
- Order assignment and status oversight.
- Service catalogue creation and editing.
- Wash, iron, and wash-and-iron price management.
- Invoice creation, viewing, and status management.

### Payment features

- Flutterwave Standard hosted checkout.
- Unique server-generated transaction references.
- Server-derived order totals.
- NGN transaction validation.
- Callback verification.
- HMAC webhook signature verification.
- Idempotent database status updates.
- Client payment-status polling as a webhook fallback.

## Technology stack

| Area | Technology |
| --- | --- |
| Monorepo | pnpm workspaces, Turborepo |
| Web/API | Next.js 15, React 19, TypeScript |
| Mobile | Expo 54, React Native 0.81, Expo Router |
| Database | PostgreSQL 15, Prisma 5 |
| Authentication | JWT, bcrypt, Firebase |
| Payments | Flutterwave Standard API |
| Storage | Cloudflare R2 / AWS S3-compatible SDK |
| Maps/location | React Native Maps, Expo Location, Mapbox/Google Maps configuration |
| Networking | Fetch, Axios |
| Documents | jsPDF, html2canvas |

## Repository structure

```text
bglaundry/
├── apps/
│   ├── web/
│   │   ├── app/                 # Next.js pages and API routes
│   │   ├── lib/                 # Auth, database, Firebase, R2, payment helpers
│   │   └── public/              # Static images and brand assets
│   ├── customer-app/
│   │   ├── app/                 # Expo Router screens
│   │   └── lib/                 # API and Firebase configuration
│   └── driver-app/
│       └── app/                 # Rider authentication, orders, routes, earnings
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   └── src/
│   └── rider-core/
│       └── src/
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Prerequisites

Install the following before starting:

- Node.js 20 LTS or a compatible modern Node.js release.
- pnpm 10 or a version compatible with the lockfile.
- Docker Desktop, or direct access to a PostgreSQL database.
- Expo Go or native iOS/Android tooling for mobile development.
- A Flutterwave account for real payment testing.
- Firebase and external-service credentials for the features you enable.

## Local setup

### 1. Clone and enter the repository

```bash
git clone https://github.com/BigT001/bglaundry.git
cd bglaundry
```

### 2. Install dependencies

```bash
pnpm install
```

The root `postinstall` script generates Prisma Client automatically.

### 3. Start PostgreSQL

To use the included local PostgreSQL 15 container:

```bash
docker compose up -d postgres
```

The default local container values are:

```text
Host: localhost
Port: 5432
Database: bglaundry_db
User: bglaundry_user
Password: bglaundry_password
```

These values are for local development only.

### 4. Configure environment files

Create or update the ignored root files:

```text
.env
.env.local
```

Next.js resolves environment files from `apps/web`, so local web-only overrides may also be placed in:

```text
apps/web/.env.local
```

Never commit real credentials.

### 5. Generate the database client

```bash
pnpm db:generate
```

### 6. Apply database migrations

For development:

```bash
pnpm db:migrate
```

For production or CI:

```bash
pnpm --filter @bglaundry/database exec prisma migrate deploy
```

### 7. Start the web application

```bash
pnpm --filter web dev
```

Open `http://localhost:4000`.

## Environment variables

The repository ignores `.env` and `.env.*`. The following table documents supported configuration without exposing secret values.

### Database and application

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled/runtime PostgreSQL connection URL used by Prisma. |
| `DIRECT_URL` | Yes for migrations | Direct PostgreSQL connection URL. |
| `PORT` | Optional | General runtime port configuration; the web dev script explicitly uses `4000`. |
| `APP_URL` | Production recommended | Public application origin used to build callback URLs. |

### Authentication and administration

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Signs and verifies application JWTs. Use a long random production secret. |
| `ADMIN_EMAIL` | Admin bootstrap | Configured administrator email. |
| `ADMIN_PASSWORD` | Admin bootstrap | Initial administrator password; use a strong secret. |

### Flutterwave

| Variable | Required | Purpose |
| --- | --- | --- |
| `FLW_PUBLIC_KEY` | Yes | Flutterwave account public key. |
| `FLW_SECRET_KEY` | Yes | Server-only Flutterwave API secret. Never expose it to web/mobile bundles. |
| `FLW_ENCRYPTION_KEY` | Account-dependent | Flutterwave encryption key retained for supported encrypted operations. |
| `FLW_WEBHOOK_SECRET_HASH` | Yes | Secret used to validate `flutterwave-signature`. Must match the dashboard webhook setting. |
| `FLW_REDIRECT_URL` | Production recommended | Optional explicit public callback URL. Defaults to `<APP_URL>/api/v1/payments/callback`. |

### Firebase

| Variable | Scope | Purpose |
| --- | --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Mobile client | Firebase client API key. |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Mobile client | Firebase Auth domain. |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Mobile client | Firebase project ID. |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Mobile client | Firebase storage bucket. |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Mobile client | Firebase messaging sender ID. |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Mobile client | Firebase application ID. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web client | Firebase web API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Web client | Firebase web Auth domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Web client | Firebase web project ID. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Web client | Firebase web storage bucket. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Web client | Firebase web messaging sender ID. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Web client | Firebase web application ID. |
| `FIREBASE_PROJECT_ID` | Server | Firebase Admin project ID. |
| `FIREBASE_CLIENT_EMAIL` | Server | Firebase service-account email. |
| `FIREBASE_PRIVATE_KEY` | Server | Firebase service-account private key. Preserve escaped newlines correctly. |
| `FIREBASE_CREDENTIALS_JSON` | Server alternative | Single-line serialized Firebase service-account JSON. |

### Cloudflare R2

| Variable | Required for uploads | Purpose |
| --- | --- | --- |
| `R2_ACCESS_KEY_ID` | Yes | R2 S3-compatible access key. |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 secret access key. |
| `R2_ENDPOINT` | Yes | Account-specific R2 endpoint. |
| `R2_BUCKET_NAME` | Yes | Destination bucket. |
| `R2_PUBLIC_URL` | Recommended | Public asset base URL. |

### Messaging, maps, and optional gateways

| Variable | Purpose |
| --- | --- |
| `TERMII_API_KEY` | Legacy SMS delivery configuration. Authenticated profile password changes do not require SMS. |
| `TERMII_SENDER_ID` | Termii sender identity. |
| `TWILIO_ACCOUNT_SID` | Optional Twilio account identifier. |
| `TWILIO_AUTH_TOKEN` | Optional Twilio secret. |
| `TWILIO_PHONE_NUMBER` | Optional Twilio sender number. |
| `GOOGLE_MAPS_API_KEY` | Route tracking and map functionality. |
| `PAYSTACK_SECRET_KEY` | Legacy/optional gateway configuration; current checkout uses Flutterwave. |
| `STRIPE_SECRET_KEY` | Legacy/optional gateway configuration. |

## Database workflows

### Generate Prisma Client

Run after installing dependencies or changing `schema.prisma`:

```bash
pnpm db:generate
```

### Create and apply a development migration

```bash
pnpm db:migrate
```

Prisma will request a migration name and create a directory under:

```text
packages/database/prisma/migrations/
```

### Apply committed migrations in production

```bash
pnpm --filter @bglaundry/database exec prisma migrate deploy
```

### Inspect the database

```bash
pnpm --filter @bglaundry/database exec prisma studio
```

### Important database guidance

- Commit schema changes and their migration together.
- Do not use `prisma db push` against production.
- Back up production data before destructive migrations.
- Regenerate Prisma Client after schema changes.
- Use `DIRECT_URL` for migration operations when the runtime URL is pooled.

## Running the applications

Run each surface in its own terminal.

### Web application and API

```bash
pnpm --filter web dev
```

URL: `http://localhost:4000`

API base: `http://localhost:4000/api/v1`

### Customer app

```bash
pnpm --filter customer-app start
```

Platform shortcuts:

```bash
pnpm --filter customer-app ios
pnpm --filter customer-app android
pnpm --filter customer-app web
```

The customer app derives a LAN API URL from Expo's host URI when available. A physical device and development computer must be on the same network, and port `4000` must be reachable.

### Driver app

```bash
pnpm --filter driver-app start
```

Platform shortcuts:

```bash
pnpm --filter driver-app ios
pnpm --filter driver-app android
pnpm --filter driver-app web
```

### Root development command

```bash
pnpm dev
```

This invokes Turborepo's `dev` pipeline. At present, only packages that define a `dev` script participate; use the explicit mobile commands above for Expo.

## Authentication and account security

### Customer authentication

- Customer accounts use normalized phone numbers and passwords.
- Passwords are hashed with bcrypt.
- Successful login returns a 30-day JWT.
- API requests use `Authorization: Bearer <token>`.
- Role checks prevent customer tokens from being used as administrator or rider credentials.

### Password changes

Signed-in customers can change their password from the Profile panel without SMS OTP.

The server requires:

- A valid customer JWT.
- The correct current password.
- A different new password.
- At least eight characters, one letter, and one number.
- A maximum accepted length to limit abuse.

After a successful change, outstanding password-reset tokens are deleted.

An unauthenticated reset without proof of account ownership is intentionally not supported because it would permit account takeover.

### Profile email

Customers can add an optional email address in Profile. Email values are normalized to lowercase, format-validated, and unique across accounts. Storing an email does not automatically enable email delivery; a transactional email provider must be configured and integrated before using it for recovery messages.

## Order lifecycle

Orders use the following primary statuses:

```text
PICKUP_PENDING
PICKUP_IN_PROGRESS
PICKED_UP
PROCESSING
DELIVERY_PENDING
DELIVERY_IN_PROGRESS
DELIVERED
CANCELLED
```

A typical successful order moves through:

```text
Booked
  → Rider assigned
  → Pickup in progress
  → Garments collected
  → Processing/cleaning
  → Delivery pending
  → Delivery in progress
  → Delivered
```

Tracking events record status changes. Pickup and delivery OTP values help the customer and assigned rider verify physical handoffs; these order-verification codes are separate from account/password authentication.

## Flutterwave payment flow

1. The customer books an order.
2. The client sends only the order ID to `/api/v1/payments/initialize`.
3. The backend loads the authoritative order total from PostgreSQL.
4. The backend creates or reuses a pending `FLUTTERWAVE` payment record.
5. The backend requests a hosted payment link from Flutterwave.
6. The mobile app or browser opens Flutterwave Checkout.
7. Flutterwave redirects to `/api/v1/payments/callback`.
8. The backend verifies the transaction directly with Flutterwave.
9. The backend compares status, NGN currency, transaction reference, and paid amount.
10. A signed webhook independently confirms asynchronous payments.
11. The client polls `/api/v1/payments/status` as a fallback confirmation mechanism.

### Flutterwave dashboard configuration

Set the production webhook URL to:

```text
https://YOUR_DOMAIN/api/v1/payments/verify-webhook
```

Set the webhook secret hash to exactly the same value as `FLW_WEBHOOK_SECRET_HASH`.

Recommended production settings:

- HTTPS only.
- Webhook retries enabled.
- Public `APP_URL` or `FLW_REDIRECT_URL`.
- Live credentials stored in the hosting provider's secret manager.
- Separate Flutterwave test and live environments.

## API reference

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/signup` | Create a customer account. |
| `POST` | `/auth/login` | Authenticate a customer and return a JWT. |
| `POST` | `/auth/request-otp` | Legacy/customer OTP request flow. |
| `POST` | `/auth/verify-otp` | Legacy/customer OTP verification flow. |
| `POST` | `/auth/password-reset/request` | Request a password-recovery code where delivery is configured. |
| `POST` | `/auth/password-reset/confirm` | Validate a recovery code and set a new password. |

### Customer profile

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `PATCH` | `/users/profile` | Customer JWT | Update name, phone, email, pickup address, and address type. |
| `POST` | `/users/change-password` | Customer JWT | Change password using the current password. |

### Orders

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/orders/book` | Create an order and its items/tracking record. |
| `GET` | `/orders` | List orders. |
| `GET` | `/orders/:id` | Retrieve an order. |
| `PATCH` | `/orders/:id/assign` | Assign a driver. |
| `PATCH` | `/orders/:id/status` | Update order status. |
| `GET` | `/orders/customer/:customerId` | List customer active/history orders. |
| `GET` | `/orders/driver/:driverId` | List orders assigned to a driver. |

### Riders and drivers

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET/POST` | `/drivers` | List or create driver accounts. |
| `PATCH/DELETE` | `/drivers/:id` | Update or remove a driver. |
| `GET/PATCH` | `/riders/me` | Read or update the authenticated rider profile. |
| `GET` | `/riders/me/orders` | List the authenticated rider's orders. |
| `PATCH` | `/riders/orders/:id/status` | Apply a rider-authorized order transition. |

### Payments

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/payments/initialize` | Create a Flutterwave hosted checkout from an order. |
| `GET` | `/payments/callback` | Handle Flutterwave redirect and verify the transaction. |
| `POST` | `/payments/verify-webhook` | Validate and process signed Flutterwave events. |
| `GET` | `/payments/status?reference=...` | Read local payment status. |

### Administration

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/admin/auth/login` | Authenticate an administrator. |
| `GET` | `/admin/stats` | Retrieve dashboard statistics. |
| `GET` | `/admin/users` | List/manage customer data. |
| `GET/POST` | `/admin/services` | List or create services. |
| `DELETE` | `/admin/services/:id` | Delete a service. |
| `GET/POST` | `/admin/invoices` | List or create invoices. |
| `PATCH` | `/admin/invoices/:id` | Update an invoice. |

Exact request and response shapes are defined by the corresponding `route.ts` files under `apps/web/app/api/v1`.

## Build and validation

### Production web build

```bash
pnpm --filter web build
```

This performs compilation, route generation, lint integration, and Next.js type validation.

### Web TypeScript check

Run after a completed Next.js build so generated `.next/types` files exist:

```bash
pnpm --filter web exec tsc --noEmit --incremental false
```

Do not run this command concurrently with `next build`, because the build regenerates `.next/types`.

### Customer app TypeScript check

```bash
pnpm --filter customer-app exec tsc --noEmit --incremental false
```

### Database package build

```bash
pnpm --filter @bglaundry/database build
```

### Entire Turborepo build

```bash
pnpm build
```

If Turbo remote caching is configured, this command may require access to the relevant credential store. Package-level builds remain useful for isolating local environment problems from application compilation problems.

## Deployment

### Web/API deployment

1. Provision a PostgreSQL database.
2. Configure all required environment secrets in the deployment platform.
3. Install dependencies with the lockfile.
4. Generate Prisma Client.
5. Apply migrations using `prisma migrate deploy`.
6. Build `apps/web`.
7. Start the Next.js production server.
8. Configure the Flutterwave webhook and callback URLs.
9. Verify HTTPS, database connectivity, Firebase initialization, and payment callbacks.

Typical commands:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter @bglaundry/database exec prisma migrate deploy
pnpm --filter web build
pnpm --filter web start
```

The default `web` start script uses Next.js's standard production port unless the hosting platform provides `PORT`.

### Mobile deployment

For production mobile builds:

- Configure the API base URL for the deployed HTTPS backend.
- Use production Firebase configuration.
- Confirm the `bglaundry` deep-link scheme in native builds.
- Configure iOS and Android maps credentials.
- Test Flutterwave return links on physical devices.
- Build and submit through the appropriate Expo/EAS workflow.

## Security checklist

Before production launch:

- Rotate any key ever pasted into chat, logs, tickets, or source files.
- Store secrets in a deployment secret manager.
- Use a strong unique `JWT_SECRET`.
- Remove development and placeholder credentials.
- Require HTTPS for every public endpoint.
- Configure strict production CORS for known web/mobile origins.
- Keep Flutterwave secret keys server-side.
- Match and verify the Flutterwave webhook secret.
- Never trust client-supplied prices, totals, roles, or payment statuses.
- Apply database migrations before serving new code.
- Restrict database networking and use SSL where supported.
- Review API authorization for every administrative and rider route.
- Enable logging and alerting without logging passwords, tokens, OTPs, or full payment data.
- Back up PostgreSQL and test restoration procedures.
- Keep dependencies and mobile SDKs patched.

## Troubleshooting

### Mobile app cannot reach the API

- Confirm the web API is running on port `4000`.
- Use the computer's LAN address rather than `localhost` from a physical device.
- Keep the device and computer on the same network.
- Allow incoming connections through the firewall.
- Test `http://COMPUTER_IP:4000/api/v1/admin/services` from the device.

### Prisma cannot connect

- Confirm PostgreSQL is running: `docker compose ps`.
- Check `DATABASE_URL` and `DIRECT_URL`.
- Confirm port `5432` is not occupied by another database.
- Regenerate Prisma Client after dependency or schema changes.

### Flutterwave checkout opens but does not confirm

- Confirm `APP_URL`/`FLW_REDIRECT_URL` is public and uses HTTPS.
- Verify the webhook URL in the Flutterwave dashboard.
- Confirm `FLW_WEBHOOK_SECRET_HASH` matches the dashboard value.
- Check that the transaction reference, currency, and amount match the local payment.
- Ensure the callback server can access Flutterwave's verification API.

### Firebase Admin initialization fails

- Check project ID, client email, and private key.
- If storing a multiline private key in an environment variable, preserve newline escaping.
- Do not expose Firebase Admin credentials through `NEXT_PUBLIC_` or `EXPO_PUBLIC_` variables.

### Standalone TypeScript reports missing `.next/types`

Run:

```bash
pnpm --filter web build
pnpm --filter web exec tsc --noEmit --incremental false
```

Run them sequentially, not in parallel.

### Root Turbo build fails before running packages

This can indicate a local credential-store, TLS, telemetry, or remote-cache issue. Verify the application independently with:

```bash
pnpm --filter web build
pnpm --filter @bglaundry/database build
```

Then repair the local Turbo environment separately.

## Contributing

1. Create a focused branch from the latest `main`.
2. Keep changes scoped to one feature or fix.
3. Preserve unrelated working-tree changes.
4. Add Prisma migrations for schema changes.
5. Run the relevant builds and type checks.
6. Confirm no credentials are staged.
7. Use a clear conventional commit message.
8. Open a pull request describing behavior, validation, and deployment considerations.

Suggested commit prefixes:

```text
feat:     new behavior
fix:      bug correction
docs:     documentation only
refactor: internal restructuring
test:     test additions or corrections
chore:    tooling or maintenance
```

## License

This repository is private and proprietary unless the project owner adds a separate license file stating otherwise.
