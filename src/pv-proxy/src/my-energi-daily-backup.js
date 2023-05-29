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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const http_utils_1 = require("./http-utils");
const my_energi_service_1 = require("./my-energi-service");
const energy_calculator_1 = require("../../shared/energy-calculator");
const energy_utils_1 = require("../../shared/energy-utils");
const username = process.env.MYENERGI_USERNAME;
const password = process.env.MYENERGI_PASSWORD;
const tableName = (_a = process.env.EDDI_DATA_TABLE_NAME) !== null && _a !== void 0 ? _a : 'PVData';
const bucketName = (_b = process.env.EDDI_DATA_BUCKET_NAME) !== null && _b !== void 0 ? _b : 'eddi-backup';
const myenergiAPIEndpoint = 'https://director.myenergi.net';
if (!username || !password) {
    throw new Error('MYENERGI_USERNAME and MYENERGI_PASSWORD must be set as environment variables.');
}
const myEnergiService = new my_energi_service_1.MyEnergiService(myenergiAPIEndpoint);
const dynamoClient = new client_dynamodb_1.DynamoDBClient({ region: 'eu-west-1' });
const s3Client = new client_s3_1.S3Client({ region: 'eu-west-1' });
// TODO: Initialise this dynamically (from props or per user)
const energyCalculator = new energy_calculator_1.EnergyCalculator({
    dayRate: 0.4673,
    peakRate: 0.5709,
    nightRate: 0.3434,
    exportRate: 0.1850,
    discountPercentage: 0.15,
    annualStandingCharge: 257.91,
});
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        let date = ((_c = event.queryStringParameters) === null || _c === void 0 ? void 0 : _c.date) || ((_d = event === null || event === void 0 ? void 0 : event.body) === null || _d === void 0 ? void 0 : _d.date) || (event === null || event === void 0 ? void 0 : event.date);
        console.log(`date: ${date}`);
        // if date is not provided, use yesterday's date in the format YYYY-MM-DD
        if (!date) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            date = yesterday.toISOString().split('T')[0];
        }
        console.log(`Fetching data for ${date}...`);
        const data = yield myEnergiService.getEddiData(date, { serialNumber: username, password: password });
        if (!data || data.length === 0) {
            const message = `No data returned for ${date}`;
            console.log(message);
            return (0, http_utils_1.getHttpResult)(404, message);
        }
        console.log(`Fetched data for ${date}.`, data);
        yield writeToDynamo(data, date);
        yield uploadToS3(data, date);
        return (0, http_utils_1.getHttpResult)(200, 'Data written to DynamoDB and uploaded to S3 for date ' + date);
    }
    catch (error) {
        console.error(error);
        return (0, http_utils_1.getHttpResult)(500, JSON.stringify({ error }));
    }
});
exports.handler = handler;
const writeToDynamo = (data, date) => __awaiter(void 0, void 0, void 0, function* () {
    const minuteData = data.map(energy_utils_1.mapEddiDataToMinutePVData);
    const halfHourData = (0, energy_utils_1.convertMinuteDataToHalfHourlyData)(minuteData);
    const totals = energyCalculator.calculateTotals(halfHourData);
    console.log(`Writing summarised data to DynamoDB for user ${username} and date ${date}...`);
    // update dynamo entry for "serialNumber" with "data" for "date"
    const params = {
        TableName: tableName,
        Item: {
            serialNumber: { S: username },
            date: { S: date },
            data: { S: JSON.stringify(totals) },
        },
    };
    const command = new client_dynamodb_1.PutItemCommand(params);
    yield dynamoClient.send(command);
    console.log('Wrote data to DynamoDB.');
});
const uploadToS3 = (data, date) => __awaiter(void 0, void 0, void 0, function* () {
    // upload data to S3
    const params = {
        Bucket: bucketName,
        Key: `${username}/${date}.json`,
        Body: JSON.stringify(data),
    };
    const command = new client_s3_1.PutObjectCommand(params);
    console.log(`Uploading raw data to s3 for user ${username} and date ${date}...`);
    yield s3Client.send(command);
    console.log('Data uploaded to S3.');
});
