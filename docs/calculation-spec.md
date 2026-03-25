# Solar Stats Calculation Specification

## Status

This document is the working source of truth for savings and bill-impact logic. It starts with what is known from the existing codebase and product intent, and it must be revised when bills, tariff documents, and sample datasets are added.

Anything uncertain should stay explicit in the "Open Decisions" section until validated.

Supplier bills and manually exported supplier CSV files referenced here are development-only validation evidence. They are not intended to become runtime application inputs or a user-facing upload feature.

## Primary Financial Outputs

The product should be able to compute, for any supported period:

- actual import cost
- standing charges and other fixed charges
- export credit or export value
- estimated net bill impact
- estimated "without solar" bill for the same period
- savings attributable to solar
- savings relative to install cost or finance cost
- self-consumption and grid-dependence percentages

## Working Definitions

### Actual bill impact

The modeled electricity cost for the period using the user's real measured import, export, and tariff rules active on each date.

### No-solar baseline

A modeled counterfactual representing what the user would likely have paid if the same household demand had occurred without solar generation.

Initial intent:

- household demand still exists
- solar generation is removed as a supply source
- export disappears because unused generation would not exist
- the shortfall is assumed to come from the grid under the tariff active at the time

### Solar savings

The difference between the no-solar baseline and the actual bill impact for the same period.

### Installation payback view

A comparison between solar-attributed savings and the user's installation cost, finance cost, or target payback period.

## Inputs Required

### Meter or provider inputs

- solar/provider telemetry by interval, such as generation, export, immersion, and derived consumption
- supplier or meter import data by interval where available
- supplier billing-period totals and charges
- timestamps and timezone context

### Tariff inputs

- day rate
- peak rate
- night rate
- export rate
- VAT rate
- standing charge
- other recurring charges such as PSO or equivalent
- discount rules
- free-energy windows if applicable
- tariff version effective start and end dates

### User economic inputs

- monthly finance payment, if financed
- upfront install cost, if owned outright
- optional target payback assumptions

## Known Logic In Current Code

The current proof of concept includes logic for:

- day, peak, night, and free pricing tiers
- VAT application
- standing charge handling
- monthly PSO charge handling
- export valuation
- green-energy saving calculations
- date-range aggregation

Observed values in the current code are implementation detail only and should not be treated as validated business truth.

## Calculation Areas To Validate

### 1. Import cost

Validate:

- how import is bucketed into tariff windows
- whether discounts are applied before or after VAT
- whether standing charges should be apportioned daily or by billing period
- whether free-energy windows are applied as zero-cost import or as credited import

### 2. Export treatment

Validate:

- whether export is a separate credit line or offsets import directly
- whether export should be included in "savings" or shown alongside savings
- whether export should be treated differently across tariff plans

### 3. No-solar baseline

Validate:

- whether baseline demand should be modeled as `consumption` or `import + self-consumed generation`
- whether immersion-diverted energy should be treated as household demand, avoided export, or a distinct category
- whether the same tariff windows and fixed charges apply unchanged in the baseline

### 4. Fixed charges

Validate:

- standing charge treatment
- PSO or equivalent recurring charges
- any supplier discounts or credits that depend on billing period rather than interval usage

### 5. Tariff versioning

Validate:

- how periods spanning plan changes are partitioned
- whether bills must be reconstructed daily, monthly, or by billing period
- whether tariff metadata should include supplier name and product identifier for auditability

## Proposed Domain Outputs

The savings engine should return structured outputs rather than UI-shaped values:

```ts
type BillingComparison = {
  periodStart: string;
  periodEnd: string;
  actual: {
    importCost: number;
    fixedCharges: number;
    exportCredit: number;
    grossCost: number;
    netCost: number;
  };
  withoutSolar: {
    importCost: number;
    fixedCharges: number;
    grossCost: number;
    netCost: number;
  };
  solar: {
    savings: number;
    exportValue: number;
    selfConsumptionRatio: number;
    gridDependenceRatio: number;
  };
};
```

## Evidence Sources

This document should be updated from:

- supplied energy bills
- tariff documentation or screenshots
- manually exported supplier CSV evidence
- sample MyEnergi exports
- known-good periods where expected savings are understood
- reference observations from the current app

## Evidence Inventory In Repo

Current evidence files under [`sample data/`](/Users/john/Documents/Projects/pv-manager/sample%20data):

- [Mar-Apr 25 billing period.png](/Users/john/Documents/Projects/pv-manager/sample%20data/Mar-Apr%2025%20billing%20period.png)
- [May-July 25 billing period.png](/Users/john/Documents/Projects/pv-manager/sample%20data/May-July%2025%20billing%20period.png)
- [July-Aug 25 billing period.png](/Users/john/Documents/Projects/pv-manager/sample%20data/July-Aug%2025%20billing%20period.png)
- [Sept-Oct 25 billing period.png](/Users/john/Documents/Projects/pv-manager/sample%20data/Sept-Oct%2025%20billing%20period.png)
- [Nov-Dec 25 billing period.png](/Users/john/Documents/Projects/pv-manager/sample%20data/Nov-Dec%2025%20billing%20period.png)
- [Jan-Feb 26 billing period.png](/Users/john/Documents/Projects/pv-manager/sample%20data/Jan-Feb%2026%20billing%20period.png)
- [02-05-25 to 03-07-25.csv](/Users/john/Documents/Projects/pv-manager/sample%20data/02-05-25%20to%2003-07-25.csv)
- [09-07-25.csv](/Users/john/Documents/Projects/pv-manager/sample%20data/09-07-25.csv)

## Observed Billing Evidence

### Tariff windows seen on supplied Energia bills

- day or smart day: all other times
- night: 11pm to 8am
- peak: 5pm to 7pm

These windows align with the current proof-of-concept assumptions and should be used as the initial validation target.

### March to May 2025 billing period

From the supplied bill:

- billing period: 2025-02-28 to 2025-05-02
- day rate: `0.3451`
- night rate: `0.1848`
- peak rate: `0.3617`
- standing charge: `0.59` per day
- PSO levy: `3.23` per month
- export credit: `0.20` per unit

### May to July 2025 billing period

From the supplied bill:

- billing period: 2025-05-02 to 2025-07-03
- day rate: `0.3451`
- night rate: `0.1848`
- peak rate: `0.3617`
- standing charge: `0.59` per day
- PSO levy: `3.23` per month
- export credit: `0.20` per unit

The supplier export [02-05-25 to 03-07-25.csv](/Users/john/Documents/Projects/pv-manager/sample%20data/02-05-25%20to%2003-07-25.csv) appears to represent half-hourly Energia-side usage across this same bill window:

- `63` daily rows
- `48` half-hour intervals per day
- first date: `2025-05-02`
- last date: `2025-07-03`

Initial bucketing of this CSV using the bill's day/night/peak windows approximately reproduces the billed usage totals, but not perfectly. That strongly suggests we need to validate one or more of:

- inclusive vs exclusive billing-period boundaries
- supplier-specific treatment of boundary dates
- daylight-saving or clock-change handling
- meter reconciliation or rounding behavior

This is useful because it gives us a concrete fixture for bill-reconstruction tests and for internal reconciliation against MyEnergi-derived household usage during development.

### Initial supplier-versus-MyEnergi comparison

Using the live minute-data API and filtering on the local date fields returned by the payload:

- requested `2025-05-07`
  - MyEnergi-derived import: about `5.0116 kWh`
  - supplier CSV total for `2025-05-07`: `5.3490 kWh`
- requested `2025-07-09`
  - MyEnergi-derived import: about `5.3079 kWh`
  - supplier CSV total for `2025-07-09`: `5.6525 kWh`

Tariff-bucket comparison for `2025-07-09` is also directionally close:

- supplier CSV
  - day: `1.2310`
  - night: `3.2385`
  - peak: `1.1830`
- MyEnergi-derived import
  - day: `1.2536`
  - night: `2.8642`
  - peak: `1.1901`

Interpretation:

- the supplier CSV is likely much closer to billed grid import than to total household consumption
- MyEnergi minute `imp` data appears directionally comparable and therefore useful for reconciliation
- the remaining mismatch is likely due to boundary handling, supplier reconciliation, or clock/tariff bucketing differences rather than the two sources measuring entirely different concepts

### Strong alignment example: 2025-11-01

For `2025-11-01`, the supplier CSV and the MyEnergi-derived import align very closely:

- supplier CSV total: `14.0040 kWh`
- MyEnergi-derived import total: `13.9277 kWh`

Tariff buckets also align closely:

- supplier CSV
  - day: `7.3345`
  - night: `3.5955`
  - peak: `3.0740`
- MyEnergi-derived import
  - day: `7.3011`
  - night: `3.5713`
  - peak: `3.0554`

This is currently the clearest evidence that:

- the timezone-adjusted API can be normalized correctly by filtering on returned local date fields
- MyEnergi `imp` is a strong comparison source for supplier-side import data
- earlier summer mismatches are likely dominated by boundary or DST effects rather than a bad mapping model

## Source-of-Truth Distinction

Two materially different data sources are now in scope and must stay distinct in the model:

### 1. Supplier-side billing and import evidence

Examples:

- Energia bills
- Energia CSV interval exports

Primary uses:

- reconstruct billed import, fixed charges, VAT, discounts, and export credit treatment
- validate tariff windows and tariff-version transitions
- provide the closest available reference to what the user was actually charged
- provide a comparison target for MyEnergi-derived import totals

Important boundary:

- this evidence is for development-time validation and calibration
- it is not a planned end-user ingestion path for the product
- users should not need to upload supplier CSVs for the app to work

### 2. MyEnergi solar-side telemetry

Examples:

- raw MyEnergi API payloads
- normalized solar interval readings derived from the MyEnergi API

Primary uses:

- generation, export, immersion, and solar-behavior views
- household energy modeling
- no-solar baseline and savings analysis
- comparison and reconciliation against supplier-side billed import during internal validation

These sources should not be treated as interchangeable, even if they cover overlapping periods.

Implication for the model:

- supplier data is the best evidence for billed import and statement reconstruction
- MyEnergi data is the best evidence for solar behavior and internal energy-flow modeling
- development tooling should support comparing and reconciling the two where periods overlap
- supplier-side import should be treated as the stronger source for billed import validation when available

### July to August 2025 billing period

From the supplied bill:

- billing period: 2025-07-03 to 2025-08-29
- day rate: `0.3451`
- night rate: `0.1848`
- peak rate: `0.3617`
- standing charge: `0.59` per day
- PSO levy: `3.23` per month
- export credit: `0.20` per unit

### September to October 2025 billing period

This bill clearly demonstrates a rate change inside one billing period.

Observed split:

- standing charge split across `40` days at `0.59` and `22` days at `0.66`
- day units split across `0.3451` and `0.3865`
- night units split across `0.1848` and `0.2125`
- peak units split across `0.3617` and `0.434`
- export units split across `0.20` and `0.185`

This is the strongest current evidence that tariff versioning must work at sub-billing-period granularity.

### November to January billing period

From the supplied bill:

- billing period: 2025-10-30 to 2026-01-02
- day rate: `0.3865`
- night rate: `0.2125`
- peak rate: `0.434`
- standing charge: `0.66` per day
- export credit: `0.185` per unit

The bill also shows Public Service Obligation levy values changing within the broader period, which means fixed-charge modeling may also need date-ranged versions, not just unit-rate versions.

### January to February 2026 billing period

The supplied bill for 2026-01-02 to 2026-02-27 is split into subperiods and the user has indicated that this period also reflects a mid-period rate change or renewal effect.

Action:

- validate the exact trigger for the split from the full bill and tariff documentation
- confirm whether the visible line items represent changed rates, changed discounts, changed contract period, or monthly charge boundaries

## Open Decisions

- Does export reduce the reported bill directly or sit beside import savings as a separate value?
- Should savings be reported net of standing charges, or should standing charges always remain in both scenarios?
- Should installation payback be reported only as a simple comparison, or also as rolling cumulative ROI/payback?
- How should incomplete days or partial intervals affect cost modeling?
- Which billing-period artifacts from real supplier bills must be modeled explicitly beyond usage, VAT, and standing charges?
- Should billing-period reconstruction use daily tariff resolution, statement-line reconstruction, or both?
- How should supplier CSV boundary dates be interpreted when statement totals do not exactly match interval totals?
- How should reconciliation between supplier import data and MyEnergi-derived usage be represented when they differ?

## Next Inputs Needed

- tariff documentation for the supplied periods, if available
- confirmation from supplier documentation of what the CSV represents exactly, even though initial comparisons suggest it is close to billed import
- example dates where the current app looks right
- example dates where the current app looks wrong or suspicious
- MyEnergi credentials only when we are ready to validate solar-side telemetry against supplier-side billed or interval data
