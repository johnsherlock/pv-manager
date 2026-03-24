# Solar Stats Rewrite Architecture

## Goals

- Multi-user from day one
- Low operational cost
- Straightforward local development
- Clean separation between provider ingestion, domain calculations, persistence, and UI
- Strong testability around financial logic

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

### Jobs and ingestion

- Scheduled GitHub Actions or a hosted cron trigger for low-frequency jobs
- Server-side ingestion routes or worker entrypoints callable from scheduled jobs
- Provider adapters so MyEnergi-specific logic does not leak into product code

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

Scheduled Jobs
  -> Provider adapter
  -> Normalize interval readings
  -> Persist readings
  -> Generate daily summaries
  -> Update data-health status
```

## Core Domains

### Identity and ownership

- `User`
- `Installation`
- `ProviderConnection`

### Tariffs and billing

- `TariffPlan`
- `TariffPlanVersion`
- `BillingComparison`

### Energy data

- `EnergyReading`
- `DailySummary`
- `ImportRun`
- `DataHealthEvent`

## Data Model Direction

### User

- identity and auth ownership

### Installation

- timezone
- locale
- finance cost settings
- provider metadata

### TariffPlan and TariffPlanVersion

- supplier and plan identity
- effective date range
- usage rates and export rules
- fixed-charge rules

### EnergyReading

- installation-scoped normalized interval data
- timestamped generation, import, export, and derived consumption

### DailySummary

- precomputed daily totals for reporting and faster aggregation

### BillingComparison

- cached or on-demand comparison outputs for specific periods

## Ingestion Flow

1. Scheduled job identifies installations due for refresh.
2. Provider adapter fetches raw interval data.
3. Raw payload is optionally archived.
4. Data is normalized into installation-scoped interval readings.
5. Daily summaries are recalculated for affected dates.
6. Data-health metadata is updated.

## Query Model

- Live views read the latest available interval readings.
- Historical range views read daily summaries and, where needed, interval readings for detail screens.
- Billing comparison logic resolves tariff versions by date and computes period-specific outputs.

## Local Development

- One app process for frontend and backend behavior
- Local database through Docker or hosted dev database
- No dependency on deployed Lambda functions for normal development
- Seed scripts for sample tariff versions and fixture readings

## Cost Strategy

- Prefer serverless or low-idle managed services
- Persist summaries so range reporting is cheap
- Run ingestion on a schedule rather than using always-on workers
- Keep raw payload storage optional and lifecycle-managed

## Early Deliverables

- monorepo or app workspace with new web app
- schema and migrations
- provider adapter interface
- first-pass MyEnergi adapter
- savings engine package
- authenticated app shell
- overview, live, history, and tariff setup pages

## Risks To Manage

- Financial logic drift if bills are not used early enough
- Overbuilding for scale before the beta product is proven
- Ambiguity in no-solar baseline modeling
- Provider quirks and slow historical import behavior
