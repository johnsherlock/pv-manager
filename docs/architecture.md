# Solar Stats Rewrite Architecture

## Goals

- Multi-user from day one
- Low operational cost
- Straightforward local development
- Clean separation between provider ingestion, domain calculations, persistence, and UI
- Strong testability around financial logic
- Centralized logs and operational visibility for app requests and background jobs
- Strong privacy and deletion guarantees for beta-user data

## Recommended Stack

### Application

- Next.js with TypeScript
- App Router for authenticated product pages and server-side data access
- Tailwind CSS and a headless component library for a modern UI foundation
- TanStack Query for client data fetching where interactive caching is useful

### Backend and data

- Supabase Auth for invite-only beta authentication
- Postgres for core relational data
- Supabase Storage only if raw provider payload archival is still useful
- Drizzle ORM for schema management and typed queries
- Secrets kept in the hosting platform or database provider secret store, never in client-visible config

### Jobs and ingestion

- Platform-native scheduled jobs or cron within the same operational environment as the app
- Secure internal job entrypoints for ingestion, backfill, repair, and summary rebuild work
- Provider adapters so MyEnergi-specific logic does not leak into product code
- Provider payloads normalized into a canonical internal energy-reading model before domain logic runs
- Centralized structured logging for web requests, job runs, and provider sync failures

### Testing

- Vitest for unit and domain tests
- Playwright for end-to-end UI coverage in the new app

## High-Level Shape

```text
Web App
  -> Product UI
  -> Server routes / actions
  -> Domain services
  -> Postgres
  -> Storage (optional for raw payloads)
  -> Centralized logs / metrics

Scheduled Jobs
  -> Internal authenticated job trigger
  -> Provider adapter
  -> Normalize interval readings
  -> Persist readings
  -> Generate daily summaries
  -> Update data-health status
  -> Centralized logs / metrics
```

## Core Domains

### Identity and ownership

- `User`
- `Installation`
- `ProviderConnection`
- `DeletionRequest`

### Tariffs and billing

- `TariffPlan`
- `TariffPlanVersion`
- `BillingComparison`

### Energy data

- `EnergyReading`
- `DailySummary`
- `ImportRun`
- `DataHealthEvent`
- `JobRun`
- `ProviderRawImport`

## Data Model Direction

### User

- identity and auth ownership
- deletion status and retention lifecycle where needed

### Installation

- timezone
- locale
- finance cost settings
- provider metadata
- privacy-scoped ownership boundary for all related readings and summaries

### TariffPlan and TariffPlanVersion

- supplier and plan identity
- effective date range
- usage rates and export rules
- fixed-charge rules

### EnergyReading

- installation-scoped normalized interval data
- timestamped generation, import, export, and derived consumption
- canonical internal representation used by savings logic regardless of upstream provider

### ProviderRawImport

- optional archival of provider-native payloads for debugging, repair, and adapter evolution
- explicitly separate from the canonical reading model used by product logic

### DailySummary

- precomputed daily totals for reporting and faster aggregation

### BillingComparison

- cached or on-demand comparison outputs for specific periods

### JobRun

- central record of scheduled job execution, status, scope, timing, and error summary

## Ingestion Flow

1. A platform-native scheduled job triggers a secure internal job entrypoint.
2. The job identifies installations due for refresh.
3. The provider adapter fetches provider-native raw interval data.
4. Raw payload is optionally archived with retention rules.
5. The adapter canonicalizes provider-native fields into the internal `EnergyReading` format.
6. Daily summaries are recalculated for affected dates.
7. Data-health metadata is updated.
8. A `JobRun` record and centralized logs capture outcome, counts, and failures.

Supplier bills and manually exported supplier interval files may still be used during development as offline validation evidence, but they are not part of the intended product ingestion workflow.

## Canonical Energy Model

The core financial and reporting logic should never depend directly on a provider-specific schema.

Instead:

- each provider adapter maps raw payloads into a canonical internal format
- the savings engine, summaries, and UI queries operate only on canonical readings
- provider-specific quirks remain isolated to adapter and import layers

For beta v1:

- MyEnergi is expected to be the primary solar telemetry source
- supplier bills and manually exported supplier interval data are validation evidence for development, not runtime product inputs
- comparison between supplier-side import evidence and MyEnergi-derived behavior should be supported as internal validation tooling, not as a beta user-facing workflow
- provider-specific timezone behavior should be normalized inside the adapter boundary rather than assumed by the core model

The initial product can be MyEnergi-only while still enforcing this boundary.

Minimum canonical fields expected in the internal model:

- installation identifier
- timestamp and timezone context
- generated energy
- imported energy
- exported energy
- consumed energy, whether provided directly or derived
- optional provider metadata for traceability

Timezone note:

- many providers may expose timestamps in UTC or another provider-defined convention
- the adapter must normalize raw timestamps into a canonical representation with explicit timezone context
- DST and date-boundary handling are adapter concerns first, not savings-engine concerns

## Job Types

The initial scheduled jobs should stay low-frequency and cheap:

- `daily-import`
  - imports the previous finalized day for active installations
- `recent-refresh`
  - refreshes the latest available intervals for live-ish views on a modest cadence
- `backfill-import`
  - imports a requested historical range after onboarding or repair
- `rebuild-summaries`
  - recomputes daily summaries when calculation logic or tariff history changes
- `data-health-check`
  - detects stale connections, missing days, and repeated provider failures

## Job Entrypoints

Use secure server-side entrypoints inside the app or worker environment rather than public-facing APIs.

Typical examples:

- internal HTTP route such as `POST /api/internal/jobs/daily-import`
- internal task handler such as `runDailyImport()`

Requirements:

- only invokable by platform cron or privileged server-side callers
- protected with shared secret, signed request, or platform-native internal auth
- produce structured logs and persisted `JobRun` metadata
- avoid exposing user identifiers or credentials in logs

## Query Model

- Live views read the latest available interval readings.
- Historical range views read daily summaries and, where needed, interval readings for detail screens.
- Billing comparison logic resolves tariff versions by date and computes period-specific outputs.

## Local Development

- One app process for frontend and backend behavior
- Local database through Docker or hosted dev database
- No dependency on deployed Lambda functions for normal development
- Seed scripts for sample tariff versions and fixture readings
- Job handlers should be runnable locally without the production scheduler

## Cost Strategy

- Prefer serverless or low-idle managed services
- Persist summaries so range reporting is cheap
- Run ingestion on a schedule rather than using always-on workers
- Keep raw payload storage optional and lifecycle-managed
- Prefer keeping cron, logs, and runtime in one provider surface where possible

## Privacy and Security

- Use invite-only auth for the initial beta.
- Encrypt or provider-manage encryption for secrets and sensitive connection details.
- Apply row ownership and least-privilege access to all user data.
- Keep logs free of raw credentials and unnecessary personally identifying data.
- Provide account closure and deletion workflows that remove user-owned operational data from primary stores.
- Treat operator access to user data as exceptional, auditable, and minimized by design.

## Early Deliverables

- monorepo or app workspace with new web app
- schema and migrations
- provider adapter interface
- first-pass MyEnergi adapter
- canonical energy-reading model
- savings engine package
- internal validation tooling for bill and supplier-data comparison
- authenticated app shell
- overview, live, history, and tariff setup pages
- supplier-data reconciliation strategy

## Risks To Manage

- Financial logic drift if bills are not used early enough
- Overbuilding for scale before the beta product is proven
- Ambiguity in no-solar baseline modeling
- Provider quirks and slow historical import behavior
- Privacy or deletion requirements being discovered too late and forcing schema or logging rework
- Allowing provider-specific assumptions to leak into the canonical model and reporting layer
