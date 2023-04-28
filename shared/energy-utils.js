"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertMinuteDataToHalfHourlyData = exports.convertMinuteDataToHourlyData = exports.mapEddiDataToMinutePVData = exports.calculateGreenEnergyPercentage = exports.calculateEnergyConsumption = void 0;
const num_utils_1 = require("./num-utils");
const calculateEnergyConsumption = (importedJoules = 0, generatedJoules = 0, immersionDivertedJoules = 0, exportedJoules = 0) => {
    return importedJoules + generatedJoules - immersionDivertedJoules - exportedJoules;
};
exports.calculateEnergyConsumption = calculateEnergyConsumption;
const calculateGreenEnergyPercentage = (importedEnergy = 0, consumedEnergy = 0) => {
    if (importedEnergy === 0) {
        return 100;
    }
    const greenEnergy = consumedEnergy - importedEnergy;
    if (greenEnergy <= 0) {
        return 0;
    }
    const percentage = Math.round((greenEnergy / consumedEnergy) * 100);
    return percentage;
};
exports.calculateGreenEnergyPercentage = calculateGreenEnergyPercentage;
const mapEddiDataToMinutePVData = (item) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const conp = (0, exports.calculateEnergyConsumption)(item.imp, item.gep, item.h1d, item.exp);
    const gepc = (0, exports.calculateGreenEnergyPercentage)(item.imp, conp);
    return {
        year: item.yr,
        month: item.mon,
        dayOfMonth: item.dom,
        dayOfWeek: item.dow,
        hour: (_a = item.hr) !== null && _a !== void 0 ? _a : 0,
        minute: (_b = item.min) !== null && _b !== void 0 ? _b : 0,
        importedJoules: (_c = item.imp) !== null && _c !== void 0 ? _c : 0,
        generatedJoules: (_d = item.gep) !== null && _d !== void 0 ? _d : 0,
        exportedJoules: (_e = item.exp) !== null && _e !== void 0 ? _e : 0,
        immersionDivertedJoules: (_f = item.h1d) !== null && _f !== void 0 ? _f : 0,
        immersionBoostedJoules: (_g = item.h1b) !== null && _g !== void 0 ? _g : 0,
        consumedJoules: conp,
        greenEnergyPercentage: gepc,
    };
};
exports.mapEddiDataToMinutePVData = mapEddiDataToMinutePVData;
const convertMinuteDataToHourlyData = (minuteData = []) => {
    var _a;
    const hourlyTotals = {};
    for (const minuteItem of minuteData) {
        const { hour, importedJoules: importJoules, generatedJoules, exportedJoules: exportJoules, immersionDivertedJoules: immersionDivertedJoules, immersionBoostedJoules: immersionBoostedJoules, consumedJoules, } = minuteItem;
        (_a = hourlyTotals[hour]) !== null && _a !== void 0 ? _a : (hourlyTotals[hour] = Object.assign(Object.assign({}, minuteItem), { minute: 0, importedKwH: 0, generatedKwH: 0, exportedKwH: 0, immersionDivertedKwH: 0, immersionBoostedKwH: 0, immersionDivertedMins: 0, immersionBoostedMins: 0, consumedKwH: 0 }));
        hourlyTotals[hour].importedKwH += (0, num_utils_1.convertJoulesToKwh)(importJoules);
        hourlyTotals[hour].generatedKwH += (0, num_utils_1.convertJoulesToKwh)(generatedJoules);
        hourlyTotals[hour].exportedKwH += (0, num_utils_1.convertJoulesToKwh)(exportJoules);
        hourlyTotals[hour].immersionDivertedKwH += (0, num_utils_1.convertJoulesToKwh)(immersionDivertedJoules);
        hourlyTotals[hour].immersionBoostedKwH += (0, num_utils_1.convertJoulesToKwh)(immersionBoostedJoules);
        hourlyTotals[hour].immersionDivertedMins += immersionDivertedJoules > 0 ? 1 : 0;
        hourlyTotals[hour].immersionBoostedMins += immersionBoostedJoules > 0 ? 1 : 0;
        hourlyTotals[hour].consumedKwH += (0, num_utils_1.convertJoulesToKwh)(consumedJoules);
    }
    // calculate the green energy percentage for each half hour
    for (const halfHour in hourlyTotals) {
        const { importedKwH: importKwH, consumedKwH } = hourlyTotals[halfHour];
        hourlyTotals[halfHour].greenEnergyPercentage = (0, exports.calculateGreenEnergyPercentage)(importKwH, consumedKwH);
    }
    return Object.values(hourlyTotals);
};
exports.convertMinuteDataToHourlyData = convertMinuteDataToHourlyData;
const convertMinuteDataToHalfHourlyData = (minuteData = []) => {
    var _a;
    const halfHourlyTotals = {};
    for (const minuteItem of minuteData) {
        const { hour, minute, importedJoules: importJoules, generatedJoules, exportedJoules: exportJoules, immersionDivertedJoules: immersionDivertedJoules, immersionBoostedJoules: immersionBoostedJoules, consumedJoules, } = minuteItem;
        const halfHour = `${hour}:${minute < 30 ? '00' : '30'}`;
        (_a = halfHourlyTotals[halfHour]) !== null && _a !== void 0 ? _a : (halfHourlyTotals[halfHour] = Object.assign(Object.assign({}, minuteItem), { hour: parseInt(halfHour.split(':')[0]), minute: parseInt(halfHour.split(':')[1]) == 0 ? 0 : 30, importedKwH: 0, generatedKwH: 0, exportedKwH: 0, immersionDivertedKwH: 0, immersionBoostedKwH: 0, consumedKwH: 0, immersionDivertedMins: 0, immersionBoostedMins: 0, greenEnergyPercentage: 0 }));
        halfHourlyTotals[halfHour].importedKwH += (0, num_utils_1.convertJoulesToKwh)(importJoules);
        halfHourlyTotals[halfHour].generatedKwH += (0, num_utils_1.convertJoulesToKwh)(generatedJoules);
        halfHourlyTotals[halfHour].exportedKwH += (0, num_utils_1.convertJoulesToKwh)(exportJoules);
        halfHourlyTotals[halfHour].immersionDivertedKwH += (0, num_utils_1.convertJoulesToKwh)(immersionDivertedJoules);
        halfHourlyTotals[halfHour].immersionBoostedKwH += (0, num_utils_1.convertJoulesToKwh)(immersionBoostedJoules);
        halfHourlyTotals[halfHour].immersionDivertedMins += immersionDivertedJoules > 0 ? 1 : 0;
        halfHourlyTotals[halfHour].immersionBoostedMins += immersionBoostedJoules > 0 ? 1 : 0;
        halfHourlyTotals[halfHour].consumedKwH += (0, num_utils_1.convertJoulesToKwh)(consumedJoules);
        halfHourlyTotals[halfHour].greenEnergyPercentage += (0, exports.calculateGreenEnergyPercentage)(importJoules, consumedJoules);
    }
    // calculate the green energy percentage for each half hour
    for (const halfHour in halfHourlyTotals) {
        const { importedKwH: imp, consumedKwH: conp } = halfHourlyTotals[halfHour];
        halfHourlyTotals[halfHour].greenEnergyPercentage = (0, exports.calculateGreenEnergyPercentage)(imp, conp);
    }
    return Object.values(halfHourlyTotals);
};
exports.convertMinuteDataToHalfHourlyData = convertMinuteDataToHalfHourlyData;
