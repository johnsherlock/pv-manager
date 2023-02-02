export const formatDecimal = number => Math.round(number * 100) / 100;
export const convertJoulesToKwh = joules => joules ? (joules / 3600000) : '';