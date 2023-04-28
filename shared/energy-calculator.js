"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnergyCalculator = void 0;
const energy_utils_1 = require("./energy-utils");
const numUtils = __importStar(require("./num-utils"));
const initialTotals = () => {
    return {
        genTotal: 0,
        expTotal: 0,
        conpTotal: 0,
        dayImpTotal: 0,
        peakImpTotal: 0,
        nightImpTotal: 0,
        combinedImpTotal: 0,
        freeImpTotal: 0,
        immersionRunTime: 0,
        immersionTotal: 0,
        grossSavingTotal: 0,
    };
};
class EnergyCalculator {
    constructor(props) {
        var _a;
        this.calculateNetCostAtStandardRates = (hour = 0, dow, kWh = 0, round = true) => {
            let multiplier = this.dayRate;
            if ((hour >= 0 && hour <= 8) || hour === 23) {
                multiplier = this.nightRate;
            }
            else if (hour >= 17 && hour < 19) {
                multiplier = this.peakRate;
            }
            if (dow === 'Sat' && hour >= 9 && hour < 17) {
                multiplier = 0;
            }
            const cost = kWh * multiplier;
            return round ? numUtils.formatDecimal(cost) : cost;
        };
        this.calculateDiscountedCostIncludingVat = (hour = 0, dow, kWh = 0, round = true) => {
            const netCostAtStandardRates = this.calculateNetCostAtStandardRates(hour, dow, kWh, round);
            const grossCost = (netCostAtStandardRates * this.discountPercentage) * this.vatRate;
            return round ? numUtils.formatDecimal(grossCost) : grossCost;
        };
        this.calculateSaving = (hour = 0, dow, importedkWh = 0, consumedkWh = 0, round = true) => {
            const greenkWh = consumedkWh - importedkWh;
            return greenkWh > 0 ? this.calculateDiscountedCostIncludingVat(hour, dow, greenkWh, round) : 0;
        };
        this.calculateGrossCostPerHourIncStdChgAndDiscount = (hour = 0, dow, kWh = 0, round = true) => {
            return this.calculateGrossCostIncStdChgAndDiscount(hour, dow, kWh, 'hr', round);
        };
        this.calculateGrossCostPerHalfHourIncStdChgAndDiscount = (hour = 0, dow, kWh = 0, round = true) => {
            return this.calculateGrossCostIncStdChgAndDiscount(hour, dow, kWh, 'hhr', round);
        };
        this.calculateGrossCostPerMinuteIncStdChgAndDiscount = (hour = 0, dow, kWh = 0, round = false) => {
            return this.calculateGrossCostIncStdChgAndDiscount(hour, dow, kWh, 'm', round);
        };
        this.calculateGrossCostIncStdChgAndDiscount = (hour = 0, dow, kWh = 0, timeUnit, round = true) => {
            const netCostAtStandardRates = this.calculateNetCostAtStandardRates(hour, dow, kWh, round);
            const standingCharge = timeUnit === 'hr' ? this.hourlyStandingCharge : timeUnit === 'hhr' ? this.halfHourlyStandingCharge : this.perMinuteStandingCharge;
            const grossCost = ((netCostAtStandardRates * this.discountPercentage) + standingCharge) * this.vatRate;
            return round ? numUtils.formatDecimal(grossCost) : grossCost;
        };
        this.calculateSaturdaySaving = (hour = 0, dow, kWh = 0) => {
            if (kWh && dow === 'Sat' && hour >= 9 && hour <= 17) {
                const netSavingAtStandardRates = kWh * this.dayRate;
                const grossSavingAtDiscountedRates = (netSavingAtStandardRates * this.discountPercentage) * this.vatRate;
                return numUtils.formatDecimal(grossSavingAtDiscountedRates);
            }
            return 0;
        };
        this.calculateDiscountedGrossCostExcludingStdChg = (netCostAtStandardRate = 0) => {
            const grossCost = (netCostAtStandardRate * this.discountPercentage) * this.vatRate;
            return numUtils.formatDecimal(grossCost);
        };
        this.calculateGrossCostIncStandingCharges = (netCost = 0) => {
            const grossCost = ((netCost * this.discountPercentage) + this.hourlyStandingCharge) * this.vatRate;
            return numUtils.formatDecimal(grossCost);
        };
        this.calculateExportValue = (exportKwH = 0) => {
            return numUtils.formatDecimal(exportKwH * this.exportRate);
        };
        this.calculateDailyGrossImportTotal = (totals = initialTotals()) => {
            const discountedDayImportNetCost = (numUtils.convertJoulesToKwh(totals.dayImpTotal - totals.freeImpTotal) * this.dayRate) * this.discountPercentage;
            const discountedPeakImportNetCost = (numUtils.convertJoulesToKwh(totals.peakImpTotal) * this.peakRate) * this.discountPercentage;
            const discountedNightImportNetCost = (numUtils.convertJoulesToKwh(totals.nightImpTotal) * this.nightRate) * this.discountPercentage;
            const discountedNetImportTotal = discountedDayImportNetCost + discountedPeakImportNetCost + discountedNightImportNetCost;
            const grossImportTotal = (discountedNetImportTotal + this.dailyStandingCharge) * this.vatRate;
            return numUtils.formatToEuro(grossImportTotal);
        };
        this.calculateDailyExportTotal = (totals = initialTotals()) => {
            const grossExportTotal = (numUtils.convertJoulesToKwh(totals.expTotal) * this.exportRate);
            return numUtils.formatToEuro(grossExportTotal);
        };
        this.calculateDailyGreenEnergyCoverage = (totals = initialTotals()) => {
            return numUtils.formatDecimal(100 - ((totals.combinedImpTotal / totals.conpTotal) * 100));
        };
        this.calculateTotalImportedKwH = (pvData = []) => {
            return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.importedKwH, 0));
        };
        this.calculateTotalGeneratedKwH = (pvData = []) => {
            return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.generatedKwH, 0));
        };
        this.calculateTotalConsumedKwH = (pvData = []) => {
            return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.consumedKwH, 0));
        };
        this.calculateTotalExportedKwH = (pvData = []) => {
            return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.exportedKwH, 0));
        };
        this.calculateTotalImmersionDivertedKwH = (pvData = []) => {
            return numUtils.formatDecimal(pvData.reduce((acc, item) => acc + item.immersionDivertedKwH, 0));
        };
        this.calculateTotalImmersionBoostedKwH = (pvData = []) => {
            return numUtils.formatDecimal(pvData.reduce((acc, item) => { var _a; return acc + ((_a = item.immersionBoostedKwH) !== null && _a !== void 0 ? _a : 0); }, 0));
        };
        this.calculateTotalImmersionDivertedMins = (pvData = []) => {
            return pvData.reduce((acc, item) => { var _a; return acc + ((_a = item.immersionDivertedMins) !== null && _a !== void 0 ? _a : 0); }, 0);
        };
        this.calculateTotalImmersionBoostedMins = (pvData = []) => {
            return pvData.reduce((acc, item) => { var _a; return acc + ((_a = item.immersionBoostedMins) !== null && _a !== void 0 ? _a : 0); }, 0);
        };
        this.calculateTotalGrossImportCost = (pvData = []) => {
            return pvData.reduce((acc, item) => acc + this.calculateGrossCostPerHalfHourIncStdChgAndDiscount(item.hour, item.dayOfWeek, item.importedKwH), 0);
        };
        this.calculateTotalGrossSavings = (pvData = []) => {
            return pvData.reduce((acc, item) => acc + this.calculateSaving(item.hour, item.dayOfWeek, item.importedKwH, item.consumedKwH), 0);
        };
        this.calculateTotalExportValue = (pvData = []) => {
            return pvData.reduce((acc, item) => acc + this.calculateExportValue(item.exportedKwH), 0);
        };
        this.calculateFreeImportGrossTotal = (pvData = []) => {
            const freeImportedKwh = pvData.filter(item => item.dayOfWeek === 'Sat' && item.hour >= 9 && item.hour < 17);
            return numUtils.formatDecimal(freeImportedKwh.reduce((acc, item) => acc + this.calculateSaturdaySaving(item.hour, item.dayOfWeek, item.importedKwH), 0));
        };
        this.calculaterTotalGreenEnergyCoverage = (pvData = []) => {
            const totalImportedKwH = this.calculateTotalImportedKwH(pvData);
            const totalConsumedKwH = this.calculateTotalConsumedKwH(pvData);
            return (0, energy_utils_1.calculateGreenEnergyPercentage)(totalImportedKwH, totalConsumedKwH);
        };
        this.calculateTotals = (pvData) => {
            console.log('Recaculating totals');
            const totals = initialTotals();
            pvData.forEach((item) => {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                totals.combinedImpTotal += (_a = item.importedKwH) !== null && _a !== void 0 ? _a : 0;
                totals.genTotal += (_b = item.generatedKwH) !== null && _b !== void 0 ? _b : 0;
                totals.expTotal += (_c = item.exportedKwH) !== null && _c !== void 0 ? _c : 0;
                totals.conpTotal += (_d = item.consumedKwH) !== null && _d !== void 0 ? _d : 0;
                totals.immersionRunTime += (item.immersionBoostedKwH || item.immersionDivertedKwH) ? 1 : 0;
                totals.immersionTotal += (_e = item.immersionDivertedKwH) !== null && _e !== void 0 ? _e : 0;
                totals.grossSavingTotal += this.calculateSaving(item.hour, item.dayOfWeek, item.importedKwH, item.consumedKwH, false);
                if (item.hour >= 17 && item.hour < 19)
                    totals.peakImpTotal += (_f = item.importedKwH) !== null && _f !== void 0 ? _f : 0;
                else if ((item.hour >= 0 && item.hour < 8) || item.hour === 23)
                    totals.nightImpTotal += (_g = item.importedKwH) !== null && _g !== void 0 ? _g : 0;
                else if (item.dayOfWeek === 'Sat' && item.hour >= 9 && item.hour < 17)
                    totals.freeImpTotal += (_h = item.importedKwH) !== null && _h !== void 0 ? _h : 0;
                else
                    totals.dayImpTotal += (_j = item.importedKwH) !== null && _j !== void 0 ? _j : 0;
            });
            return Object.assign(Object.assign({}, totals), { combinedImpTotal: totals.peakImpTotal + totals.nightImpTotal + totals.dayImpTotal });
        };
        this.dayRate = props.dayRate;
        this.peakRate = props.peakRate;
        this.nightRate = props.nightRate;
        this.exportRate = props.exportRate;
        this.discountPercentage = 1 - props.discountPercentage;
        this.annualStandingCharge = props.annualStandingCharge;
        this.dailyStandingCharge = props.annualStandingCharge / 365;
        this.hourlyStandingCharge = this.dailyStandingCharge / 24;
        this.halfHourlyStandingCharge = this.hourlyStandingCharge / 2;
        this.perMinuteStandingCharge = this.halfHourlyStandingCharge / 30;
        this.vatRate = (_a = props.vatRate) !== null && _a !== void 0 ? _a : 1.09;
    }
}
exports.EnergyCalculator = EnergyCalculator;
