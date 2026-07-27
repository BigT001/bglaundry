# BG Laundry & Dry Cleaning

BG Laundry is a private, multi-application platform for managing laundry bookings, payments, fulfillment, riders, customers, pricing, and administrative operations.

> **Internal project notice**
>
> This repository and its documentation are intended for authorized BG Laundry contributors only. Do not copy internal configuration, credentials, customer information, payment data, infrastructure details, or operational procedures into public issues, screenshots, chat messages, or external documentation.

## Contents

- [Product overview](#product-overview)
- [Workspace applications](#workspace-applications)
- [Shared packages](#shared-packages)
- [Core capabilities](#core-capabilities)
- [Technology summary](#technology-summary)
- [Repository layout](#repository-layout)
- [Development setup](#development-setup)
- [Database development](#database-development)
- [Running the applications](#running-the-applications)
- [Payments](#payments)
- [Authentication and account management](#authentication-and-account-management)
- [Build and validation](#build-and-validation)
- [Deployment guidance](#deployment-guidance)
- [Security expectations](#security-expectations)
- [Contribution workflow](#contribution-workflow)

## Product overview

The platform connects the main participants in BG Laundry operations:

- **Customers** browse services, create bookings, pay, and track laundry orders.
- **Riders** receive assigned jobs and complete approved pickup and delivery workflows.
- **Administrators** manage customers, riders, orders, services, pricing, invoices, and operational reporting.
- **Operations staff** use shared order and tracking information to coordinate the full laundry lifecycle.

The system is maintained as a pnpm monorepo. It contains a web application, a customer mobile application, a rider mobile application, and reusable business/data packages.

## Workspace applications

### Web application

Location: `apps/web`

The web workspace provides:

- Public marketing and service pages.
- Responsive customer booking and account experiences.
- Administrative dashboards.
- Server-side application endpoints.
- Database-backed order and service management.
- Payment-provider integration.
- Customer profile and account security controls.
- Invoice and reporting functionality.

The web workspace is both the browser application and the server application. Contributors should not assume that a separate backend service must be started.

### Customer mobile application

Location: `apps/customer-app`

The customer application provides:

- Customer sign-in and account persistence.
- Service discovery and dynamic pricing.
- Laundry basket management.
- Pickup and delivery scheduling.
- Order creation and payment handoff.
- Active-order tracking.
- Completed booking history.
- Profile and address management.

The application uses Expo Router and shares the server-side business data exposed by the web workspace.

### Rider mobile application

Location: `apps/driver-app`

The rider application provides:

- Rider authentication.
- Assigned-order visibility.
- Pickup and delivery workflows.
- Approved order status transitions.
- Verification during physical handoff.
- Route and location support.
- Earnings visibility.

Rider behavior should remain consistent with the shared rider rules in the workspace packages.

## Shared packages

### Database package

Location: `packages/database`

This package contains:

- The Prisma schema.
- Versioned database migrations.
- Generated database client exports.
- Shared database types and enums.

Database changes must be made through the schema and migration workflow. Direct production schema changes are not permitted.

### Rider domain package

Location: `packages/rider-core`

This package centralizes rider-related rules shared between the server and rider application. Status rules should be updated here when behavior must remain identical across applications.

## Core capabilities

### Customer experience

- Account creation and sign-in.
- Profile, contact, and address management.
- Authenticated password changes.
- Service catalogue and price display.
- Basket and quantity management.
- Booking and pickup scheduling.
- Secure hosted payment checkout.
- Order verification and progress tracking.
- Active and completed booking views.

### Rider experience

- Role-specific access.
- Assigned job lists.
- Pickup and delivery confirmation.
- Location-assisted route workflows.
- Controlled fulfillment status updates.
- Earnings information.

### Administrative experience

- Protected administrator access.
- Operational summary dashboard.
- Customer and rider management.
- Service and pricing administration.
- Order assignment and oversight.
- Invoice management.
- Business reporting.

### Payment experience

- Server-created payment sessions.
- Hosted checkout.
- Server-side payment verification.
- Asynchronous payment confirmation.
- Local payment-state reconciliation.

## Technology summary

| Area | Technology |
| --- | --- |
| Workspace | pnpm workspaces, Turborepo |
| Web/server | Next.js, React, TypeScript |
| Mobile | Expo, React Native, Expo Router |
| Data | PostgreSQL, Prisma |
| Authentication | JWT and password hashing |
| Payments | Flutterwave |
| External services | Firebase, object storage, maps/location providers |

Versions are defined by the workspace manifests and lockfile. Treat those files as the source of truth instead of copying version numbers into operational documents.

## Repository layout

```text
apps/
  web/             Web experience, administration, and server application
  customer-app/    Customer Expo application
  driver-app/      Rider Expo application

packages/
  database/        Prisma schema, migrations, and database exports
  rider-core/      Shared rider-domain rules

docker-compose.yml
package.json
pnpm-workspace.yaml
turbo.json
```

Detailed endpoint maps, infrastructure diagrams, credential locations, and production topology are intentionally excluded from this file. Authorized maintainers should use the source code and the organization's protected operational documentation.

## Development setup

### Requirements

- A current supported Node.js LTS release.
- pnpm compatible with the repository lockfile.
- An approved PostgreSQL development database.
- Docker when using the provided local database service.
- Expo-compatible mobile tooling when working on mobile applications.
- Authorized development credentials for any external service being tested.

### Install dependencies

```bash
pnpm install
```

### Configure the local environment

Use ignored environment files for local configuration. Obtain development values from an authorized maintainer or the approved secret manager.

Do not:

- Commit environment files.
- Paste credentials into README files.
- reuse production credentials locally.
- place server secrets in public/mobile environment variables.
- share environment screenshots.

### Start the local database

The repository contains a Docker Compose service for development:

```bash
docker compose up -d
```

Connection values belong in local ignored environment files. They are deliberately not documented here.

### Prepare the database client

```bash
pnpm db:generate
```

### Apply development migrations

```bash
pnpm db:migrate
```

## Database development

The database schema and migrations are maintained in `packages/database`.

When changing persisted data:

1. Update the Prisma schema.
2. Create a clearly named development migration.
3. Review generated SQL before applying it.
4. Regenerate the database client.
5. Update affected server and application types.
6. Test both existing and new data paths.
7. Commit the schema and migration together.

Production migrations must be applied through the approved deployment workflow. Never run destructive development commands against production.

Useful development commands:

```bash
pnpm db:generate
pnpm db:migrate
pnpm --filter @bglaundry/database build
```

## Running the applications

Run each application in a separate terminal.

### Web/server workspace

```bash
pnpm --filter web dev
```

### Customer application

```bash
pnpm --filter customer-app start
```

Available platform commands are defined in `apps/customer-app/package.json`.

### Rider application

```bash
pnpm --filter driver-app start
```

Available platform commands are defined in `apps/driver-app/package.json`.

### Root development pipeline

```bash
pnpm dev
```

Only workspaces defining the relevant pipeline script participate. Mobile applications may still need to be started explicitly.

## Payments

Flutterwave is used for customer checkout.

The integration follows these principles:

- Payment sessions are created by the server.
- Prices and totals are verified against authoritative server data.
- Secret credentials never enter browser or mobile bundles.
- Checkout results are verified with the payment provider.
- Asynchronous confirmations are authenticated before processing.
- Payment updates are designed to be safe when delivered more than once.
- Orders are not treated as paid solely because a client reports success.

Provider configuration, callback addresses, signing values, test data, and live credentials are maintained outside this README in protected configuration.

Before modifying payments:

- Review the complete server-side flow.
- Use provider test mode.
- Test successful, failed, cancelled, delayed, and duplicate events.
- Confirm amount, currency, reference, and final state.
- Never log full payment payloads or credentials.

## Authentication and account management

The platform uses role-aware authentication for customers, riders, and administrators.

General rules:

- Passwords are never stored in plain text.
- Sensitive account changes require an authenticated session.
- Customer password changes verify the current password.
- Password policies are enforced on the server.
- Role checks are required for protected operations.
- Contact information is validated before persistence.
- Account recovery must prove account ownership.

Unauthenticated password changes without identity verification are not allowed. Contributors must not weaken authentication to work around unavailable SMS or email services.

Implementation-specific token claims, credential formats, fallback behavior, and administrative bootstrap details are intentionally omitted.

## Build and validation

### Web production build

```bash
pnpm --filter web build
```

### Web TypeScript validation

Run this after the production build so generated framework types exist:

```bash
pnpm --filter web exec tsc --noEmit --incremental false
```

Do not run the web build and standalone web type check concurrently because the build regenerates its type output.

### Customer application validation

```bash
pnpm --filter customer-app exec tsc --noEmit --incremental false
```

### Database package validation

```bash
pnpm --filter @bglaundry/database build
```

### Workspace build

```bash
pnpm build
```

If a root orchestration command fails before executing package tasks, validate the affected package directly and investigate the local orchestration environment separately.

## Deployment guidance

Deployment is handled only by authorized maintainers.

At a high level, deployment requires:

1. Approved production configuration from the secret manager.
2. Dependency installation from the lockfile.
3. Database client generation.
4. Reviewed production migrations.
5. Application build and validation.
6. Secure release of the web/server application.
7. External-provider configuration checks.
8. Post-deployment health and critical-flow verification.

This README intentionally excludes:

- Hosting account identifiers.
- Production domains and network topology.
- Database hosts or connection strings.
- Callback and webhook addresses.
- Credential and secret names used by production.
- Administrative account details.
- Cloud bucket names or endpoints.
- Mobile signing information.
- Internal monitoring and incident-response procedures.

Refer to protected operational documentation for deployment-specific instructions.

## Security expectations

Every contributor is responsible for protecting the platform and customer data.

### Never commit

- Environment files.
- API keys or private keys.
- Passwords or access tokens.
- Database connection strings.
- Service-account documents.
- Real customer information.
- Payment payloads.
- Production logs.
- Mobile signing credentials.

### Before committing

1. Review the complete diff.
2. Confirm only intended files are staged.
3. Search staged content for secrets and personal data.
4. Run relevant builds and type checks.
5. Confirm debug logs do not expose sensitive information.
6. Check that authorization is enforced server-side.

### If a secret is exposed

Treat it as compromised:

1. Notify an authorized maintainer privately.
2. Rotate or revoke the credential immediately.
3. Replace it in the approved secret manager.
4. Review logs for unauthorized use.
5. Remove the value from current files and, when required, repository history.
6. Do not repeat the secret in an issue or commit message.

## Contribution workflow

1. Begin from the latest approved branch state.
2. Keep changes focused and reviewable.
3. Preserve unrelated work in the working tree.
4. Add migrations for database schema changes.
5. Validate all affected applications.
6. Review staged changes for sensitive content.
7. Use a clear commit message.
8. Push through the approved repository workflow.

Suggested commit prefixes:

```text
feat:     new behavior
fix:      bug correction
docs:     documentation
refactor: internal restructuring
test:     validation coverage
chore:    tooling or maintenance
```

## Ownership

This project is private and proprietary to BG Laundry. Access does not grant permission to redistribute the source code, documentation, assets, customer information, or operational knowledge.
