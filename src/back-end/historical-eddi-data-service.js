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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const dynamo = new aws_sdk_1.DynamoDB.DocumentClient();
const tableName = 'eddi-data';
function queryData(serialNumber, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            TableName: tableName,
            KeyConditionExpression: 'serialNumber = :serialNumber AND #date BETWEEN :startDate AND :endDate',
            ExpressionAttributeNames: {
                '#date': 'date',
            },
            ExpressionAttributeValues: {
                ':serialNumber': serialNumber,
                ':startDate': startDate,
                ':endDate': endDate,
            },
        };
        console.log('Querying dynamo with payload', params);
        const response = yield dynamo.query(params).promise();
        return response.Items;
    });
}
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    if (!event.queryStringParameters) {
        return { statusCode: 400, body: 'Missing required query parameters' };
    }
    const { serialNumber, startDate, endDate } = event.queryStringParameters;
    if (!serialNumber || !startDate || !endDate) {
        return { statusCode: 400, body: 'Missing required query parameters' };
    }
    try {
        console.log(`Aggregating Eddi data for serial number ${serialNumber} in range ${startDate} - ${endDate}`);
        const dataRecords = yield queryData(serialNumber, startDate, endDate);
        console.log('Data', dataRecords);
        const aggregatedData = dataRecords.reduce((acc, record) => {
            for (const key in acc) {
                acc[key] += record[key];
            }
            return acc;
        }, {
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
        });
        console.log('Aggregated data', aggregatedData);
        return { statusCode: 200, body: JSON.stringify(aggregatedData) };
    }
    catch (error) {
        console.error('Error querying data', error);
        return { statusCode: 500, body: 'Internal server error' };
    }
});
exports.handler = handler;
