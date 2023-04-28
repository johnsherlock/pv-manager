"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToEuro = exports.convertJoulesToKw = exports.convertJoulesToKwh = exports.formatDecimal = void 0;
const formatDecimal = (number = 0, decimalPlaces = 2) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
};
exports.formatDecimal = formatDecimal;
const convertJoulesToKwh = (joules = 0, round) => round ? (0, exports.formatDecimal)(joules / 3600000) : joules / 3600000;
exports.convertJoulesToKwh = convertJoulesToKwh;
const convertJoulesToKw = (energy) => {
    // Calculate power in watts
    const powerWatts = energy / 60;
    // Convert power to kilowatts
    return powerWatts / 1000;
};
exports.convertJoulesToKw = convertJoulesToKw;
const formatToEuro = (amount = 0) => `€${amount.toFixed(2)}`;
exports.formatToEuro = formatToEuro;
