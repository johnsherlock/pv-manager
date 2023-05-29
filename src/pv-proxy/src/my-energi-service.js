"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyEnergiService = void 0;
const axios_digest_auth_1 = __importDefault(require("@mhoc/axios-digest-auth"));
const luxon_1 = require("luxon");
class MyEnergiService {
    constructor(myenergiAPIEndpoint) {
        this.myenergiAPIEndpoint = myenergiAPIEndpoint;
    }
    validateCredentials(credentials) {
        if (!credentials.serialNumber) {
            throw new Error('Missing serial number parameter');
        }
        if (!credentials.password) {
            throw new Error('Missing password parameter');
        }
    }
    validateDateFormat(date) {
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!datePattern.test(date)) {
            throw new Error('Invalid date format. Expected format is YYYY-MM-DD');
        }
        const parsedDate = luxon_1.DateTime.fromISO(date, { setZone: true });
        if (!parsedDate.isValid) {
            throw new Error(`Invalid date: ${parsedDate.invalidExplanation}`);
        }
    }
    validateInputs(date, credentials, locale) {
        if (!date) {
            throw new Error('Missing date parameter');
        }
        if (!luxon_1.IANAZone.isValidSpecifier(locale)) {
            throw new Error(`Invalid locale ${locale}`);
        }
        this.validateDateFormat(date);
        this.validateCredentials(credentials);
    }
    getEddiData(date, credentials, locale = 'Europe/London') {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('Getting data for', date);
            this.validateInputs(date, credentials, locale);
            const dateTime = luxon_1.DateTime.fromISO(date, { zone: locale });
            const offsetInHours = dateTime.offset / 60;
            console.log('Offset in hours', offsetInHours);
            const minutesInDay = 1440;
            let adjustedDateTime = dateTime.minus({ hours: offsetInHours });
            const url = `${this.myenergiAPIEndpoint}/cgi-jday-E${credentials.serialNumber}-${adjustedDateTime.toISODate()}-${adjustedDateTime.hour}-${adjustedDateTime.minute}-${minutesInDay}`;
            console.log('Fetching data from', url);
            const digestAuth = new axios_digest_auth_1.default({ password: credentials.password, username: credentials.serialNumber });
            const response = yield digestAuth.request({
                headers: { Accept: 'application/json' },
                method: 'GET',
                url,
            });
            const eddiData = response.data[`U${credentials.serialNumber}`];
            return this.adjustEddiDataForTimeZoneAndApplyDefaults(eddiData, dateTime);
        });
    }
    adjustEddiDataForTimeZoneAndApplyDefaults(eddiData, dateTime) {
        const offsetInHours = dateTime.offset / 60;
        console.log(`Timezone offset ${offsetInHours} hours`);
        const dowArray = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
        return eddiData.map((data) => {
            var _a, _b;
            // adjust the hour for the timezone and ensure both hr and min are set
            data.hr = ((_a = data.hr) !== null && _a !== void 0 ? _a : 0) + offsetInHours;
            let dayAdjustment = 0;
            if (data.hr >= 24) {
                data.hr %= 24;
                dayAdjustment = 1;
            }
            else if (data.hr < 0) {
                data.hr += 24;
                dayAdjustment = -1;
            }
            if (dayAdjustment !== 0 && data.dow) {
                const currentIndex = dowArray.indexOf(data.dow);
                const newIndex = (currentIndex + dayAdjustment + dowArray.length) % dowArray.length;
                data.dow = dowArray[newIndex];
            }
            data.min = (_b = data.min) !== null && _b !== void 0 ? _b : 0;
            return data;
        });
    }
}
exports.MyEnergiService = MyEnergiService;
