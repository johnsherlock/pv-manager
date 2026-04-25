import type {
  FinanceInputs,
  FinanceSettingsPayload,
  FinanceValidationResult,
} from './finance-types';

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export function validateFinanceInputs(inputs: FinanceInputs): FinanceValidationResult {
  if (!inputs.investmentDate) {
    return { valid: false, reason: 'Investment date is required.' };
  }
  if (inputs.upfrontPayment == null && inputs.monthlyRepayment == null) {
    return { valid: false, reason: 'At least one of upfront payment or monthly repayment is required.' };
  }
  if (inputs.monthlyRepayment != null && inputs.repaymentDurationMonths == null) {
    return { valid: false, reason: 'Repayment duration is required when monthly repayment is set.' };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

export function deriveTotalInvestment(inputs: FinanceInputs): number {
  const upfront = inputs.upfrontPayment ?? 0;
  const repaymentTotal =
    inputs.monthlyRepayment != null && inputs.repaymentDurationMonths != null
      ? inputs.monthlyRepayment * inputs.repaymentDurationMonths
      : 0;
  return upfront + repaymentTotal;
}

/**
 * Returns elapsed whole months between two ISO date strings.
 * Uses year/month arithmetic — no partial-month rounding, consistent with
 * the "approximate" framing of the investment date.
 */
export function elapsedMonths(fromDateStr: string, toDate: Date): number {
  const from = new Date(fromDateStr);
  const years = toDate.getFullYear() - from.getFullYear();
  const months = toDate.getMonth() - from.getMonth();
  return Math.max(0, years * 12 + months);
}

export function deriveRemainingMonths(
  inputs: FinanceInputs,
  today: Date,
): number | null {
  if (!inputs.investmentDate || inputs.repaymentDurationMonths == null) {
    return null;
  }
  const elapsed = elapsedMonths(inputs.investmentDate, today);
  return Math.max(0, inputs.repaymentDurationMonths - elapsed);
}

export function deriveOutstandingBalance(
  inputs: FinanceInputs,
  today: Date,
): number | null {
  if (inputs.monthlyRepayment == null) return null;
  const remaining = deriveRemainingMonths(inputs, today);
  if (remaining == null) return null;
  return remaining * inputs.monthlyRepayment;
}

// ---------------------------------------------------------------------------
// Payload builder
// ---------------------------------------------------------------------------

export function buildFinanceSettingsPayload(
  inputs: FinanceInputs,
  today: Date = new Date(),
): FinanceSettingsPayload {
  if (!inputs.investmentDate) {
    return { configured: false };
  }
  return {
    configured: true,
    investmentDate: inputs.investmentDate,
    upfrontPayment: inputs.upfrontPayment,
    monthlyRepayment: inputs.monthlyRepayment,
    repaymentDurationMonths: inputs.repaymentDurationMonths,
    totalInvestment: deriveTotalInvestment(inputs),
    remainingMonths: deriveRemainingMonths(inputs, today),
    outstandingBalance: deriveOutstandingBalance(inputs, today),
  };
}
