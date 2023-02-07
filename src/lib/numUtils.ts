export const formatDecimal = (number: number): number => Math.round(number * 100) / 100;
export const convertJoulesToKwh = (joules: number): number => ((joules / 3600000));
