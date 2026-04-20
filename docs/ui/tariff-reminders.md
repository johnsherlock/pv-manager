# Tariff Reminders and Validity States

This document defines the product behavior and UI treatment for tariff-validity
warnings and contract reminders in the Settings Tariffs section.

It is the design input for `P-043` (schedule-based tariff editor and contract
reminder flows) and documents the decisions made in `U-013`.

Source decisions:

- `F-009` — tariff validity drives calculations; contract dates are reminder
  metadata only
- `U-005` — low-fi wireframes for tariff list, contract details, reminder states
- `docs/ui/settings.md` — Tariffs section structure

---

## Two Distinct Concepts

These two concepts are related but serve different purposes and must be
surfaced separately:

### 1. Tariff Validity (calculation-critical)

Defined by `tariff_plan_versions.valid_to_local_date` on the active version.

**What it means:** The tariff version the app is using to calculate costs and
savings has a defined end date. If that date is in the past, every financial
figure produced since that date is potentially wrong. If it is approaching,
the user needs to add a new version before the existing one expires.

**This state affects product trustworthiness.** It is not a soft reminder —
it means the numbers shown to the user may be incorrect.

### 2. Contract Reminders (metadata only)

Defined by `installation_contracts.contract_end_date` and
`installation_contracts.expected_review_date`.

**What it means:** The user's contract with their supplier has an end date or
a review date they asked to be reminded about. These dates do not affect
calculations — they are reminders to take action in the real world (call
the supplier, renew, compare rates).

**This state does not affect calculations.** It is a user-requested prompt
to take external action.

### Key rule (from F-009)

> Tariff validity drives calculations. Contract dates are reminder metadata
> only. Retrospective tariff correction must be supported.

A user may correct a past tariff version at any time; the app will
recalculate affected summaries. Contract dates never trigger recalculation.

---

## State Definitions

### Tariff Validity States

| State | Condition | Severity |
|---|---|---|
| `validity-expired` | `validToLocalDate` is in the past | Critical (red) |
| `validity-expiring-soon` | `validToLocalDate` is within 30 days | Warning (amber) |
| `validity-ok` | `validToLocalDate` is null or > 30 days away | No banner |

A null `validToLocalDate` means the version has no end date — this is the
normal state for a current tariff and requires no warning.

### Contract Reminder States

| State | Condition | Severity |
|---|---|---|
| `contract-expired` | `contractEndDate` is in the past | Critical (red) |
| `contract-ending-urgent` | `contractEndDate` is within 30 days | Critical (red) |
| `contract-ending-soon` | `contractEndDate` is within 90 days | Warning (amber) |
| `review-due` | `expectedReviewDate` is within 60 days and ≥ today | Warning (amber) |
| `none` | None of the above apply | No banner |

When both `contract-ending-soon` and `review-due` apply, show both messages
in the same banner rather than suppressing either.

When `contract-ending-urgent` or `contract-expired` applies, suppress
`review-due` (the contract state is the more important action).

---

## UI Treatment

### Banner placement

Both banners appear at the top of the Tariffs section content, above the
active tariff card.

Tariff validity banner appears **first** (above contract banner) because it
directly affects the trustworthiness of all displayed numbers.

```
┌─────────────────────────────────────────────────────┐
│  ⚠  Tariff validity banner (if applicable)          │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  ⚠  Contract reminder banner (if applicable)        │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│  ✓  Active tariff card                               │
└─────────────────────────────────────────────────────┘
```

Both banners can appear simultaneously. A user may have an expired tariff
version *and* an approaching contract end date at the same time.

### Tariff validity banner

**Critical (`validity-expired`):**

```
┌──────────────────────────────────────────────────────┐
│ 🔴  Tariff out of date                               │
│     Your active tariff ended on [date]. Financial    │
│     calculations since that date may be incorrect.   │
│     Add a new tariff version to restore accuracy.    │
│                                          Update →    │
└──────────────────────────────────────────────────────┘
```

**Warning (`validity-expiring-soon`):**

```
┌──────────────────────────────────────────────────────┐
│ 🟡  Tariff expires in N days                         │
│     Add a new tariff version before [date] to keep   │
│     calculations accurate.                           │
│                                          Update →    │
└──────────────────────────────────────────────────────┘
```

### Contract reminder banner

**Critical (`contract-expired`):**

```
┌──────────────────────────────────────────────────────┐
│ 🔴  Contract reminder                                │
│     Contract expired                                 │
│     Contract end date: [date].                       │
│     [notes if present]               Review →        │
└──────────────────────────────────────────────────────┘
```

**Warning (ending soon or review due):**

```
┌──────────────────────────────────────────────────────┐
│ 🟡  Contract reminder                                │
│     Contract ends in N days                          │
│     Tariff review due in N days          Review →    │
│     [notes if present]                               │
└──────────────────────────────────────────────────────┘
```

### Visual language

| Severity | Border | Background | Icon colour | Text colour |
|---|---|---|---|---|
| Critical | `red-800/40` | `red-950/30` | `text-red-400` | `text-red-300` |
| Warning | `amber-700/30` | `amber-950/20` | `text-amber-400` | `text-amber-300` |

---

## Corrective Actions

| State | CTA | Destination |
|---|---|---|
| `validity-expired` | "Update tariff →" | Tariff editor (built in P-043) |
| `validity-expiring-soon` | "Update tariff →" | Tariff editor |
| `contract-expired` | "Review contract →" | Contract edit (built in P-043) |
| `contract-ending-*` | "Review contract →" | Contract edit |
| `review-due` | "Review tariff →" | Tariff editor |

All CTAs link to `#` until P-043 builds the editor routes.

---

## Notes Field

`installation_contracts.notes` is a freeform annotation entered by the user
when recording contract details (e.g. "Annual contract with Energia. Rates
reviewed each October."). It is user-supplied context, not structured reminder
metadata. It should render as supplementary copy below the reminder message,
not as the source of any reminder state logic.

---

## Out of Scope

- Email or push notification delivery (can be layered on later)
- Admin reminder tooling
- Outage or anomaly notifications
