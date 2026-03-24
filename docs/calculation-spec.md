# Solar Stats Calculation Specification

## Status

This document is the working source of truth for savings and bill-impact logic. It starts with what is known from the existing codebase and product intent, and it must be revised when bills, tariff documents, and sample datasets are added.

Anything uncertain should stay explicit in the "Open Decisions" section until validated.

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

- generation by interval
- import by interval
- export by interval
- consumption by interval if directly available, otherwise derived
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

- uploaded energy bills
- tariff documentation or screenshots
- sample MyEnergi exports
- known-good periods where expected savings are understood
- reference observations from the current app

## Open Decisions

- Does export reduce the reported bill directly or sit beside import savings as a separate value?
- Should savings be reported net of standing charges, or should standing charges always remain in both scenarios?
- Should installation payback be reported only as a simple comparison, or also as rolling cumulative ROI/payback?
- How should incomplete days or partial intervals affect cost modeling?
- Which billing-period artifacts from real supplier bills must be modeled explicitly beyond usage, VAT, and standing charges?

## Next Inputs Needed

- 2 to 3 representative bills
- tariff documentation for the associated periods
- example dates where the current app looks right
- example dates where the current app looks wrong or suspicious
