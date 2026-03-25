# Solar Stats Delivery Backlog

This backlog is the working delivery tracker for the rewrite. It should be updated as work is completed or as discoveries introduce new items.

Status values:

- `Todo`
- `In Progress`
- `Blocked`
- `Done`
- `Deferred`

## Phase 1: Discovery and Product Definition

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-001 | Discovery | Write product brief | Capture the product goal, target users, success criteria, and non-goals. | `docs/product-brief.md` exists and reflects the rewrite direction. | None | Done | Seeded from planning discussion. |
| D-002 | Discovery | Write use-case inventory | Capture the user questions and major product flows the new app must support. | `docs/use-cases.md` exists with core stories and acceptance notes. | D-001 | Done | Seeded from planning discussion and current-app audit. |
| D-003 | Discovery | Audit current app features | Capture current live-app behaviors and codebase features as reference material only. | Current feature set is summarized and gaps are noted for the rewrite. | None | Done | Live browser audit completed; current app remains reference only. |
| D-004 | Discovery | Gather financial evidence | Collect bills, tariff docs, and sample datasets for validation. | Source files are available in an agreed location and referenced from docs. | None | Done | Initial Energia bills and supplier CSV exports are present under `sample data/` and referenced from the calculation spec. |
| D-005 | Discovery | Define success metrics | Decide how we will judge the rewrite for product quality and correctness. | Product and engineering success metrics are documented. | D-001 | Done | Included in the product brief. |
| D-006 | Discovery | Define privacy expectations | Capture beta-user privacy, deletion, and operator-access expectations before implementation starts. | Privacy requirements are documented and reflected in architecture and backlog. | D-001 | Done | Seeded from user feedback on privacy and trust. |

## Phase 2: Financial Model and Validation

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | Financial Model | Create calculation spec | Turn product intent and current known rules into an explicit working spec. | `docs/calculation-spec.md` exists with known logic, open decisions, and required evidence. | D-001, D-002 | Done | Must be revised when bills and sample data arrive. |
| F-002 | Financial Model | Define "saving" | Decide what counts as savings and how it is presented. | Savings definition is written and approved in the calculation spec. | F-001, D-004 | Todo | Needs bill-backed validation. |
| F-003 | Financial Model | Define no-solar baseline | Decide how the counterfactual bill is modeled. | Baseline logic is written with examples and edge cases. | F-001, D-004 | Todo | High-impact modeling decision. |
| F-004 | Financial Model | Define export treatment | Decide whether export offsets import directly or is shown separately. | Export treatment is documented and testable. | F-001, D-004 | Todo | Must align with real bill semantics. |
| F-005 | Financial Model | Define fixed-charge handling | Validate standing charge, PSO, VAT, discount, and bill-period rules. | Fixed charges and tax treatment are documented with examples. | F-001, D-004 | In Progress | Bills now show both unit-rate and fixed-charge splits, including PSO changes inside broader periods. |
| F-006 | Financial Model | Define tariff versioning rules | Model plan changes across time without breaking history. | Date-ranged tariff rules are documented and examples span a plan change. | F-001 | In Progress | Sept-Oct 2025 provides a concrete mid-billing-period rate-change example. |
| F-007 | Financial Model | Build golden fixtures | Turn bills and sample datasets into repeatable validation fixtures. | Fixture set exists with expected outputs for multiple periods. | D-004, F-002, F-003, F-004, F-005 | Todo | Use anonymized or reduced samples where possible. |
| F-008 | Financial Model | Define supplier-vs-solar reconciliation rules | Decide how supplier interval data and MyEnergi telemetry are compared when validating bills and usage models. | Reconciliation approach is documented, including expected mismatches and what source is authoritative for each use case. | D-004, F-007 | In Progress | `2025-11-01` shows very close alignment between supplier CSV import and MyEnergi `imp`, strengthening the reconciliation approach. |
| F-009 | Financial Model | Define tariff validity versus contract dates | Separate tariff validity windows from contract end dates and define how reminders and recalculation should work. | The model distinguishes tariff validity from contract dates and supports retrospective correction. | F-006 | Todo | Suppliers can change rates mid-contract, so contract dates are not sufficient for calculation logic. |

## Phase 3: Data Model and Platform

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P-001 | Data Model | Choose final stack | Confirm the new runtime, hosting, auth, database, and job strategy. | `docs/architecture.md` reflects final chosen stack and rationale. | D-001, D-002 | In Progress | Current recommendation is Next.js + Supabase + Postgres + scheduled jobs. |
| P-002 | Data Model | Define domain entities | Specify `User`, `Installation`, `TariffPlan`, `TariffPlanVersion`, `EnergyReading`, `DailySummary`, and `BillingComparison`. | Architecture doc includes entity responsibilities and relationships. | P-001, F-006 | In Progress | Needs schema-level detail next. |
| P-003 | Data Model | Define ingestion workflow | Describe scheduled import, normalization, summary generation, and health tracking. | Architecture doc includes ingestion and query flow. | P-001 | Done | Initial workflow documented. |
| P-004 | Data Model | Define local-dev approach | Ensure the new app can run locally without deployed Lambdas. | Local-dev expectations are documented in architecture notes. | P-001 | Done | Included in architecture doc. |
| P-005 | Data Model | Design persistence schema | Translate domain entities into relational schema and migration plan. | Schema proposal exists with tables, keys, and constraints. | P-002, F-006 | Todo | First implementation-level design task. |
| P-006 | Deployment / Operations | Centralize job execution and logs | Keep scheduled jobs, app runtime, and operational visibility within one coherent platform surface where possible. | Job strategy and logging approach are documented and avoid split-brain operations. | P-001, P-003 | Todo | Avoid dispersing logs across GitHub and hosting if beta scale grows to 100 users. |
| P-007 | Auth / Multi-user | Design privacy and deletion model | Ensure account deletion, data removal, and least-privilege access are first-class in the schema and architecture. | Deletion, retention, and access-control requirements are documented and mapped to entities. | D-006, P-002 | Todo | Should cover user trust and likely GDPR-adjacent expectations. |
| P-008 | Ingestion | Define canonical energy model | Create a provider-agnostic internal reading format so core logic is insulated from MyEnergi-specific payloads. | Canonical reading fields and adapter boundary are documented and reflected in schema design. | P-002, P-003 | Todo | Important guardrail even if MyEnergi remains the only provider initially. |
| P-009 | Ingestion | Design provider adapter contract | Define how provider-specific import code maps raw payloads into canonical readings. | Adapter responsibilities and input/output contract are documented. | P-008 | Deferred | Do enough for MyEnergi first without overbuilding multi-provider support; include provider-specific timestamp and timezone normalization rules at the adapter boundary. |
| P-010 | Ingestion | Model supplier-side interval imports separately | Keep supplier billing/interval data distinct from solar-provider telemetry while allowing reconciliation. | Architecture and schema distinguish supplier interval imports from canonical solar readings. | P-005, F-008 | Todo | Needed because Energia CSV data is not the same source or schema as MyEnergi. |
| P-011 | Deployment / Operations | Design provider health-check jobs | Define the hourly provider-health check, stale-data detection rules, and internal job flow for alerting users. | Health-check cadence, failure heuristics, and job responsibilities are documented. | P-003, P-006 | Todo | Start with hourly checks and email notifications. |

## Phase 4: Product and UX

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| U-001 | UX / Visual Design | Define product information architecture | Organize the new app around user decisions, not legacy dashboards. | Primary navigation and page list are documented. | D-002, P-001 | Todo | Expected top-level areas: Overview, Live, History, Tariffs, Setup, Data Health. |
| U-002 | UX / Visual Design | Design overview experience | Make bill impact and solar value the primary entry point. | Overview requirements are documented with sections and KPIs. | U-001, F-002, F-003 | Todo | Must answer the main product question quickly. |
| U-003 | Historical Views | Design historical exploration | Define how day, week, month, year, and custom analysis works. | Historical-view behavior and required charts/tables are documented. | U-001 | Todo | Replace current dense range screens with clearer decision-first views. |
| U-004 | Live Data | Design live monitoring view | Define the live experience for current import, generation, export, and coverage. | Live view requirements are documented. | U-001 | Todo | Should surface stale data clearly. |
| U-005 | Tariff Management | Design tariff setup and version history | Define the UX for managing tariff plans over time. | Tariff management flows are documented. | U-001, F-006 | Todo | A critical new feature. |
| U-006 | UX / Visual Design | Replace date-range UX | Define simple, explicit controls for day/week/month/year/custom selection. | Range-selection behavior is documented and disconnected from a single fragile datepicker. | U-001, U-003 | Todo | Likely use presets plus `react-day-picker`. |
| U-007 | UX / Visual Design | Rationalize charts | Keep only charts that answer a clear user question. | Chart inventory exists with purpose per chart and removed charts identified. | U-002, U-003, U-004 | Todo | Donut chart is intentionally under review. |
| U-012 | Live Data | Surface current-day data health warnings | Show users when current-day data appears incomplete, stale, or suspicious. | Live and current-day views display clear warnings when health heuristics fail. | U-004, P-011 | Todo | Important because users may otherwise miss provider/device outages. |
| U-013 | Tariff Management | Add tariff-validity and contract reminders | Notify users when tariff validity or contract dates have passed and their setup may be stale. | UX supports reminders, warnings, and easy correction of tariff validity periods. | U-005, F-009 | Todo | Contract end date and tariff validity are related but separate concepts. |
| U-008 | Historical Views | Add same-day-last-year comparisons | Preserve the idea of seasonal comparison insights as a later feature. | Use case and future requirements are documented. | U-003 | Deferred | Long-finger item, not needed for initial beta. |
| U-009 | Historical Views | Add best-day insights | Surface highest-generation or standout-performance days in chosen periods. | Future requirements are documented with candidate metrics. | U-003 | Deferred | Fun and useful, but not launch-critical. |
| U-010 | UX / Visual Design | Design annual wrap-up | Create a year-end summary concept with stats, highlights, and charts. | Future requirements are documented for later scoping. | U-002, U-003 | Deferred | Engagement feature for later. |
| U-011 | Live Data | Add forecast-informed outlook | Explore adding weather-informed projection for upcoming days. | Future requirements and data-source assumptions are documented. | U-004 | Deferred | Not part of initial core delivery. |

## Phase 5: Quality and Delivery

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Q-001 | Testing / Quality | Define validation strategy | Decide how bills, fixtures, and UI checks will validate correctness. | Quality strategy is written and tied to backlog items. | F-007, U-001 | Todo | Should combine unit, fixture, and e2e checks. |
| Q-002 | Testing / Quality | Add billing parity tests | Ensure calculations match expected bill outcomes. | Golden tests exist for multiple billing periods. | F-007 | Todo | Core confidence gate before beta. |
| Q-003 | Testing / Quality | Add tariff transition tests | Ensure date-ranged tariff changes produce correct outputs. | Regression tests cover periods spanning tariff changes. | F-006, F-007 | Todo | High-risk edge case. |
| Q-004 | Deployment / Operations | Define beta release workflow | Document how the new app will be tested by you first, then invited beta users. | Release workflow and rollout criteria are documented. | P-001, Q-001 | Todo | Keep scope small and operational overhead low. |
| Q-005 | Testing / Quality | Define privacy and deletion verification | Ensure deletion and access controls are tested, not just documented. | Test plan includes account deletion, data isolation, and restricted operator access scenarios. | P-007 | Todo | Important for beta trust. |
| Q-006 | Testing / Quality | Create provider reconciliation analysis tool | Build a repeatable repo tool to compare supplier CSV data against MyEnergi API data by date, interval, tariff bucket, and billed cost. | A script or tool exists that fetches API data, normalizes it, compares it to supplier CSV and bill data, and outputs useful diagnostics. | F-008, P-008 | Todo | Use this to validate DST handling, boundary effects, provider timestamp normalization, bill reconstruction, and future regression tests. |

## Current Priorities

1. Resolve the open financial-model decisions in `docs/calculation-spec.md` using the supplied Energia bills and supplier CSV exports.
2. Create the provider reconciliation analysis tool and use it to tighten DST and boundary handling.
3. Define how supplier-side interval data and MyEnergi telemetry will be reconciled.
4. Turn the architecture direction into a concrete schema proposal.
5. Define the canonical energy model and provider adapter boundary before writing product code.
6. Define the privacy, deletion, centralized job/logging, and provider health-check model before writing product code.
7. Define the information architecture and overview/historical UX before writing product code.

## Active Risks

- Financial logic may drift if billing evidence arrives too late.
- "No solar" baseline modeling can become hand-wavy without explicit examples.
- Tariff versioning affects schema, APIs, and reporting, so delays there create downstream churn.
- Rebuilding the UI before the reporting model is settled would create avoidable rework.
- Splitting jobs and observability across providers too early may create operational blind spots for beta support.
- Privacy and deletion requirements touch schema, logs, storage, and support workflows, so delaying them increases rework.
- Even with one provider at launch, letting MyEnergi schema leak into core logic would make future ingestion sources much harder to add.
