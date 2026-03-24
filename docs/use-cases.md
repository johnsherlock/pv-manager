# Solar Stats Use Cases

## Core User Stories

### UC-001 Live monitoring

As a user, I want to see my current generation, consumption, import, export, and solar coverage so I can understand what my system is doing right now.

Acceptance notes:

- Show live or most recent interval data.
- Make solar coverage and grid reliance easy to interpret.
- Surface stale or missing data clearly.

### UC-002 Daily review

As a user, I want to inspect a single day's energy activity so I can understand when I relied on the grid, when I exported, and what that day cost or saved me.

Acceptance notes:

- Support a specific calendar date.
- Show interval-level trends for import, generation, consumption, and export.
- Show daily totals and bill-impact summary.

### UC-003 Historical range analysis

As a user, I want to review week, month, year, and custom date ranges so I can understand longer-term patterns in usage, savings, and grid dependence.

Acceptance notes:

- Support day, week, month, year, and custom ranges.
- Summaries and charts should use persisted historical data.
- The range view should answer a financial question, not just restate raw totals.

### UC-004 Savings vs no-solar baseline

As a user, I want to compare my actual bill impact with an estimated no-solar scenario so I can tell whether solar ownership is worth it.

Acceptance notes:

- Present actual import cost, export credit, and net effect.
- Present a modeled "without solar" cost for the same period.
- Present the difference as savings with a clear explanation of assumptions.

### UC-005 Installation payback tracking

As a user, I want to compare energy-bill reduction against my solar finance or ownership cost so I can tell whether the installation is paying for itself.

Acceptance notes:

- Support monthly finance cost and annualized ownership reporting.
- Show savings relative to installation cost over a chosen period.
- Keep the calculation understandable and traceable.

### UC-006 Tariff-aware history

As a user, I want the app to apply the correct energy plan for the relevant date range so that my savings calculations remain accurate after I switch plan.

Acceptance notes:

- Users can create tariff plan versions with effective dates.
- Historical queries use the tariff active at the time.
- Periods spanning plan changes are handled correctly.

### UC-007 Export understanding

As a user, I want to understand how export credits affect my bill and my overall solar value so I can reason about self-consumption versus export behavior.

Acceptance notes:

- Show export volume and export value.
- Make it clear whether export is offsetting import or reported separately.
- Keep the calculation terminology consistent.

### UC-008 Installation setup

As a user, I want to configure my installation, provider credentials, locale, and defaults so the app can calculate my data correctly.

Acceptance notes:

- Users can define installation profile and timezone.
- Credentials are stored securely.
- Data ingestion validates the setup and reports health.

### UC-009 Data quality and trust

As a user, I want to know whether my data is complete and up to date so I can trust the conclusions shown in the app.

Acceptance notes:

- Show last successful import.
- Flag missing or partial days.
- Surface backfill status and ingestion failures.

### UC-010 Beta multi-user support

As an operator, I want multiple users to access isolated data and tariff setups so the product can be tested beyond a single household.

Acceptance notes:

- Authenticated access per user.
- Data isolation by user and installation.
- No hardcoded serial numbers or tariff assumptions in the UI or API.

## Questions The Product Must Answer

- What did my home cost me in electricity over a chosen period?
- What would that same period likely have cost without solar?
- How much value did generation and export create?
- How much of my usage was covered by self-generated energy?
- Is my current tariff helping or hurting the economics?
- Is my installation cost being offset by bill reduction?

## Reference Features From The Current App

The current proof-of-concept already demonstrates these behaviors and should be treated as reference material only:

- live-ish daily monitoring
- single-day graphing
- range summaries
- tariff-aware savings calculations
- import/export and green-energy coverage views
- automatic daily summarization for fast historical reporting

## Explicitly Deprioritized

- Reproducing every existing chart
- Dense dashboard layouts that trade clarity for volume
- Provider expansion before the MyEnergi flow is stable
