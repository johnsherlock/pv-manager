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
| D-004 | Discovery | Gather financial evidence | Collect bills, tariff docs, and sample datasets for validation. | Source files are available in an agreed location and referenced from docs. | None | Blocked | Waiting for user uploads. |
| D-005 | Discovery | Define success metrics | Decide how we will judge the rewrite for product quality and correctness. | Product and engineering success metrics are documented. | D-001 | Done | Included in the product brief. |

## Phase 2: Financial Model and Validation

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | Financial Model | Create calculation spec | Turn product intent and current known rules into an explicit working spec. | `docs/calculation-spec.md` exists with known logic, open decisions, and required evidence. | D-001, D-002 | Done | Must be revised when bills and sample data arrive. |
| F-002 | Financial Model | Define "saving" | Decide what counts as savings and how it is presented. | Savings definition is written and approved in the calculation spec. | F-001, D-004 | Todo | Needs bill-backed validation. |
| F-003 | Financial Model | Define no-solar baseline | Decide how the counterfactual bill is modeled. | Baseline logic is written with examples and edge cases. | F-001, D-004 | Todo | High-impact modeling decision. |
| F-004 | Financial Model | Define export treatment | Decide whether export offsets import directly or is shown separately. | Export treatment is documented and testable. | F-001, D-004 | Todo | Must align with real bill semantics. |
| F-005 | Financial Model | Define fixed-charge handling | Validate standing charge, PSO, VAT, discount, and bill-period rules. | Fixed charges and tax treatment are documented with examples. | F-001, D-004 | Todo | Current code has assumptions that may not be correct. |
| F-006 | Financial Model | Define tariff versioning rules | Model plan changes across time without breaking history. | Date-ranged tariff rules are documented and examples span a plan change. | F-001 | Todo | Required before schema finalization. |
| F-007 | Financial Model | Build golden fixtures | Turn bills and sample datasets into repeatable validation fixtures. | Fixture set exists with expected outputs for multiple periods. | D-004, F-002, F-003, F-004, F-005 | Todo | Use anonymized or reduced samples where possible. |

## Phase 3: Data Model and Platform

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P-001 | Data Model | Choose final stack | Confirm the new runtime, hosting, auth, database, and job strategy. | `docs/architecture.md` reflects final chosen stack and rationale. | D-001, D-002 | In Progress | Current recommendation is Next.js + Supabase + Postgres + scheduled jobs. |
| P-002 | Data Model | Define domain entities | Specify `User`, `Installation`, `TariffPlan`, `TariffPlanVersion`, `EnergyReading`, `DailySummary`, and `BillingComparison`. | Architecture doc includes entity responsibilities and relationships. | P-001, F-006 | In Progress | Needs schema-level detail next. |
| P-003 | Data Model | Define ingestion workflow | Describe scheduled import, normalization, summary generation, and health tracking. | Architecture doc includes ingestion and query flow. | P-001 | Done | Initial workflow documented. |
| P-004 | Data Model | Define local-dev approach | Ensure the new app can run locally without deployed Lambdas. | Local-dev expectations are documented in architecture notes. | P-001 | Done | Included in architecture doc. |
| P-005 | Data Model | Design persistence schema | Translate domain entities into relational schema and migration plan. | Schema proposal exists with tables, keys, and constraints. | P-002, F-006 | Todo | First implementation-level design task. |

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

## Phase 5: Quality and Delivery

| ID | Epic | Title | Objective | Acceptance Criteria | Dependencies | Status | Notes / Discoveries |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Q-001 | Testing / Quality | Define validation strategy | Decide how bills, fixtures, and UI checks will validate correctness. | Quality strategy is written and tied to backlog items. | F-007, U-001 | Todo | Should combine unit, fixture, and e2e checks. |
| Q-002 | Testing / Quality | Add billing parity tests | Ensure calculations match expected bill outcomes. | Golden tests exist for multiple billing periods. | F-007 | Todo | Core confidence gate before beta. |
| Q-003 | Testing / Quality | Add tariff transition tests | Ensure date-ranged tariff changes produce correct outputs. | Regression tests cover periods spanning tariff changes. | F-006, F-007 | Todo | High-risk edge case. |
| Q-004 | Deployment / Operations | Define beta release workflow | Document how the new app will be tested by you first, then invited beta users. | Release workflow and rollout criteria are documented. | P-001, Q-001 | Todo | Keep scope small and operational overhead low. |

## Current Priorities

1. Get bills, tariff docs, and sample datasets into the repo or an agreed staging area.
2. Resolve the open financial-model decisions in `docs/calculation-spec.md`.
3. Turn the architecture direction into a concrete schema proposal.
4. Define the information architecture and overview/historical UX before writing product code.

## Active Risks

- Financial logic may drift if billing evidence arrives too late.
- "No solar" baseline modeling can become hand-wavy without explicit examples.
- Tariff versioning affects schema, APIs, and reporting, so delays there create downstream churn.
- Rebuilding the UI before the reporting model is settled would create avoidable rework.
